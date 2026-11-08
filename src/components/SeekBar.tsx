interface Props {
  value: number;
  max: number;
  onSeek: (value: number) => void;
  label?: string;
}

export default function SeekBar({ value, max, onSeek, label = "Progreso" }: Props) {
  const safeMax = max > 0 ? max : 100;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <input
      type="range"
      className="seek"
      min={0}
      max={safeMax}
      step={0.5}
      value={Math.min(value, safeMax)}
      aria-label={label}
      onChange={(e) => onSeek(Number(e.target.value))}
      style={{ "--pct": `${pct}%` } as React.CSSProperties}
    />
  );
}
