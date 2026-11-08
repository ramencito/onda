import { create } from "zustand";
import { del, get as idbGet, keys, set as idbSet } from "idb-keyval";
import type { Track } from "../api/audius";
import { downloadTrack } from "../lib/download";
import { useToast } from "./ui";

export interface DlPlaylist {
  id: string;
  name: string;
  cover: string | null;
  owner: string;
  tracks: Track[];
  downloadedAt: number;
}

export interface Job {
  id: string;
  name: string;
  done: number;
  total: number;
}

export const LIKED_JOB_ID = "__liked__";

const KEY_LIKED = "lib:liked";
const KEY_SINGLES = "dl:singles";
const prefix = (p: string, id: string) => `${p}${id}`;
const trackKey = (id: string) => prefix("dl:track:", id);
const metaKey = (id: string) => prefix("dl:meta:", id);
const playlistKey = (id: string) => prefix("dl:playlist:", id);

interface LibraryState {
  ready: boolean;
  liked: Track[];
  playlists: Record<string, DlPlaylist>;
  singles: Track[];
  downloadedIds: ReadonlySet<string>;
  pending: ReadonlySet<string>;
  job: Job | null;

  init: () => Promise<void>;
  toggleLike: (track: Track) => Promise<void>;
  downloadMany: (opts: { id: string; name: string; tracks: Track[]; asPlaylist?: DlPlaylist }) => Promise<void>;
  downloadSingle: (track: Track) => Promise<void>;
  removePlaylist: (id: string) => Promise<void>;
  removeSingle: (id: string) => Promise<void>;
  removeDownloads: (ids: string[]) => Promise<void>;
}

function addId(set_: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(set_);
  next.add(id);
  return next;
}

function dropIds(set_: ReadonlySet<string>, ids: string[]): ReadonlySet<string> {
  const next = new Set(set_);
  for (const id of ids) next.delete(id);
  return next;
}

