import { TIER_STYLE } from '@/lib/tiers';
import type { WeeklyTier } from '@/lib/types';
import { BOUNDARY_TICKS, ROW_GRID, SCALE_MAX, TRACK_GRADIENT } from './TierVolumeBar';

const SWATCH_HATCH =
  'repeating-linear-gradient(45deg, #8A8A84, #8A8A84 1.5px, transparent 1.5px, transparent 3px)';

// 유지(3세트)는 제외 — 나머지 6개 구간만 범례로 보여준다.
const LEGEND_ITEMS: { tier: WeeklyTier; range: string }[] = [
  { tier: 'mev', range: '4세트' },
  { tier: 'high', range: '5~10세트' },
  { tier: 'moderate', range: '11~18세트' },
  { tier: 'low', range: '19~29세트' },
  { tier: 'lowest', range: '30~42세트' },
  { tier: 'unstudied', range: '43세트 이상' },
];

// 근육 목록 최상단에 한 번만 그리는 공통 범례. 트랙 부분은 각 행과 정확히 같은
// 그리드(ROW_GRID)를 써서 눈금 위치가 모든 행과 정렬되도록 한다.
export function TierScaleLegend() {
  return (
    <div className="mb-3 w-full">
      <div className={`${ROW_GRID} pb-1`}>
        <span aria-hidden="true" />
        <div className="relative">
          <div className="h-1.5 rounded-full" style={{ backgroundImage: TRACK_GRADIENT }} />
          <div className="relative mt-0.5 h-3 text-[10px] text-text-dim">
            {BOUNDARY_TICKS.map((t) => (
              <span
                key={t}
                className="absolute -translate-x-1/2"
                style={{ left: `${(t / SCALE_MAX) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <span className="text-right text-[10px] text-text-dim">세트</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
        {LEGEND_ITEMS.map(({ tier, range }) => {
          const style = TIER_STYLE[tier];
          const isHatch = style.color === 'HATCH';
          return (
            <div key={tier} className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={
                  isHatch
                    ? { backgroundColor: '#4A4A46', backgroundImage: SWATCH_HATCH }
                    : { backgroundColor: style.color }
                }
                aria-hidden="true"
              />
              <span>
                {style.label} <span className="text-text-dim">({range})</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
