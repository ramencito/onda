import type { ReactNode } from "react";
import { Check, Download, WifiOff } from "lucide-react";
import type { Track } from "../api/audius";
import { fmtTime } from "../lib/format";
import { useOnline } from "../hooks/useOnline";
import { usePlayer } from "../stores/player";
import { useLibrary } from "../stores/library";
import { useToast } from "../stores/ui";
import Artwork from "./Artwork";
import EqBars from "./EqBars";

interface Props {
  track: Track;
  queue: Track[];
  position: number;
  index?: number;
  showArtwork?: boolean;
  showDownload?: boolean;
  rightSlot?: ReactNode;
}

export default function TrackRow({
  track,
  queue,
  position,
  index,
  showArtwork = false,
  showDownload = false,
  rightSlot,
}: Props) {
  const isCurrent = usePlayer((s) => s.queue[s.index]?.id === track.id);
  const isPlaying = usePlayer((s) => s.playing);
  const downloaded = useLibrary((s) => s.downloadedIds.has(track.id));
  const pendingDl = useLibrary((s) => s.pending.has(track.id));
  const downloadSingle = useLibrary((s) => s.downloadSingle);
  const online = useOnline();
  const toast = useToast((s) => s.show);

  const unavailable = !online && !downloaded;

  const handlePlay = () => {
    if (unavailable) {
      toast("Sin conexión: esta canción no está descargada", "err");
      return;
    }
    usePlayer.getState().playQueue(queue, position);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    void downloadSingle(track);
  };

  return (
    <div
      className={`flex items-center gap-2 px-4 py-1.5 ${unavailable ? "opacity-45" : ""}`}
      role="listitem"
    >
      <button
        type="button"
        onClick={handlePlay}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {showArtwork ? (
          <Artwork cid={track.artwork} className="h-11 w-11 shrink-0 rounded" alt="" />
        ) : (
          <span className="w-6 shrink-0 text-center text-sm tabular-nums text-muted">
            {isCurrent ? <EqBars playing={isPlaying} /> : (index ?? position + 1)}
          </span>
        )}
        <span className="min-w-0">
          <span
            className={`block truncate text-[15px] font-medium ${isCurrent ? "text-accent" : ""}`}
          >
            {track.title}
          </span>
          <span className="block truncate text-[13px] text-muted">
            {unavailable ? "Sin conexión · no descargada" : track.artist}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-3 pl-1">
        {rightSlot}
        {showDownload &&
          (pendingDl ? (
            <span className="spinner text-muted" title="Descargando…" />
          ) : downloaded ? (
            <span className="text-accent" title="Descargada">
              <Check size={16} strokeWidth={2.5} />
            </span>
          ) : (
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Descargar canción"
              className="text-muted transition hover:text-white active:scale-90"
            >
              <Download size={16} />
            </button>
          ))}
        {unavailable && !showDownload && <WifiOff size={15} className="text-muted" />}
        <span className="w-9 text-right text-[13px] tabular-nums text-muted">
          {fmtTime(track.duration)}
        </span>
      </div>
    </div>
  );
}
