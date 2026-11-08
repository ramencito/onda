import { Link } from "react-router-dom";
import type { Playlist } from "../api/audius";
import Artwork from "./Artwork";

export default function PlaylistCard({ pl, width = "w-36" }: { pl: Playlist; width?: string }) {
  return (
    <Link to={`/playlist/${pl.id}`} className={`group shrink-0 snap-start ${width}`}>
      <div className="relative">
        <Artwork
          cid={pl.cover}
          alt={pl.name}
          className="aspect-square w-full rounded-lg shadow-lg transition-transform duration-150 group-active:scale-95"
        />
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-tight">{pl.name}</p>
      <p className="mt-0.5 line-clamp-1 text-xs text-muted">
        {pl.trackCount > 0 ? `${pl.trackCount} canciones` : pl.owner}
      </p>
    </Link>
  );
}
