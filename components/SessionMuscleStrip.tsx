'use client';

import { useState } from 'react';
import { EXERCISES } from '@/lib/exercises';
import { sessionState, sessionVolume } from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';

export function SessionMuscleStrip() {
  const [open, setOpen] = useState(false);
  const routine = useRoutineStore((s) => s.routine);
  const activeDayId = useRoutineStore((s) => s.activeDayId);
  const day = routine.days.find((d) => d.id === activeDayId);
  if (!day) return null;

  const volume = sessionVolume(day, EXERCISES);
  const entries = Object.entries(volume).filter(([, sets]) => sets > 0);
  const hasFlag = entries.some(([, sets]) => sessionState(sets) === 'above_puos');

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-4 pb-3 pt-2 text-xs text-text-muted"
      >
        {hasFlag && (
          <span aria-hidden="true" className="text-gold">
            🚩
          </span>
        )}
        부위별 세트 보기 ▾
      </button>
    );
  }

  return (
    <div className="px-4 pb-3 pt-2">
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mb-1.5 text-xs text-text-muted"
      >
        부위별 세트 접기 ▲
      </button>
      {entries.length === 0 ? (
        <p className="text-sm text-text-muted">아직 추가된 운동이 없습니다.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto">
          {entries.map(([muscle, sets]) => {
            const above = sessionState(sets) === 'above_puos';
            return (
              <span
                key={muscle}
                className={`shrink-0 text-sm ${above ? 'text-gold font-medium' : 'text-text-muted'}`}
              >
                {above && <span aria-hidden="true">🚩 </span>}
                {muscle} {sets}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
