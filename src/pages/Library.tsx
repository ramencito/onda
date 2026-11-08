import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, Heart, Trash2 } from "lucide-react";
import { fmtBytes } from "../lib/format";
import { useOnline } from "../hooks/useOnline";
import { useLibrary } from "../stores/library";
import Artwork from "../components/Artwork";
import TrackRow from "../components/TrackRow";

export default function Library() {
  const init = useLibrary((s) => s.init);
  const playlists = useLibrary((s) => s.playlists);
  const liked = useLibrary((s) => s.liked);
  const singles = useLibrary((s) => s.singles);
  const downloadedIds = useLibrary((s) => s.downloadedIds);
  const job = useLibrary((s) => s.job);
  const removeSingle = useLibrary((s) => s.removeSingle);
  const removePlaylist = useLibrary((s) => s.removePlaylist);
  const online = useOnline();
  const [usage, setUsage] = useState<number | null>(null);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    let cancelled = false;
    navigator.storage
      ?.estimate?.()
      .then((e) => {
        if (!cancelled) setUsage(e.usage ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [playlists, liked, singles, job, downloadedIds]);

  const playlistList = Object.values(playlists).sort((a, b) => b.downloadedAt - a.downloadedAt);
  const visibleSingles = singles.filter((t) => !liked.some((l) => l.id === t.id));
  const nothing = playlistList.length === 0 && visibleSingles.length === 0 && liked.length === 0;

  const confirmRemovePlaylist = (id: string, name: string) => {
    if (window.confirm(`¿Eliminar “${name}” de tus descargas?`)) void removePlaylist(id);
  };

  return (
    <div className="pb-4">
      <header
        className="sticky top-0 z-20 flex items-center justify-between bg-ink/95 px-4 pb-3 pt-5 backdrop-blur"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)" }}
      >
        <h1 className="text-[26px] font-black">Tu biblioteca</h1>
        {usage !== null && usage > 0 && (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-muted">
            {fmtBytes(usage)} usados
          </span>
        )}
      </header>

      {nothing && (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-2xl bg-white/10">
            <ArrowDownToLine size={34} className="text-accent" />
          </div>
          <p className="text-lg font-extrabold">Descarga playlists completas</p>
          <p className="mt-1.5 text-sm text-muted">
            En vez de bajar canción por canción, toca “Descargar” en cualquier playlist y tenla
            lista para escuchar sin datos.
          </p>
          <Link
            to={online ? "/" : "/search"}
            className="mt-5 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-black active:scale-95"
          >
            {online ? "Explorar playlists" : "Ver qué hay sin conexión"}
          </Link>
        </div>
      )}

      {!nothing && (
        <>
          {/* Gustos */}
          <Link
            to="/liked"
            className="mx-4 mt-1 flex items-center gap-3 rounded-xl bg-white/5 p-3 active:bg-white/10"
          >
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-pink-500 via-fuchsia-600 to-purple-700">
              <Heart size={30} fill="currentColor" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold">Canciones que te gustan</p>
              <p className="text-xs text-muted">
                Playlist · {liked.length} canciones
                {liked.length > 0 && " · descargables"}
              </p>
            </div>
          </Link>

          {/* Playlists descargadas */}
          {playlistList.length > 0 && (
            <section className="mt-5">
              <h2 className="mb-2.5 px-4 text-lg font-bold">Playlists descargadas</h2>
              <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3">
                {playlistList.map((pl) => (
                  <div key={pl.id} className="relative">
                    <Link to={`/playlist/${pl.id}`} className="group block active:scale-[0.98]">
                      <div className="relative">
                        <Artwork
                          cid={pl.cover}
                          alt={pl.name}
                          className="aspect-square w-full rounded-lg shadow-lg"
                        />
                        <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-accent text-black shadow">
                          <ArrowDownToLine size={15} strokeWidth={2.6} />
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-tight">
                        {pl.name}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                        {pl.tracks.length} canciones
                      </p>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Eliminar ${pl.name}`}
                      onClick={() => confirmRemovePlaylist(pl.id, pl.name)}
                      className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur active:scale-90"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Canciones descargadas sueltas */}
          {visibleSingles.length > 0 && (
            <section className="mt-5">
              <h2 className="mb-1 px-4 text-lg font-bold">
                Canciones descargadas ({visibleSingles.length})
              </h2>
              <div role="list">
                {visibleSingles.map((t, i) => (
                  <TrackRow
                    key={`${t.id}-${i}`}
                    track={t}
                    queue={visibleSingles}
                    position={i}
                    showArtwork
                    rightSlot={
                      <button
                        type="button"
                        aria-label="Eliminar descarga"
                        onClick={() => {
                          if (window.confirm("¿Eliminar esta descarga?")) void removeSingle(t.id);
                        }}
                        className="text-muted active:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
