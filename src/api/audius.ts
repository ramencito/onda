/**
 * Cliente de la API pública de Audius (música gratuita de artistas
 * independientes, sin registro). El `app_name` es un identificador libre.
 */

const HOST = "https://discoveryprovider.audius.co";
const ARTWORK_HOST = "https://creatornode.audius.co";
const APP_NAME = "onda";

export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string | null;
  duration: number;
  genre?: string;
}

export interface Playlist {
  id: string;
  name: string;
  cover: string | null;
  owner: string;
  trackCount: number;
  description?: string;
}

export interface PlaylistDetail extends Playlist {
  tracks: Track[];
}

async function get<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const url = new URL(HOST + path);
  url.searchParams.set("app_name", APP_NAME);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Audius respondió ${res.status}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normTrack(t: any): Track {
  return {
    id: String(t.id),
    title: t.title ?? "Sin título",
    artist: t.user?.name ?? "Artista desconocido",
    artwork: t.cover_art_sizes ?? t.cover_art ?? null,
    duration: Number(t.duration ?? 0),
    genre: t.genre ?? undefined,
  };
}

function normPlaylist(p: any): Playlist {
  return {
    id: String(p.playlist_id ?? p.id),
    name: p.playlist_name ?? "Playlist",
    cover: p.cover_art_sizes ?? p.cover_art ?? null,
    owner: p.user?.name ?? "Onda",
    trackCount: Number(p.track_count ?? p.tracks?.length ?? 0),
    description: p.description ?? undefined,
  };
}

export function artworkUrl(cid: string | null | undefined, size = 1000): string | null {
  if (!cid) return null;
  // size = 0 → imagen original (todos los tamaños precalculados no existen en todos los CID)
  if (size === 0) return `${ARTWORK_HOST}/ipfs/${cid}`;
  return `${ARTWORK_HOST}/ipfs/${cid}/${size}x${size}.jpg`;
}

export function streamUrl(trackId: string): string {
  return `${HOST}/v1/tracks/${trackId}/stream?app_name=${APP_NAME}`;
}

export async function searchTracks(query: string): Promise<Track[]> {
  const data = await get<any[]>("/v1/tracks/search", { query, limit: 30 });
  return (data ?? []).map(normTrack);
}

export async function trendingTracks(genre?: string): Promise<Track[]> {
  const data = await get<any[]>("/v1/tracks/trending", { genre, limit: 30 });
  return (data ?? []).map(normTrack);
}

export async function searchPlaylists(query: string): Promise<Playlist[]> {
  const data = await get<any[]>("/v1/playlists/search", { query, limit: 12 });
  return (data ?? []).map(normPlaylist);
}

export async function trendingPlaylists(): Promise<Playlist[]> {
  const data = await get<any[]>("/v1/playlists/trending", { limit: 18 });
  return (data ?? []).map(normPlaylist);
}

export async function getPlaylist(id: string): Promise<PlaylistDetail> {
  const data = await get<any[]>(`/v1/playlists/${encodeURIComponent(id)}`);
  const p = data?.[0];
  if (!p) throw new Error("Playlist no encontrada");
  const tracks: Track[] = Array.isArray(p.tracks) ? p.tracks.map(normTrack) : [];
  return { ...normPlaylist(p), tracks };
}
