import type { Exercise, MuscleKey, RoutineExercise } from '@/lib/types';
import { useRoutineStore } from '@/store/useRoutineStore';

interface CoefficientSlidersProps {
  dayId: string;
  index: number;
  exercise: Exercise;
  routineExercise: RoutineExercise;
}

export function CoefficientSliders({ dayId, index, exercise, routineExercise }: CoefficientSlidersProps) {
  const setCoefficientOverride = useRoutineStore((s) => s.setCoefficientOverride);
  const muscles = Object.keys(exercise.coefficients) as MuscleKey[];

  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      {muscles.map((muscle) => {
        const value =
          routineExercise.coefficientOverride?.[muscle] ?? exercise.coefficients[muscle] ?? 0;
        return (
          <div key={muscle}>
            <div className="mb-1 flex justify-between text-xs text-text-muted">
              <span>{muscle}</span>
              <span className="tabular-nums">{value}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.25}
              value={value}
              onChange={(e) => setCoefficientOverride(dayId, index, muscle, Number(e.target.value))}
              className="w-full accent-gold"
            />
          </div>
        );
      })}
    </div>
  );
}
