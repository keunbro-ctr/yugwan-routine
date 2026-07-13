interface SetStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function SetStepper({ value, onChange, min = 1, max = 10 }: SetStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="세트 감소"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-full border border-border text-text disabled:opacity-30 flex items-center justify-center hover:border-gold transition-colors"
      >
        −
      </button>
      <span className="w-5 text-center tabular-nums text-text font-medium">{value}</span>
      <button
        type="button"
        aria-label="세트 증가"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-full border border-border text-text disabled:opacity-30 flex items-center justify-center hover:border-gold transition-colors"
      >
        +
      </button>
    </div>
  );
}
