import { estimatedMinutes, sessionTotalSets } from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';

export function SessionHeader() {
  const routine = useRoutineStore((s) => s.routine);
  const activeDayId = useRoutineStore((s) => s.activeDayId);
  const resetRoutine = useRoutineStore((s) => s.resetRoutine);
  const day = routine.days.find((d) => d.id === activeDayId);
  if (!day) return null;

  const totalSets = sessionTotalSets(day);
  const minutes = estimatedMinutes(totalSets, routine.minutesPerSet);

  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-4">
      <h2 className="font-headline text-lg font-bold text-text">
        {day.label} · {totalSets}세트 · 약 {minutes}분
      </h2>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="PDF로 인쇄"
          onClick={() => window.print()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-text"
        >
          🖨
        </button>
        <button
          type="button"
          aria-label="루틴 초기화"
          onClick={() => {
            if (
              window.confirm(
                '정말 초기화할까요? 처음 불러온 프리셋 상태로 되돌아가고, 지금까지 편집한 내용은 사라집니다.'
              )
            ) {
              resetRoutine();
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-text"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
