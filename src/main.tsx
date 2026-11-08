import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);

// Hook de depuración solo en desarrollo (pruebas automatizadas).
if (import.meta.env.DEV) {
  void import("./stores/player").then(({ usePlayer }) => {
    void import("./stores/library").then(({ useLibrary }) => {
      (window as unknown as Record<string, unknown>).__onda = { usePlayer, useLibrary };
    });
  });
}


// Solo registramos el service worker en producción (app shell offline).
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
