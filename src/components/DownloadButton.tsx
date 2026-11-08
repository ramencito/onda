import { Check, Download } from "lucide-react";
import type { DlPlaylist } from "../stores/library";
import { LIKED_JOB_ID, useLibrary } from "../stores/library";
import type { Track } from "../api/audius";

interface Props {
  /** Identificador de la descarga (id de playlist o "__liked__"). */
  id: string;
  name: string;
  tracks: Track[];
  /** Si es una playlist, aquí van sus datos para guardarla como descarga. */
  asPlaylist?: DlPlaylist;
}

/**
 * Botón grande de descarga con tres estados:
 *  - Descargar (o "Continuar" si hay descargas parciales)
 *  - Descargando: barra de progreso "5/12"
 *  - Descargado: pulsa para eliminar la descarga
 */
export default function DownloadButton({ id, name, tracks, asPlaylist }: Props) {
  const job = useLibrary((s) => (s.job?.id === id ? s.job : null));
  const downloadedIds = useLibrary((s) => s.downloadedIds);
  const downloadMany = useLibrary((s) => s.downloadMany);
  const removePlaylist = useLibrary((s) => s.removePlaylist);
  const removeDownloads = useLibrary((s) => s.removeDownloads);
  const liked = useLibrary((s) => s.liked);

  if (!tracks.length) return null;

  const doneCount = tracks.filter((t) => downloadedIds.has(t.id)).length;
  const allDone = doneCount === tracks.length;
  const someDone = doneCount > 0;

  if (job) {
    const pct = Math.round((job.done / job.total) * 100);
    return (
      <div className="relative h-11 min-w-[150px] overflow-hidden rounded-full bg-white/10 px-5 text-sm font-semibold text-white">
        <div
          className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
        <span className="relative flex h-full items-center justify-center gap-2">
          <span className="spinner" />
          {job.done}/{job.total}
        </span>
      </div>
    );
  }

  const handleRemove = () => {
    const ok = window.confirm(
      id === LIKED_JOB_ID
        ? "¿Quitar las descargas de tus gustos? (se mantendrán las canciones en tu lista)"
        : `¿Eliminar “${name}” de tus descargas?`
    );
    if (!ok) return;
    if (id === LIKED_JOB_ID) {
      void removeDownloads(liked.map((t) => t.id));
    } else {
      void removePlaylist(id);
    }
  };

  if (allDone) {
    return (
      <button
        type="button"
        onClick={handleRemove}
        className="flex h-11 items-center gap-2 rounded-full border border-accent/60 bg-accent/10 px-5 text-sm font-semibold text-accent active:scale-[0.98]"
      >
        <Check size={17} strokeWidth={2.5} />
        Descargado
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void downloadMany({ id, name, tracks, asPlaylist })}
      className="flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-black active:scale-[0.98]"
    >
      <Download size={17} strokeWidth={2.5} />
      {someDone ? `Continuar (${doneCount}/${tracks.length})` : "Descargar"}
    </button>
  );
}
