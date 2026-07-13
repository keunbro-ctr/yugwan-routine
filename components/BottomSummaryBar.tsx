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
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface px-4 py-3 text-left"
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
    </button>
  );
}
