import { EXERCISES } from '@/lib/exercises';
import { PRIMARY_MUSCLES } from '@/lib/types';
import { estimatedMinutes, sessionTotalSets, weeklyVolume } from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/channel/UCs2rFsRc4HJzT4S7GAlcNKw';

// 인쇄 전용 뷰. 평소엔 화면에서 완전히 숨겨져 있다가(hidden), 인쇄 시에만
// (print:block) 나타난다. 다크 테마 변수를 쓰지 않고 화이트/블랙을 고정해
// "냉장고에 붙이는 루틴표"에 어울리는 라이트 인쇄물을 만든다.
export function PrintableRoutine() {
  const routine = useRoutineStore((s) => s.routine);
  const volume = weeklyVolume(routine, EXERCISES);

  const gridCols = routine.days.length >= 5 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="hidden bg-white p-8 text-black print:block">
      <h1 className="text-[16pt] font-bold">{routine.name}</h1>
      <p className="mb-4 text-[8pt] text-gray-500">
        유관 1평 홈짐 루틴 빌더 · {new Date().toLocaleDateString('ko-KR')} 출력
      </p>

      <div className={`grid ${gridCols} gap-3`}>
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

      <div className="mt-4 break-inside-avoid rounded border border-gray-300 p-2">
        <p className="mb-1 text-[9pt] font-bold">부위별 주간 총 세트</p>
        <div className="grid grid-cols-4 gap-x-3 gap-y-0.5">
          {PRIMARY_MUSCLES.map((muscle) => (
            <div key={muscle} className="flex items-baseline justify-between text-[8pt]">
              <span>{muscle}</span>
              <span className="font-medium">{volume[muscle]}세트</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[8pt] text-gray-500">
        <a href={YOUTUBE_CHANNEL_URL}>유관 유튜브 채널</a>
      </p>
    </div>
  );
}
