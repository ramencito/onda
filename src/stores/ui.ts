import { create } from "zustand";

interface ToastState {
  message: string | null;
  kind: "ok" | "err";
  show: (message: string, kind?: "ok" | "err") => void;
  clear: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToast = create<ToastState>()((set) => ({
  message: null,
  kind: "ok",
  show(message, kind = "ok") {
    if (timer) clearTimeout(timer);
    set({ message, kind });
    timer = setTimeout(() => set({ message: null }), 2800);
  },
  clear() {
    if (timer) clearTimeout(timer);
    set({ message: null });
  },
}));
