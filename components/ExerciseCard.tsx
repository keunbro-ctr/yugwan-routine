'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

  // uid는 store 진입점(addExercise/loadPreset/loadEmpty/마이그레이션)에서 항상 채워지지만,
  // 방어적으로 dayId+index 조합을 폴백으로 둔다.
  const sortableId = routineExercise?.uid ?? `${dayId}-${index}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
  });

  if (!routineExercise) return null;
  const exercise = EXERCISES.find((e) => e.id === routineExercise.exerciseId);
  if (!exercise) return null;

  const muscleBadge = Object.keys(exercise.coefficients).join(' · ');

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="rounded-xl border border-border bg-surface p-3"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="드래그해서 순서 변경"
          className="flex h-11 w-6 shrink-0 cursor-grab items-center justify-center text-text-dim active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-text font-medium" title={exercise.note}>
            {exercise.name}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-gold">{muscleBadge}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <SetStepper value={routineExercise.sets} onChange={(v) => setSets(dayId, index, v)} />
          <div className="relative">
            <button
              type="button"
              aria-label="메뉴"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-text"
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 w-40 rounded-lg border border-border bg-surface-raised py-1">
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
