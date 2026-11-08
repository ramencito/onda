import type { ReactNode } from "react";

/** Fila horizontal con título (tipo "Filas" de Spotify). */
export default function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2.5 px-4 text-[19px] font-bold tracking-tight">{title}</h2>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-1 scroll-pl-4 scroll-pr-4">
        {children}
      </div>
    </section>
  );
}

/** Esqueleto de carga para una fila. */
export function RowSkeleton({ title }: { title: string }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2.5 px-4 text-[19px] font-bold tracking-tight">{title}</h2>
      <div className="flex gap-3.5 overflow-x-auto px-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-36 shrink-0">
            <div className="aspect-square w-full animate-pulse rounded-lg bg-white/10" />
            <div className="mt-2 h-3.5 w-4/5 animate-pulse rounded bg-white/10" />
            <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </section>
  );
}
