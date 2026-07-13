import { estimatedMinutes, sessionTotalSets } from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';

export function SessionHeader() {
  const routine = useRoutineStore((s) => s.routine);
  const activeDayId = useRoutineStore((s) => s.activeDayId);
  const day = routine.days.find((d) => d.id === activeDayId);
  if (!day) return null;

  const totalSets = sessionTotalSets(day);
  const minutes = estimatedMinutes(totalSets, routine.minutesPerSet);

  return (
    <div className="px-4 pt-4">
      <h2 className="font-headline text-lg font-bold text-text">
        {day.label} · {totalSets}세트 · 약 {minutes}분
      </h2>
    </div>
  );
}
