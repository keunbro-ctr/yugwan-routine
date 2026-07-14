'use client';

import { useState } from 'react';
import { EXERCISES } from '@/lib/exercises';
import { TIER_STYLE } from '@/lib/tiers';
import { PRIMARY_MUSCLES, SECONDARY_MUSCLES } from '@/lib/types';
import type { MuscleKey } from '@/lib/types';
import {
  avgSetsPerSession,
  estimatedMinutes,
  frequency,
  weeklyTier,
  weeklyTotalSets,
  weeklyVolume,
} from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';
import { SourceFootnote } from './SourceFootnote';
import { TierScaleLegend } from './TierScaleLegend';
import { TierVolumeBar } from './TierVolumeBar';
import { VolumeBar } from './VolumeBar';

const BAR_MAX = 20;
const SECONDARY_COLOR = '#6B6B64';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-3 text-center">
      <p className="font-headline text-lg font-bold text-text">{value}</p>
      <p className="mt-0.5 text-xs text-text-muted">{label}</p>
    </div>
  );
}

export function Dashboard() {
  const routine = useRoutineStore((s) => s.routine);
  const dashboardOpen = useRoutineStore((s) => s.dashboardOpen);
  const closeDashboard = useRoutineStore((s) => s.closeDashboard);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleKey | null>(null);
  const [secondaryOpen, setSecondaryOpen] = useState(false);

  if (!dashboardOpen) return null;

  const volume = weeklyVolume(routine, EXERCISES);
  const totalSets = weeklyTotalSets(routine);
  const avgPerSession = avgSetsPerSession(routine);
  const weeklyMinutes = estimatedMinutes(totalSets, routine.minutesPerSet);
  const selectedTier = selectedMuscle ? weeklyTier(volume[selectedMuscle]) : null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/60"
      onClick={closeDashboard}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-text">대시보드</h3>
          <button
            type="button"
            onClick={closeDashboard}
            aria-label="닫기"
            className="flex h-11 w-11 items-center justify-center text-text-muted hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-2">
          <MetricCard label="주간 총 세트" value={`${totalSets}`} />
          <MetricCard label="회당 평균" value={`${avgPerSession}`} />
          <MetricCard label="주당 예상 시간" value={`${weeklyMinutes}분`} />
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
          부위별 주간 누적 세트
        </p>
        <TierScaleLegend />
        <div className="space-y-1">
          {PRIMARY_MUSCLES.map((muscle) => {
            const value = volume[muscle];
            const freq = frequency(routine, muscle, EXERCISES);
            return (
              <TierVolumeBar
                key={muscle}
                label={muscle}
                value={value}
                freqLabel={`주 ${freq}회`}
                onClick={() => setSelectedMuscle(muscle)}
              />
            );
          })}
        </div>

        {selectedMuscle && selectedTier && (
          <div className="mt-4 rounded-lg border border-border bg-surface-raised p-3 text-sm">
            <p className="font-medium text-gold">
              {selectedMuscle} · {TIER_STYLE[selectedTier].label}
            </p>
            <p className="mt-1 text-text-muted">{TIER_STYLE[selectedTier].desc}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setSecondaryOpen((v) => !v)}
          className="mt-6 text-sm text-text-muted hover:text-text"
        >
          보조 부위 {secondaryOpen ? '접기 ▲' : `펼치기 (${SECONDARY_MUSCLES.length}) ▼`}
        </button>
        {secondaryOpen && (
          <div className="mt-3 space-y-4">
            {SECONDARY_MUSCLES.map((muscle) => (
              <VolumeBar
                key={muscle}
                label={muscle}
                value={volume[muscle]}
                max={BAR_MAX}
                color={SECONDARY_COLOR}
              />
            ))}
          </div>
        )}

        <SourceFootnote />
      </div>
    </div>
  );
}
