/** Ecualizador animado para la canción que suena. */
export default function EqBars({ playing }: { playing: boolean }) {
  return (
    <span className="flex h-4 items-end justify-center gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`eq-bar w-[3px] rounded-sm bg-accent ${playing ? "" : "paused"}`}
          style={{
            height: "100%",
            animationDelay: `${i * 0.18}s`,
            animationPlayState: playing ? "running" : "paused",
          }}
        />
      ))}
    </span>
  );
}
