'use client';

import { useState } from 'react';
import { EXERCISES } from '@/lib/exercises';
import { useRoutineStore } from '@/store/useRoutineStore';
import { CoefficientSliders } from './CoefficientSliders';
import { SetStepper } from './SetStepper';

interface ExerciseCardProps {
  dayId: string;
  index: number;
}

export function ExerciseCard({ dayId, index }: ExerciseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [coeffOpen, setCoeffOpen] = useState(false);

  const routineExercise = useRoutineStore(
    (s) => s.routine.days.find((d) => d.id === dayId)?.exercises[index]
  );
  const setSets = useRoutineStore((s) => s.setSets);
  const removeExercise = useRoutineStore((s) => s.removeExercise);

  if (!routineExercise) return null;
  const exercise = EXERCISES.find((e) => e.id === routineExercise.exerciseId);
  if (!exercise) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-text font-medium">{exercise.name}</p>
          <p className="mt-0.5 text-xs text-text-muted">{exercise.note}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SetStepper value={routineExercise.sets} onChange={(v) => setSets(dayId, index, v)} />
          <div className="relative">
            <button
              type="button"
              aria-label="메뉴"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-text-muted hover:text-text"
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 z-10 w-40 rounded-lg border border-border bg-surface-raised py-1">
                <button
                  type="button"
                  onClick={() => {
                    setCoeffOpen((v) => !v);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface"
                >
                  계수 조정
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeExercise(dayId, index);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-text-muted hover:bg-surface hover:text-text"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {coeffOpen && (
        <CoefficientSliders
          dayId={dayId}
          index={index}
          exercise={exercise}
          routineExercise={routineExercise}
        />
      )}
    </div>
  );
}
