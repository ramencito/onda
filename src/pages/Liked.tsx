import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Play, Shuffle } from "lucide-react";
import { LIKED_JOB_ID, useLibrary } from "../stores/library";
import { usePlayer } from "../stores/player";
import DownloadButton from "../components/DownloadButton";
import TrackRow from "../components/TrackRow";

export default function Liked() {
  const liked = useLibrary((s) => s.liked);
  const toggleLike = useLibrary((s) => s.toggleLike);
  const navigate = useNavigate();
  const location = useLocation();

  const back = () => {
    if (location.key === "default") navigate("/", { replace: true });
    else navigate(-1);
  };

  const playAll = () => usePlayer.getState().playQueue(liked, 0);

  const playShuffled = () => {
    usePlayer.setState({ shuffle: true });
    const i = Math.floor(Math.random() * liked.length);
    usePlayer.getState().playQueue(liked, i);
  };

  return (
    <div className="pb-4">
      <div className="relative overflow-hidden bg-gradient-to-b from-pink-600/45 to-transparent px-4 pb-5 pt-4">
        <button
          type="button"
          onClick={back}
          className="grid h-10 w-10 place-items-center rounded-full bg-black/25 active:bg-white/10"
          aria-label="Volver"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="mt-3 flex flex-col items-center text-center">
          <div className="grid h-40 w-40 place-items-center rounded-lg bg-gradient-to-br from-pink-500 via-fuchsia-600 to-purple-700 shadow-2xl">
            <Heart size={64} fill="currentColor" className="text-white" />
          </div>
          <h1 className="mt-4 text-[22px] font-black leading-tight">Canciones que te gustan</h1>
          <p className="mt-1 text-sm text-muted">{liked.length} canciones</p>
        </div>

        {liked.length > 0 && (
          <>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={playAll}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-bold text-black active:scale-[0.98]"
              >
                <Play size={20} fill="currentColor" />
                Reproducir
              </button>
              <button
                type="button"
                onClick={playShuffled}
                aria-label="Aleatorio"
                className="grid h-12 w-12 place-items-center rounded-full border border-white/25 text-white active:scale-95"
              >
                <Shuffle size={20} />
              </button>
            </div>
            <div className="mt-3">
              <DownloadButton
                id={LIKED_JOB_ID}
                name="Canciones que te gustan"
                tracks={liked}
              />
            </div>
          </>
        )}
      </div>

      {liked.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="text-lg font-extrabold">Aún no tienes gustos</p>
          <p className="mt-1.5 text-sm text-muted">
            Toca el corazón de cualquier canción y aparecerá aquí, lista para descargarla de una.
          </p>
        </div>
      ) : (
        <div className="mt-2" role="list">
          {liked.map((t, i) => (
            <TrackRow
              key={`${t.id}-${i}`}
              track={t}
              queue={liked}
              position={i}
              showArtwork
              showDownload
              rightSlot={
                <button
                  type="button"
                  aria-label="Quitar de gustos"
                  onClick={() => void toggleLike(t)}
                  className="text-accent active:scale-90"
                >
                  <Heart size={17} fill="currentColor" />
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
