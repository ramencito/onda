import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, WifiOff } from "lucide-react";
import {
  trendingPlaylists,
  trendingTracks,
  type Playlist,
  type Track,
} from "../api/audius";
import { greeting } from "../lib/format";
import { useOnline } from "../hooks/useOnline";
import DownloadedGrid from "../components/DownloadedGrid";
import PlaylistCard from "../components/PlaylistCard";
import Row, { RowSkeleton } from "../components/Row";
import TrackCard from "../components/TrackCard";

const GENRE_ROWS: { genre: string; label: string }[] = [
  { genre: "Hip-Hop/Rap", label: "Éxitos en Hip-Hop" },
  { genre: "Electronic", label: "Para mover los pies" },
  { genre: "Latin", label: "Sonidos de Latinoamérica" },
  { genre: "Pop", label: "Pop para el día" },
];

export default function Home() {
  const online = useOnline();
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const [trending, setTrending] = useState<Track[] | null>(null);
  const [genreRows, setGenreRows] = useState<{ label: string; tracks: Track[] }[]>([]);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!online) return;
    let cancelled = false;
    setFailed(false);
    setPlaylists(null);
    setTrending(null);
    setGenreRows([]);

    (async () => {
      const [pl, tr, ...genres] = await Promise.all([
        trendingPlaylists().catch(() => null),
        trendingTracks().catch(() => null),
        ...GENRE_ROWS.map((row) => trendingTracks(row.genre).catch(() => [] as Track[])),
      ]);
      if (cancelled) return;

      setPlaylists(pl);
      setTrending(tr);
      setGenreRows(
        GENRE_ROWS.map((row, i) => ({ label: row.label, tracks: genres[i] })).filter(
          (r) => r.tracks.length > 0
        )
      );
      if (!pl && !tr) setFailed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [online, attempt]);

  /* ---------------- Sin conexión: solo tus descargas ---------------- */
  if (!online) {
    return (
      <div className="pb-4">
        <header className="flex items-center justify-between px-4 pt-5">
          <span className="text-2xl font-black tracking-tight">
            Onda<span className="text-accent">.</span>
          </span>
          <Link
            to="/library"
            className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-black text-black"
          >
            O
          </Link>
        </header>

        <div className="px-4 pb-5 pt-8 text-center">
          <WifiOff className="mx-auto mb-3 h-10 w-10 text-muted" />
          <h1 className="text-xl font-extrabold">Estás sin conexión</h1>
          <p className="mt-1 text-sm text-muted">
            Esto es lo que puedes escuchar sin datos:
          </p>
        </div>

        <DownloadedGrid />

        <div className="px-4 pt-6 text-center text-sm text-muted">
          Conéctate para descargar playlists nuevas.
        </div>
      </div>
    );
  }

  /* ---------------- Con conexión: portada tipo Spotify ---------------- */
  return (
    <div className="pb-4">
      <header className="flex items-center justify-between px-4 pt-5">
        <span className="text-2xl font-black tracking-tight">
          Onda<span className="text-accent">.</span>
        </span>
        <Link
          to="/library"
          className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-black text-black"
        >
          O
        </Link>
      </header>

      <h1 className="px-4 pb-1 pt-4 text-[26px] font-black leading-tight">{greeting()} 👋</h1>

      {failed ? (
        <div className="px-4 py-16 text-center">
          <p className="font-bold">No pudimos cargar el contenido</p>
          <p className="mt-1 text-sm text-muted">Revisa tu conexión e inténtalo de nuevo.</p>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black active:scale-95"
          >
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      ) : (
        <>
          {!playlists && <RowSkeleton title="Hecho para ti" />}
          {playlists && playlists.length > 0 && (
            <Row title="Hecho para ti">
              {playlists.map((pl) => (
                <PlaylistCard key={pl.id} pl={pl} />
              ))}
            </Row>
          )}

          {!trending && <RowSkeleton title="Tendencias ahora" />}
          {trending && trending.length > 0 && (
            <Row title="Tendencias ahora">
              {trending.map((t, i) => (
                <TrackCard key={`${t.id}-${i}`} track={t} queue={trending} position={i} />
              ))}
            </Row>
          )}

          {genreRows.map((row) => (
            <Row key={row.label} title={row.label}>
              {row.tracks.map((t, i) => (
                <TrackCard key={`${t.id}-${i}`} track={t} queue={row.tracks} position={i} />
              ))}
            </Row>
          ))}
        </>
      )}
    </div>
  );
}
