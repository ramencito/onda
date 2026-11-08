import { create } from "zustand";
import { get as idbGet } from "idb-keyval";
import { artworkUrl, streamUrl, type Track } from "../api/audius";
import { useLibrary } from "./library";
import { useToast } from "./ui";

const audio = new Audio();
audio.preload = "auto";

/** URLs de blob ya creadas (descargas locales), para no recrearlas. */
const blobUrls = new Map<string, string>();

/**
 * Devuelve la URL de reproducción de una canción:
 *  - si está descargada → blob local (funciona sin conexión)
 *  - si no → streaming de Audius
 */
export async function resolveStream(trackId: string): Promise<string> {
  const cached = blobUrls.get(trackId);
  if (cached) return cached;
  try {
    const blob = await idbGet<Blob>(`dl:track:${trackId}`);
    if (blob) {
      const url = URL.createObjectURL(blob);
      blobUrls.set(trackId, url);
      return url;
    }
  } catch {
    /* ignore */
  }
  return streamUrl(trackId);
}

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  queue: Track[];
  index: number;
  playing: boolean;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;

  playQueue: (tracks: Track[], startIndex?: number) => void;
  toggle: () => void;
  next: (manual?: boolean) => void;
  prev: () => void;
  seek: (seconds: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

let loadToken = 0;
let loading = false;
let errorStreak = 0;

function applyMediaSession(track: Track): void {
  if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
  try {
    const artwork = artworkUrl(track.artwork, 0); // original: siempre disponible
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: "Onda",
      artwork: artwork ? [{ src: artwork, sizes: "512x512", type: "image/jpeg" }] : [],
    });
  } catch {
    /* ignore */
  }
}

async function loadIndex(index: number, autoplay: boolean): Promise<void> {
  const state = usePlayer.getState();
  const track = state.queue[index];
  if (!track) return;

  const token = ++loadToken;
  loading = true;
  usePlayer.setState({ index, progress: 0, duration: track.duration || 0, error: null });

  try {
    const url = await resolveStream(track.id);
    if (token !== loadToken) return;
    audio.src = url;
    applyMediaSession(track);
    if (autoplay) {
      try {
        await audio.play();
        errorStreak = 0;
      } catch {
        // Bloqueo de autoplay: el usuario puede tocar play.
        usePlayer.setState({ playing: false });
      }
    }
  } catch {
    if (token === loadToken) {
      usePlayer.setState({ error: "No se pudo cargar la canción", playing: false });
    }
  } finally {
    if (token === loadToken) loading = false;
  }
}

function pickNext(manual: boolean): number | null {
  const { queue, index, shuffle, repeat } = usePlayer.getState();
  if (queue.length === 0) return null;

  if (shuffle) {
    if (queue.length === 1) return 0;
    let next = index;
    while (next === index) next = Math.floor(Math.random() * queue.length);
    return next;
  }

  const isLast = index >= queue.length - 1;
  if (!isLast) return index + 1;
  if (manual || repeat === "all" || repeat === "one") return 0;
  return null; // terminó y repetición apagada
}

export const usePlayer = create<PlayerState>()((set, get) => ({
  queue: [],
  index: -1,
  playing: false,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: "off",
  error: null,

  playQueue(tracks, startIndex = 0) {
    if (!tracks.length) return;

    let list = tracks;
    let start = Math.min(Math.max(startIndex, 0), tracks.length - 1);

    // Sin conexión solo tiene sentido lo descargado.
    if (!navigator.onLine) {
      const downloaded = useLibrary.getState().downloadedIds;
      const selected = tracks[start];
      const filtered = tracks.filter((t) => downloaded.has(t.id));
      if (!filtered.length) {
        useToast.getState().show("Sin conexión: esta lista no está descargada", "err");
        return;
      }
      if (downloaded.has(selected.id)) {
        start = filtered.findIndex((t) => t.id === selected.id);
      } else {
        useToast.getState().show("Sin conexión: esa canción no está descargada", "err");
        start = 0;
      }
      list = filtered;
    }

    errorStreak = 0;
    set({ queue: list, index: start, error: null });
    void loadIndex(start, true);
  },

  toggle() {
    const { queue, index, playing } = get();
    if (index < 0 || !queue[index] || !audio.src) return;
    if (playing) {
      audio.pause();
      return;
    }
    const p = audio.play();
    if (p) p.catch(() => usePlayer.setState({ playing: false }));
  },

  next(manual = false) {
    const target = pickNext(manual);
    if (target === null) {
      set({ playing: false, progress: 0 });
      audio.pause();
      return;
    }
    errorStreak = 0;
    void loadIndex(target, true);
  },

  prev() {
    const { progress, index, queue } = get();
    if (index < 0 || !queue[index]) return;
    if (progress > 3) {
      audio.currentTime = 0;
      set({ progress: 0 });
      return;
    }
    const target = index === 0 ? queue.length - 1 : index - 1;
    errorStreak = 0;
    void loadIndex(target, true);
  },

  seek(seconds) {
    if (!audio.src) return;
    audio.currentTime = seconds;
    set({ progress: seconds });
  },

  toggleShuffle() {
    set({ shuffle: !get().shuffle });
  },

  cycleRepeat() {
    const order: RepeatMode[] = ["off", "all", "one"];
    const current = order.indexOf(get().repeat);
    set({ repeat: order[(current + 1) % order.length] });
  },
}));

/* ---------- sincronización con el elemento <audio> ---------- */

audio.addEventListener("timeupdate", () => {
  usePlayer.setState({ progress: audio.currentTime });
});

audio.addEventListener("loadedmetadata", () => {
  if (Number.isFinite(audio.duration)) usePlayer.setState({ duration: audio.duration });
});

audio.addEventListener("play", () => usePlayer.setState({ playing: true }));
audio.addEventListener("pause", () => usePlayer.setState({ playing: false }));

audio.addEventListener("ended", () => {
  const { repeat } = usePlayer.getState();
  if (repeat === "one") {
    audio.currentTime = 0;
    void audio.play().catch(() => {});
    return;
  }
  const target = pickNext(false);
  if (target === null) {
    usePlayer.setState({ playing: false, progress: 0 });
    return;
  }
  void loadIndex(target, true);
});

audio.addEventListener("error", () => {
  if (loading || !audio.src) return;
  errorStreak += 1;
  const { queue, index } = usePlayer.getState();

  if (errorStreak > queue.length) {
    usePlayer.setState({ playing: false, error: "No se pudo reproducir. ¿Sin conexión?" });
    errorStreak = 0;
    return;
  }

  usePlayer.setState({ error: "Esta canción no está disponible" });
  const target = pickNext(false);
  if (target !== null && target !== index) {
    setTimeout(() => void loadIndex(target, true), 700);
  } else {
    usePlayer.setState({ playing: false });
  }
});

/* ---------- controles desde la pantalla de bloqueo / audífonos ---------- */

function setMediaHandler(
  action: MediaSessionAction,
  handler: MediaSessionActionHandler | null
): void {
  if (!("mediaSession" in navigator)) return;
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {
    /* acción no soportada */
  }
}

setMediaHandler("play", () => usePlayer.getState().toggle());
setMediaHandler("pause", () => usePlayer.getState().toggle());
setMediaHandler("nexttrack", () => usePlayer.getState().next(true));
setMediaHandler("previoustrack", () => usePlayer.getState().prev());
