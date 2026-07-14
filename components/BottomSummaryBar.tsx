import { EXERCISES } from '@/lib/exercises';
import { TIER_STYLE } from '@/lib/tiers';
import { PRIMARY_MUSCLES } from '@/lib/types';
import { weeklyTier, weeklyTotalSets, weeklyVolume } from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';

const MINI_BAR_MAX = 20;

export function BottomSummaryBar() {
  const routine = useRoutineStore((s) => s.routine);
  const openDashboard = useRoutineStore((s) => s.openDashboard);
  const totalSets = weeklyTotalSets(routine);
  const volume = weeklyVolume(routine, EXERCISES);

  return (
    <button
      type="button"
      onClick={openDashboard}
      className="sticky bottom-0 z-10 w-full shrink-0 text-left"
    >
      {/* CTA 밴드: 대시보드로 유도하는 강조 영역 */}
      <div className="flex flex-col items-center gap-0.5 bg-gold pt-1.5 pb-1 text-black">
        <span className="flex flex-col items-center leading-[0.55]" aria-hidden="true">
          <span className="animate-bounce text-[11px] [animation-delay:0ms]">^</span>
          <span className="animate-bounce text-[11px] [animation-delay:120ms]">^</span>
          <span className="animate-bounce text-[11px] [animation-delay:240ms]">^</span>
        </span>
        <span className="text-sm font-bold tracking-wide">대시보드 보기</span>
      </div>

      {/* 요약 정보 */}
      <div
        className="border-t border-border bg-surface px-4 pt-2"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex w-full max-w-lg items-center justify-between">
          <span className="text-sm text-text-muted">주간 총 세트</span>
          <span className="font-semibold text-text">{totalSets}세트</span>
        </div>
        <div className="mx-auto mt-2 flex h-2 w-full max-w-lg gap-1">
          {PRIMARY_MUSCLES.map((muscle) => {
            const value = volume[muscle];
            const tier = weeklyTier(value);
            const rawColor = TIER_STYLE[tier].color;
            const pct = Math.min(100, (value / MINI_BAR_MAX) * 100);
            return (
              <div
                key={muscle}
                title={`${muscle} ${value}`}
                className="h-full flex-1 overflow-hidden rounded-full bg-surface-raised"
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: rawColor === 'HATCH' ? '#3A3A38' : rawColor,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </button>
  );
}
