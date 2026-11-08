import { Link } from "react-router-dom";
import { ArrowDownToLine, Heart } from "lucide-react";
import { useLibrary } from "../stores/library";
import Artwork from "./Artwork";

/**
 * Cuadrícula con lo que ya tienes guardado (playlist descargadas + gustos).
 * Se usa en el inicio cuando no hay conexión y en la biblioteca.
 */
export default function DownloadedGrid() {
  const playlists = useLibrary((s) => s.playlists);
  const liked = useLibrary((s) => s.liked);
  const list = Object.values(playlists).sort((a, b) => b.downloadedAt - a.downloadedAt);

  if (!list.length && liked.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3">
      {liked.length > 0 && (
        <Link to="/liked" className="group active:scale-[0.98]">
          <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-pink-500 via-fuchsia-600 to-purple-700 shadow-lg">
            <Heart size={56} fill="currentColor" className="text-white drop-shadow" />
            <span className="absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
              {liked.length} descargadas
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-tight">
            Canciones que te gustan
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">Playlist · {liked.length} canciones</p>
        </Link>
      )}

      {list.map((pl) => (
        <Link key={pl.id} to={`/playlist/${pl.id}`} className="group active:scale-[0.98]">
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
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-tight">{pl.name}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">
            Playlist · {pl.tracks.length} canciones
          </p>
        </Link>
      ))}
    </div>
  );
}
