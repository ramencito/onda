import type { Track } from "../api/audius";
import { usePlayer } from "../stores/player";
import Artwork from "./Artwork";

/** Tarjeta de canción (fila horizontal tipo "Tendencias"). */
export default function TrackCard({
  track,
  queue,
  position,
}: {
  track: Track;
  queue: Track[];
  position: number;
}) {
  const play = () => usePlayer.getState().playQueue(queue, position);

  return (
    <button type="button" onClick={play} className="w-32 shrink-0 snap-start text-left">
      <Artwork
        cid={track.artwork}
        alt={track.title}
        className="aspect-square w-full rounded-lg shadow-lg transition-transform duration-150 active:scale-95"
      />
      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-tight">{track.title}</p>
      <p className="mt-0.5 line-clamp-1 text-xs text-muted">{track.artist}</p>
    </button>
  );
}
