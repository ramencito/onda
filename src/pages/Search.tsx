import { useEffect, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { searchPlaylists, searchTracks, type Playlist, type Track } from "../api/audius";
import { useOnline } from "../hooks/useOnline";
import PlaylistCard from "../components/PlaylistCard";
import TrackRow from "../components/TrackRow";

const CATEGORIES: { name: string; from: string; to: string }[] = [
  { name: "Electronic", from: "from-indigo-600", to: "to-sky-400" },
  { name: "Hip-Hop/Rap", from: "from-orange-600", to: "to-amber-500" },
  { name: "Pop", from: "from-pink-600", to: "to-fuchsia-500" },
  { name: "Rock", from: "from-red-700", to: "to-rose-500" },
  { name: "Latin", from: "from-green-600", to: "to-emerald-400" },
  { name: "Jazz", from: "from-blue-700", to: "to-sky-500" },
  { name: "Ambient", from: "from-teal-600", to: "to-cyan-400" },
  { name: "R&B", from: "from-purple-700", to: "to-violet-500" },
  { name: "Classical", from: "from-slate-600", to: "to-zinc-400" },
  { name: "Metal", from: "from-zinc-700", to: "to-neutral-500" },
];

export default function Search() {
  const online = useOnline();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debounced) {
      setTracks(null);
      setPlaylists([]);
      setFailed(false);
      return;
    }
    if (!online) return;

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    Promise.all([
      searchTracks(debounced).catch(() => null),
      searchPlaylists(debounced).catch(() => [] as Playlist[]),
    ]).then(([foundTracks, foundPlaylists]) => {
      if (cancelled) return;
      setTracks(foundTracks ?? []);
      setPlaylists(foundPlaylists ?? []);
      setFailed(foundTracks === null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [debounced, online]);

  const showResults = Boolean(debounced);
  const empty = tracks !== null && tracks.length === 0 && playlists.length === 0;

  return (
    <div className="pb-4">
      <header className="sticky top-0 z-20 bg-ink/95 px-4 pb-3 pt-5 backdrop-blur">
        <h1 className="mb-3 text-[26px] font-black">Buscar</h1>
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-3">
          <SearchIcon size={19} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Canciones, artistas o playlists"
            inputMode="search"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-muted"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpiar">
              <X size={18} className="text-muted" />
            </button>
          )}
        </div>
      </header>

      {!online && (
        <p className="px-4 py-8 text-center text-sm text-muted">
          Necesitas conexión para buscar. Tus descargas están en la Biblioteca.
        </p>
      )}

      {online && showResults && loading && tracks === null && (
        <div className="space-y-3 px-4 pt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {online && showResults && failed && (
        <p className="px-4 py-10 text-center text-sm text-muted">
          No se pudo buscar. Revisa tu conexión.
        </p>
      )}

      {online && showResults && !failed && empty && !loading && (
        <div className="px-4 py-12 text-center">
          <p className="font-bold">Sin resultados para “{debounced}”</p>
          <p className="mt-1 text-sm text-muted">Prueba con otras palabras.</p>
        </div>
      )}

      {online && showResults && !failed && !empty && (
        <>
          {playlists.length > 0 && (
            <section className="mt-2">
              <h2 className="mb-2.5 px-4 text-lg font-bold">Playlists</h2>
              <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3">
                {playlists.map((pl) => (
                  <PlaylistCard key={pl.id} pl={pl} width="w-full" />
                ))}
              </div>
            </section>
          )}

          {(tracks?.length ?? 0) > 0 && (
            <section className="mt-5">
              <h2 className="mb-1 px-4 text-lg font-bold">Canciones</h2>
              <div role="list">
                {tracks!.map((t, i) => (
                  <TrackRow
                    key={`${t.id}-${i}`}
                    track={t}
                    queue={tracks!}
                    position={i}
                    showArtwork
                    showDownload
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {online && !showResults && (
        <section className="mt-2">
          <h2 className="mb-3 px-4 text-lg font-bold">Explorar todo</h2>
          <div className="grid grid-cols-2 gap-3 px-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setQuery(c.name)}
                className={`relative aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br ${c.from} ${c.to} p-3 text-left active:scale-[0.97]`}
              >
                <span className="text-[15px] font-extrabold leading-tight drop-shadow">
                  {c.name}
                </span>
                <span className="absolute -bottom-3 -right-3 h-16 w-16 rotate-[25deg] rounded-lg bg-black/25 shadow-lg" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
