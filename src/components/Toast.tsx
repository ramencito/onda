import { useToast } from "../stores/ui";

export default function Toast() {
  const message = useToast((s) => s.message);
  const kind = useToast((s) => s.kind);

  if (!message) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ top: "calc(env(safe-area-inset-top) + 10px)" }}
      role="status"
    >
      <div
        className={`toast-in max-w-[92vw] rounded-full px-4 py-2.5 text-center text-sm font-semibold shadow-2xl ${
          kind === "err" ? "bg-red-500 text-white" : "bg-white text-black"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
