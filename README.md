# Onda 🎵

**Reproductor de música móvil (PWA) con interfaz estilo Spotify, diseñado para escuchar sin datos: descarga playlists completas de una sola vez.**

🌐 **En vivo:** **https://ramencito.github.io/onda/**

En vez de bajar canción por canción, abres una playlist, tocas **Descargar** y queda toda guardada en tu teléfono para escucharla sin conexión (igual que Spotify Premium).

---

## Características

- 🎨 **Interfaz muy parecida a Spotify**: tema oscuro, inicio con filas, buscador con categorías, biblioteca, barra de reproducción mini y reproductor a pantalla completa con la portada desenfocada.
- ⬇️ **Descarga playlists completas** con barra de progreso (`5/12`), además de descarga individual por canción.
- ✈️ **Modo sin conexión real**: banner de aviso, la biblioteca muestra solo tus descargas y las canciones descargadas se reproducen desde el almacenamiento local.
- 💚 **Canciones que te gustan** con su propio botón "Descargar todas".
- 🎧 Controles de pantalla de bloqueo / audífonos (MediaSession).
- 📲 **PWA instalable**: se puede agregar a la pantalla de inicio como una app.
- 🔒 Sin cuentas, sin registro, sin rastreo.

## Sobre la música

La app usa la **API pública de Audius** (música gratuita de artistas independientes). No usa el catálogo de Spotify: ese contenido está protegido y no se puede descargar. Busca tu artista favorito igualmente — hay de todo género.

## Requisitos

- Node.js v22+ (v26 probado) y npm.

## Uso en desarrollo

```bash
npm install
npm run dev        # arranca en http://localhost:5173 (accesible desde la red local)
```

### Desde tu celular (misma Wi-Fi que la PC)

1. Ejecuta `npm run dev`.
2. En el navegador del celular abre: **`http://192.168.1.73:5173`** (la IP de tu PC; cámbiala si cambia tu red — mira con `hostname -I`).
3. Funciona todo: buscar, reproducir y **descargar playlists**.

> Para poder *instalarla* como app (icono propio y pantalla completa) el navegador exige HTTPS: publicándola en cualquier hosting gratuito (Netlify, Vercel, GitHub Pages) se activa además el modo offline del shell. Escríbeme si quieres que te prepare el despliegue.

## Build de producción

```bash
npm run build      # genera dist/ (verifica tipos + compila)
npm run preview    # sirve dist/ en http://localhost:4173
```

## Despliegue (GitHub Pages)

```bash
./scripts/deploy-pages.sh   # build + publica en https://ramencito.github.io/onda/
```

El sitio se publica desde la rama `gh-pages` (no usa Actions, así no requiere el
permiso especial de `workflow`). Tras el push, Pages tarda ~30-60 s en actualizar.

## Cómo funciona las descargas

| Dónde | Qué |
| --- | --- |
| `IndexedDB` (`dl:track:*`) | Audio completo (blob) por canción |
| `IndexedDB` (`dl:playlist:*`) | Metadatos de playlists descargadas |
| `IndexedDB` (`lib:liked`) | Tus canciones favoritas |
| Service worker (`public/sw.js`) | Cachea el shell de la app para que abra sin internet |

El botón de descarga pide almacenamiento persistente (`navigator.storage.persist()`) para que el navegador no borre tu música. En **Biblioteca** ves cuánto espacio ocupan tus descargas.

## Estructura

```
onda/
├── public/            manifest, service worker, iconos
├── scripts/           generador de iconos (PIL)
└── src/
    ├── api/audius.ts        cliente de la API (búsqueda, playlists, streaming)
    ├── components/          Layout, MiniPlayer, FullPlayer, TrackRow, DownloadButton, …
    ├── hooks/useOnline.ts   estado online/offline
    ├── lib/                 formatos, descarga a IndexedDB
    ├── pages/               Home, Search, Library, Playlist, Liked
    └── stores/              player (audio), library (descargas), ui (toasts)
```

## Licencia

Proyecto personal. El contenido musical pertenece a sus artistas vía Audius (API pública).
