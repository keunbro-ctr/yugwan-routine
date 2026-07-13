import { EXERCISES } from '@/lib/exercises';
import { sessionState, sessionVolume } from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';

export function SessionMuscleStrip() {
  const routine = useRoutineStore((s) => s.routine);
  const activeDayId = useRoutineStore((s) => s.activeDayId);
  const day = routine.days.find((d) => d.id === activeDayId);
  if (!day) return null;

  const volume = sessionVolume(day, EXERCISES);
  const entries = Object.entries(volume).filter(([, sets]) => sets > 0);

  if (entries.length === 0) {
    return <p className="px-4 pb-3 pt-2 text-sm text-text-muted">아직 추가된 운동이 없습니다.</p>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-3 pt-2">
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
  );
}
