import { get, set } from "idb-keyval";
import { streamUrl, type Track } from "../api/audius";

const trackKey = (id: string) => `dl:track:${id}`;
const metaKey = (id: string) => `dl:meta:${id}`;

export async function isDownloaded(id: string): Promise<boolean> {
  return (await get(trackKey(id))) !== undefined;
}

/**
 * Descarga el audio completo de una canción y lo guarda en IndexedDB.
 * Idempotente: si ya existe, no hace nada.
 */
export async function downloadTrack(track: Track): Promise<void> {
  if (await isDownloaded(track.id)) return;
  const res = await fetch(streamUrl(track.id));
  if (!res.ok) throw new Error(`No se pudo descargar (${res.status})`);
  const blob = await res.blob();
  if (blob.size === 0) throw new Error("Archivo vacío");
  await set(trackKey(track.id), blob);
  await set(metaKey(track.id), track);
}
