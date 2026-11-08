import { useState } from "react";
import { Music } from "lucide-react";
import { artworkUrl } from "../api/audius";

interface Props {
  cid?: string | null;
  src?: string | null;
  className?: string;
  alt?: string;
}

/** Portada con respaldo (si falta la imagen, muestra un degradado). */
export default function Artwork({ cid, src, className = "", alt = "" }: Props) {
  const finalSrc = src ?? artworkUrl(cid ?? null);
  const [failed, setFailed] = useState(false);

  if (!finalSrc || failed) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-[#2b2b36] to-[#15151b] ${className}`}
        aria-hidden
      >
        <Music className="h-1/3 w-1/3 text-white/25" />
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