export const useLibrary = create<LibraryState>()((set, get) => ({
  ready: false,
  liked: [],
  playlists: {},
  singles: [],
  downloadedIds: new Set<string>(),
  pending: new Set<string>(),
  job: null,

  async init() {
    if (get().ready) return;
    try {
      const allKeys = await keys();
      const strKeys = allKeys.filter((k): k is string => typeof k === "string");

      const downloadedIds = new Set(
        strKeys.filter((k) => k.startsWith("dl:track:")).map((k) => k.slice("dl:track:".length))
      );

      const playlistVals = await Promise.all(
        strKeys.filter((k) => k.startsWith("dl:playlist:")).map((k) => idbGet<DlPlaylist>(k))
      );
      const playlists: Record<string, DlPlaylist> = {};
      for (const p of playlistVals) if (p && p.id) playlists[p.id] = p;

      const singles = (await idbGet<Track[]>(KEY_SINGLES)) ?? [];
      const liked = (await idbGet<Track[]>(KEY_LIKED)) ?? [];

      set({ ready: true, liked, playlists, singles, downloadedIds });
    } catch {
      set({ ready: true });
    }
  },

  async toggleLike(track) {
    const liked = get().liked;
    const exists = liked.some((t) => t.id === track.id);
    const next = exists ? liked.filter((t) => t.id !== track.id) : [track, ...liked];
    set({ liked: next });
    try {
      await idbSet(KEY_LIKED, next);
    } catch {
      /* almacenamiento lleno */
    }
    useToast.getState().show(exists ? "Quitada de tus gustos" : "Agregada a tus gustos");
  },

  async downloadMany({ id, name, tracks, asPlaylist }) {
    const toast = useToast.getState();
    if (get().job) {
      toast.show("Espera a que termine la descarga actual", "err");
      return;
    }
    if (!tracks.length) {
      toast.show("No hay canciones para descargar", "err");
      return;
    }

    const already = tracks.filter((t) => get().downloadedIds.has(t.id)).length;
    const todo = tracks.filter((t) => !get().downloadedIds.has(t.id));
    if (!todo.length) {
      toast.show("Ya está descargada ✅");
      return;
    }

    set({ job: { id, name, done: already, total: tracks.length } });

    // Pedimos almacenamiento persistente para que el navegador no borre las descargas.
    try {
      await navigator.storage?.persist?.();
    } catch {
      /* no soportado */
    }

    let done = already;
    let cursor = 0;
    let failures = 0;

    const worker = async () => {
      while (cursor < todo.length) {
        const track = todo[cursor++];
        set((s) => ({ pending: addId(s.pending, track.id) }));
        try {
          await downloadTrack(track);
          done += 1;
          set((s) => ({
            downloadedIds: addId(s.downloadedIds, track.id),
            job: s.job ? { ...s.job, done } : null,
          }));
        } catch {
          failures += 1;
        } finally {
          set((s) => ({ pending: dropIds(s.pending, [track.id]) }));
        }
      }
    };

    await Promise.all([worker(), worker(), worker()]);

    if (asPlaylist) {
      try {
        await idbSet(playlistKey(asPlaylist.id), asPlaylist);
        set((s) => ({ playlists: { ...s.playlists, [asPlaylist.id]: asPlaylist } }));
      } catch {
        /* ignore */
      }
    }

    set({ job: null });

    if (failures === 0) {
      toast.show(`“${name}” lista para escuchar sin conexión ✅`);
    } else if (done > already) {
      toast.show(`Descargadas ${done - already} de ${todo.length} (${failures} fallaron)`, "err");
    } else {
      toast.show("No se pudo descargar. ¿Sin conexión?", "err");
    }
  },

  async downloadSingle(track) {
    const toast = useToast.getState();
    if (get().job) {
      toast.show("Espera a que termine la descarga actual", "err");
      return;
    }
    if (get().downloadedIds.has(track.id)) {
      toast.show("Ya está descargada ✅");
      return;
    }
    set((s) => ({ pending: addId(s.pending, track.id) }));
    try {
      await downloadTrack(track);
      const singles = [...get().singles.filter((t) => t.id !== track.id), track];
      await idbSet(KEY_SINGLES, singles);
      set((s) => ({
        downloadedIds: addId(s.downloadedIds, track.id),
        singles,
        pending: dropIds(s.pending, [track.id]),
      }));
      toast.show("Descargada para escuchar sin conexión ✅");
    } catch {
      set((s) => ({ pending: dropIds(s.pending, [track.id]) }));
      toast.show("No se pudo descargar. ¿Sin conexión?", "err");
    }
  },

  async removePlaylist(id) {
    const pl = get().playlists[id];
    if (!pl) return;
    const others = Object.values(get().playlists).filter((p) => p.id !== id);
    await removeBlobs(
      pl.tracks.map((t) => t.id),
      new Set(others.flatMap((p) => p.tracks.map((t) => t.id))),
      get()
    );
    await del(playlistKey(id));
    const playlists = { ...get().playlists };
    delete playlists[id];
    set({ playlists });
    useToast.getState().show("Descarga eliminada");
  },

  async removeSingle(id) {
    const singles = get().singles.filter((t) => t.id !== id);
    await idbSet(KEY_SINGLES, singles);
    const others = new Set(Object.values(get().playlists).flatMap((p) => p.tracks.map((t) => t.id)));
    await removeBlobs([id], others, get());
    set({ singles });
    useToast.getState().show("Descarga eliminada");
  },

  async removeDownloads(ids) {
    const others = new Set(Object.values(get().playlists).flatMap((p) => p.tracks.map((t) => t.id)));
    await removeBlobs(ids, others, get());
    useToast.getState().show("Descargas eliminadas");
  },
}));

/**
 * Borra blobs + metadatos de `ids`, salvo los que sigan referenciados
 * por otras listas (`protectedIds`) o por la lista de singles/liked.
 */
async function removeBlobs(
  ids: string[],
  protectedIds: Set<string>,
  state: Pick<LibraryState, "singles" | "liked" | "downloadedIds">
): Promise<void> {
  const keep = new Set(protectedIds);
  for (const s of state.singles) keep.add(s.id);
  for (const l of state.liked) keep.add(l.id);

  const remaining = new Set(state.downloadedIds);
  for (const id of ids) {
    if (keep.has(id)) continue;
    try {
      await del(trackKey(id));
      await del(metaKey(id));
    } catch {
      /* ignore */
    }
    remaining.delete(id);
  }
  useLibrary.setState({ downloadedIds: remaining });
}
