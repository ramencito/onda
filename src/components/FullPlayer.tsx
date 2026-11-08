import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Heart, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { artworkUrl } from "../api/audius";
import { fmtTime } from "../lib/format";
import { useLibrary } from "../stores/library";
import { usePlayer } from "../stores/player";
import Artwork from "./Artwork";
import EqBars from "./EqBars";
import SeekBar from "./SeekBar";

/** Reproductor a pantalla completa. */
export default function FullPlayer() {
  const track = usePlayer((s) => s.queue[s.index] ?? null);
  const queue = usePlayer((s) => s.queue);
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const error = usePlayer((s) => s.error);

  const liked = useLibrary((s) => (track ? s.liked.some((t) => t.id === track.id) : false));
  const toggleLike = useLibrary((s) => s.toggleLike);

  const navigate = useNavigate();
  const location = useLocation();

  if (!track) return <Navigate to="/" replace />;

  const art = artworkUrl(track.artwork, 640);

  const back = () => {
    if (location.key === "default") navigate("/", { replace: true });
    else navigate(-1);
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-[#0d0d12]">
      {/* Fondo: la portada desenfocada, estilo Spotify */}
      {art && (
        <img
          src={art}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-[60px]"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />

      <div
        className="relative flex h-full flex-col px-5"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 6px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)",
        }}
      >
        <header className="flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={back}
            aria-label="Cerrar"
            className="grid h-10 w-10 place-items-center rounded-full active:bg-white/10"
          >
            <ChevronDown size={26} />
          </button>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            Reproduciendo ahora
          </span>
          <span className="w-10" />
        </header>

        <div className="mt-3 flex flex-none justify-center">
          <div className="aspect-square h-[min(34vh,330px)] max-w-[86vw]">
            <Artwork
              cid={track.artwork}
              alt={track.title}
              className="h-full w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-none items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[26px] font-extrabold leading-tight">{track.title}</h1>
            <p className="truncate text-[15px] text-white/60">{track.artist}</p>
          </div>
          <button
            type="button"
            onClick={() => void toggleLike(track)}
            aria-label={liked ? "Quitar de gustos" : "Agregar a gustos"}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full active:scale-90 ${
              liked ? "text-accent" : "text-white/70"
            }`}
          >
            <Heart size={24} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-2 flex-none">
          <SeekBar value={progress} max={duration} onSeek={(v) => usePlayer.getState().seek(v)} />
          <div className="flex justify-between text-[11px] tabular-nums text-white/55">
            <span>{fmtTime(progress)}</span>
            <span>{fmtTime(duration)}</span>
          </div>
          {error && <p className="mt-0.5 text-center text-xs text-red-400">{error}</p>}
        </div>

        <div className="mt-1.5 flex flex-none items-center justify-between px-1">
          <button
            type="button"
            onClick={() => usePlayer.getState().toggleShuffle()}
            aria-label="Aleatorio"
            className={`grid h-10 w-10 place-items-center rounded-full active:scale-90 ${
              shuffle ? "text-accent" : "text-white/70"
            }`}
          >
            <Shuffle size={21} />
          </button>
          <button
            type="button"
            onClick={() => usePlayer.getState().prev()}
            aria-label="Anterior"
            className="grid h-12 w-12 place-items-center rounded-full text-white active:scale-90"
          >
            <SkipBack size={30} fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={() => usePlayer.getState().toggle()}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className="grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-xl active:scale-95"
          >
            {playing ? (
              <Pause size={30} fill="currentColor" />
            ) : (
              <Play size={30} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => usePlayer.getState().next(true)}
            aria-label="Siguiente"
            className="grid h-12 w-12 place-items-center rounded-full text-white active:scale-90"
          >
            <SkipForward size={30} fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={() => usePlayer.getState().cycleRepeat()}
            aria-label="Repetir"
            className={`relative grid h-10 w-10 place-items-center rounded-full active:scale-90 ${
              repeat !== "off" ? "text-accent" : "text-white/70"
            }`}
          >
            <Repeat size={21} />
            {repeat === "one" && (
              <span className="absolute right-1 top-1 text-[9px] font-black">1</span>
            )}
          </button>
        </div>

        <div className="no-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-white/60">
            A continuación
          </h2>
          <div role="list">
            {queue.map((t, i) => (
              <button
                key={`${t.id}-${i}`}
                type="button"
                role="listitem"
                onClick={() => usePlayer.getState().playQueue(queue, i)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left active:bg-white/5"
              >
                <Artwork cid={t.artwork} className="h-10 w-10 shrink-0 rounded" alt="" />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm font-medium ${
                      i === index ? "text-accent" : ""
                    }`}
                  >
                    {t.title}
                  </span>
                  <span className="block truncate text-xs text-white/50">{t.artist}</span>
                </span>
                {i === index && <EqBars playing={playing} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
