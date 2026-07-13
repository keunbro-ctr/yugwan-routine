import type { CSSProperties } from 'react';
import { TIER_STYLE } from '@/lib/tiers';
import type { WeeklyTier } from '@/lib/types';
import { weeklyTier } from '@/lib/volume';

const HATCH_PATTERN =
  'repeating-linear-gradient(45deg, #4A4A46, #4A4A46 4px, transparent 4px, transparent 8px)';

// 대시보드 부위 막대의 시각적 스케일. 실제 값 대부분이 이 범위 안에 들어온다.
const SCALE_MAX = 20;
// 유지선(3세트) 다음, "성장이 시작되는" 4세트 지점의 세로 기준선.
const THRESHOLD_SETS = 4;

const TIER_ORDER: WeeklyTier[] = [
  'below_maintenance',
  'maintenance',
  'mev',
  'high',
  'moderate',
  'low',
  'lowest',
  'unstudied',
];
const TIER_BOUNDARIES = [0, 3, 4, 5, 11, 19, 30, 43];

// 0부터 value까지 지나온 모든 티어의 색을 순서대로 이어붙인 hard-stop 그라데이션을 만든다.
// (골드가 옅어지는 과정을 막대 하나에 "히스토리"로 보여주기 위함 — 단일 티어색만 칠하지 않는다.)
function buildHistoryGradient(value: number): string {
  const stops: string[] = [];
  for (let i = 0; i < TIER_ORDER.length; i++) {
    const segStart = TIER_BOUNDARIES[i];
    if (segStart >= value) break;
    const segEnd = TIER_BOUNDARIES[i + 1] ?? value;
    const segEndClamped = Math.min(segEnd, value);
    const color = TIER_STYLE[TIER_ORDER[i]].color;
    const solidColor = color === 'HATCH' ? '#4A4A46' : color;
    const startPct = (segStart / value) * 100;
    const endPct = (segEndClamped / value) * 100;
    stops.push(`${solidColor} ${startPct}%`, `${solidColor} ${endPct}%`);
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

interface TierVolumeBarProps {
  label: string;
  value: number;
  freqLabel?: string;
  onClick?: () => void;
}

export function TierVolumeBar({ label, value, freqLabel, onClick }: TierVolumeBarProps) {
  const tier = weeklyTier(value);
  const fillPct = Math.min(100, (value / SCALE_MAX) * 100);
  const thresholdPct = (THRESHOLD_SETS / SCALE_MAX) * 100;

  const fillStyle: CSSProperties =
    tier === 'unstudied'
      ? { width: `${fillPct}%`, backgroundColor: '#3A3A38', backgroundImage: HATCH_PATTERN }
      : { width: `${fillPct}%`, backgroundImage: value > 0 ? buildHistoryGradient(value) : undefined };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="w-full text-left disabled:cursor-default"
    >
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-text">{label}</span>
        <span className="flex items-center gap-2">
          {freqLabel && <span className="text-xs text-text-muted">{freqLabel}</span>}
          <span className="font-headline tabular-nums font-medium text-text">{value}</span>
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-surface-raised">
        <div className="h-full rounded-full transition-[width] duration-200" style={fillStyle} />
        <div
          className="absolute top-0 h-full w-px bg-threshold-line"
          style={{ left: `${thresholdPct}%` }}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}
