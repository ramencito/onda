import { useLocation, useNavigate } from "react-router-dom";
import { Pause, Play, SkipForward } from "lucide-react";
import { usePlayer } from "../stores/player";
import Artwork from "./Artwork";

/** Barra mini fija arriba de la navegación. Toca para ver el reproductor completo. */
export default function MiniPlayer() {
  const track = usePlayer((s) => s.queue[s.index] ?? null);
  const playing = usePlayer((s) => s.playing);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!track || pathname === "/player") return null;

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div className="px-2 pb-1">
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate("/player")}
        onKeyDown={(e) => e.key === "Enter" && navigate("/player")}
        className="relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl bg-card px-2.5 py-2 shadow-lg active:scale-[0.99]"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-white/10">
          <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>

        <Artwork cid={track.artwork} className="h-10 w-10 shrink-0 rounded-md" alt="" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{track.title}</p>
          <p className="truncate text-xs text-muted">{track.artist}</p>
        </div>

        <button
          type="button"
          aria-label={playing ? "Pausar" : "Reproducir"}
          onClick={(e) => {
            e.stopPropagation();
            usePlayer.getState().toggle();
          }}
          className="grid h-9 w-9 place-items-center rounded-full text-white active:scale-90"
        >
          {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          onClick={(e) => {
            e.stopPropagation();
            usePlayer.getState().next(true);
          }}
          className="grid h-9 w-9 place-items-center rounded-full text-white active:scale-90"
        >
          <SkipForward size={22} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
