import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { useLibrary } from "../stores/library";
import { useOnline } from "../hooks/useOnline";
import BottomNav from "./BottomNav";
import MiniPlayer from "./MiniPlayer";
import Toast from "./Toast";

/** Chasis de la app: contenido scrolleable + mini player + navegación. */
export default function Layout() {
  const init = useLibrary((s) => s.init);
  const online = useOnline();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink text-white">
      {!online && (
        <div
          className="flex shrink-0 items-center justify-center gap-2 bg-amber-400 px-4 pb-1.5 text-[12px] font-bold text-black"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 6px)" }}
        >
          <WifiOff size={14} />
          Sin conexión — solo descargas
        </div>
      )}

      <main
        ref={mainRef}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <Outlet />
        <div className="h-6" />
      </main>

      <MiniPlayer />
      <BottomNav />
      <Toast />
    </div>
  );
}
