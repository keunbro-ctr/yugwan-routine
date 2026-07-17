import { EXERCISES } from '@/lib/exercises';
import { estimatedMinutes, sessionTotalSets } from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';

// 인쇄 전용 뷰. 평소엔 화면에서 완전히 숨겨져 있다가(hidden), 인쇄 시에만
// (print:block) 나타난다. 다크 테마 변수를 쓰지 않고 화이트/블랙을 고정해
// "냉장고에 붙이는 루틴표"에 어울리는 라이트 인쇄물을 만든다.
export function PrintableRoutine() {
  const routine = useRoutineStore((s) => s.routine);

  const gridCols = routine.days.length >= 5 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="hidden bg-white p-0 text-black print:block">
      <h1 className="text-[16pt] font-bold">{routine.name}</h1>
      <p className="mb-3 text-[8pt] text-gray-500">
        유관 1평 홈짐 루틴 빌더 · {new Date().toLocaleDateString('ko-KR')} 출력
      </p>
      <div className={`grid ${gridCols} gap-2`}>
        {routine.days.map((day) => {
          const totalSets = sessionTotalSets(day);
          const minutes = estimatedMinutes(totalSets, routine.minutesPerSet);
          return (
            <div key={day.id} className="break-inside-avoid rounded border border-gray-300 p-2">
              <p className="mb-1 text-[9pt] font-bold">
                {day.label} · {totalSets}세트 · 약 {minutes}분
              </p>
              <ul>
                {day.exercises.map((re) => {
                  const exercise = EXERCISES.find((e) => e.id === re.exerciseId);
                  if (!exercise) return null;
                  return (
                    <li
                      key={re.uid ?? re.exerciseId}
                      className="flex items-baseline justify-between gap-2 border-b border-gray-100 py-0.5 text-[8pt]"
                    >
                      <span>{exercise.name}</span>
                      <span className="shrink-0 font-medium">{re.sets}세트</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
