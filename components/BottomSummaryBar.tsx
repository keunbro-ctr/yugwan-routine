'use client';

import { useState } from 'react';
import { EXERCISES } from '@/lib/exercises';
import { TIER_STYLE } from '@/lib/tiers';
import { PRIMARY_MUSCLES } from '@/lib/types';
import { weeklyTier, weeklyTotalSets, weeklyVolume } from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';

const MINI_BAR_MAX = 20;

export function BottomSummaryBar() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const routine = useRoutineStore((s) => s.routine);
  const openDashboard = useRoutineStore((s) => s.openDashboard);
  const totalSets = weeklyTotalSets(routine);
  const volume = weeklyVolume(routine, EXERCISES);

  return (
    <div
      className="sticky bottom-0 z-10 w-full shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* CTA 밴드: 대시보드로 유도하는 강조 영역 — 더 크고 확실하게 */}
      <button
        type="button"
        onClick={openDashboard}
        className="flex w-full flex-col items-center gap-1 bg-gold py-4 text-black"
      >
        <span className="flex flex-col items-center leading-[0.55]" aria-hidden="true">
          <span className="animate-bounce text-sm [animation-delay:0ms]">^</span>
          <span className="animate-bounce text-sm [animation-delay:120ms]">^</span>
          <span className="animate-bounce text-sm [animation-delay:240ms]">^</span>
        </span>
        <span className="text-base font-bold tracking-wide">대시보드 보기</span>
      </button>

      {/* 주간 총 세트 + 미니 진행바는 당장 급하지 않은 정보라 기본 접힘 */}
      {detailsOpen ? (
        <div className="border-t border-border bg-surface px-4 pb-2 pt-2">
          <button
            type="button"
            onClick={() => setDetailsOpen(false)}
            className="flex w-full items-center justify-between"
          >
            <span className="text-sm text-text-muted">주간 총 세트 접기 ▲</span>
            <span className="font-semibold text-text">{totalSets}세트</span>
          </button>
          <div className="mt-2 flex h-2 w-full gap-1">
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
      ) : (
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="flex w-full items-center justify-center border-t border-border bg-surface py-1.5 text-xs text-text-muted"
        >
          주간 총 {totalSets}세트 상세 보기 ▾
        </button>
      )}
    </div>
  );
}
