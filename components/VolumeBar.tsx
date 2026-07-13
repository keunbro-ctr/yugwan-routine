import type { CSSProperties } from 'react';

const HATCH_PATTERN =
  'repeating-linear-gradient(45deg, #4A4A46, #4A4A46 4px, transparent 4px, transparent 8px)';

interface VolumeBarProps {
  label: string;
  value: number;
  max: number;
  color: string; // hex color, or the 'HATCH' sentinel for unstudied tier
  freqLabel?: string;
  onClick?: () => void;
}

export function VolumeBar({ label, value, max, color, freqLabel, onClick }: VolumeBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const fillStyle: CSSProperties =
    color === 'HATCH'
      ? { width: `${pct}%`, backgroundColor: '#3A3A38', backgroundImage: HATCH_PATTERN }
      : { width: `${pct}%`, backgroundColor: color };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="w-full text-left disabled:cursor-default"
    >
      <div className="flex items-baseline justify-between text-sm mb-1">
        <span className="text-text">{label}</span>
        <span className="flex items-center gap-2">
          {freqLabel && <span className="text-text-muted text-xs">{freqLabel}</span>}
          <span className="text-text font-medium tabular-nums">{value}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-surface-raised overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-200" style={fillStyle} />
      </div>
    </button>
  );
}
