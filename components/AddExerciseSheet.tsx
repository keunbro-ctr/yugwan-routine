'use client';

import { useState } from 'react';
import { EXERCISES } from '@/lib/exercises';
import type { Exercise } from '@/lib/types';
import { useRoutineStore } from '@/store/useRoutineStore';

const CATEGORIES: Exercise['category'][] = ['가슴', '등', '어깨', '하체', '팔'];

interface AddExerciseSheetProps {
  dayId: string;
  open: boolean;
  onClose: () => void;
}

export function AddExerciseSheet({ dayId, open, onClose }: AddExerciseSheetProps) {
  const [category, setCategory] = useState<Exercise['category'] | 'all'>('all');
  const addExercise = useRoutineStore((s) => s.addExercise);

  if (!open) return null;

  const filtered = category === 'all' ? EXERCISES : EXERCISES.filter((e) => e.category === category);

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-t border-border bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-text">운동 추가</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-text-muted hover:text-text"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`shrink-0 rounded-full px-3 py-1 text-sm ${
              category === 'all' ? 'bg-gold text-black' : 'bg-surface-raised text-text-muted'
            }`}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm ${
                category === cat ? 'bg-gold text-black' : 'bg-surface-raised text-text-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => {
                addExercise(dayId, exercise.id);
                onClose();
              }}
              className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:border-gold"
            >
              <p className="text-sm font-medium text-text">{exercise.name}</p>
              <p className="mt-0.5 text-xs text-text-muted">{exercise.note}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
