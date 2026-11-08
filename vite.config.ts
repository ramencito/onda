import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // base relativo: funciona desde cualquier ruta (subcarpeta, GitHub Pages, etc.)
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // accesible desde el teléfono en la misma red
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
