import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Play, Shuffle, WifiOff } from "lucide-react";
import { getPlaylist, type PlaylistDetail } from "../api/audius";
import { fmtTotalTime } from "../lib/format";
import { useLibrary } from "../stores/library";
import { usePlayer } from "../stores/player";
import Artwork from "../components/Artwork";
import DownloadButton from "../components/DownloadButton";
import TrackRow from "../components/TrackRow";

export default function Playlist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [pl, setPl] = useState<PlaylistDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const back = () => {
    if (location.key === "default") navigate("/", { replace: true });
    else navigate(-1);
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStatus("loading");

    const fromCache = useLibrary.getState().playlists[id];

    // Sin conexión: usamos la descarga local, si existe.
    if (!navigator.onLine && fromCache) {
      setPl({ ...fromCache, trackCount: fromCache.tracks.length });
      setStatus("ready");
      return;
    }

    getPlaylist(id)
      .then((detail) => {
        if (cancelled) return;
        setPl(detail);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        const cached = useLibrary.getState().playlists[id];
        if (cached) {
          setPl({ ...cached, trackCount: cached.tracks.length });
          setStatus("ready");
        } else {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="px-4 pt-6">
        <div className="mx-auto h-44 w-44 animate-pulse rounded-lg bg-white/10" />
        <div className="mx-auto mt-5 h-5 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="mx-auto mt-2.5 h-3.5 w-1/3 animate-pulse rounded bg-white/5" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error" || !pl) {
    return (
      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={back}
          className="grid h-10 w-10 place-items-center rounded-full active:bg-white/10"
          aria-label="Volver"
        >
          <ChevronLeft size={26} />
        </button>
        <div className="py-16 text-center">
          <WifiOff className="mx-auto mb-3 h-9 w-9 text-muted" />
          <p className="font-bold">No se pudo cargar la playlist</p>
          <p className="mt-1 text-sm text-muted">
            Si la descargaste antes, ábrela desde tu Biblioteca.
          </p>
          <Link
            to="/library"
            className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black"
          >
            Ir a Biblioteca
          </Link>
        </div>
      </div>
    );
  }

  const total = pl.tracks.reduce((sum, t) => sum + t.duration, 0);

  const playAll = () => usePlayer.getState().playQueue(pl.tracks, 0);

  const playShuffled = () => {
    usePlayer.setState({ shuffle: true });
    const i = Math.floor(Math.random() * pl.tracks.length);
    usePlayer.getState().playQueue(pl.tracks, i);
  };

  return (
    <div className="pb-4">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#33333f] via-[#1e1e26] to-transparent" />
        <div className="relative px-4 pt-4">
          <button
            type="button"
            onClick={back}
            className="grid h-10 w-10 place-items-center rounded-full bg-black/25 active:bg-white/10"
            aria-label="Volver"
          >
            <ChevronLeft size={26} />
          </button>

          <div className="mt-3 flex flex-col items-center text-center">
            <Artwork
              cid={pl.cover}
              alt={pl.name}
              className="h-44 w-44 rounded-lg shadow-2xl"
            />
            <h1 className="mt-4 text-[22px] font-black leading-tight">{pl.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {pl.owner && `por ${pl.owner}`}
              {pl.trackCount > 0 && ` · ${pl.trackCount} canciones`}
            </p>
            <p className="mt-0.5 text-xs text-muted">{fmtTotalTime(total)}</p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={playAll}
              disabled={pl.tracks.length === 0}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-bold text-black active:scale-[0.98] disabled:opacity-40"
            >
              <Play size={20} fill="currentColor" />
              Reproducir
            </button>
            <button
              type="button"
              onClick={playShuffled}
              disabled={pl.tracks.length === 0}
              aria-label="Aleatorio"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/25 text-white active:scale-95 disabled:opacity-40"
            >
              <Shuffle size={20} />
            </button>
          </div>

          <div className="mt-3">
            <DownloadButton
              id={pl.id}
              name={pl.name}
              tracks={pl.tracks}
              asPlaylist={{
                id: pl.id,
                name: pl.name,
                cover: pl.cover,
                owner: pl.owner,
                tracks: pl.tracks,
                downloadedAt: Date.now(),
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4" role="list">
        {pl.tracks.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Esta playlist no tiene canciones.
          </p>
        ) : (
          pl.tracks.map((t, i) => (
            <TrackRow
              key={`${t.id}-${i}`}
              track={t}
              queue={pl.tracks}
              position={i}
              index={i + 1}
              showDownload
            />
          ))
        )}
      </div>
    </div>
  );
}
