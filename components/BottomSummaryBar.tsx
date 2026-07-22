import { weeklyTotalSets } from '@/lib/volume';
import { useRoutineStore } from '@/store/useRoutineStore';

function ArrowUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-bounce ${className ?? ''}`} aria-hidden="true">
      <path d="M12 3 L21 17 L3 17 Z" fill="white" stroke="#FFBE00" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

// 골드 CTA 하나만 두면 아이폰 하단 세이프에어리어까지 화면 맨 아래가 온통 골드로 보여서,
// 어두운 배경의 총 세트수 바를 다시 붙여 "범퍼" 역할을 하게 한다. 세이프에어리어 패딩도
// 이 바가 가져가서, 맨 밑 픽셀이 항상 골드가 아니라 어두운 색이 되도록 한다.
export function BottomSummaryBar() {
  const openDashboard = useRoutineStore((s) => s.openDashboard);
  const routine = useRoutineStore((s) => s.routine);
  const totalSets = weeklyTotalSets(routine);

  return (
    <div className="sticky bottom-0 z-10 w-full shrink-0">
      <button
        type="button"
        onClick={openDashboard}
        className="animate-glow-pulse flex w-full items-center justify-center gap-2 rounded-t-3xl border-[3px] border-[#C99A18] bg-gold py-3 text-black"
      >
        <ArrowUp className="h-5 w-5" />
        <span className="font-headline text-lg font-bold tracking-wide">대시보드 보기</span>
      </button>
      <div
        className="border-t border-border bg-surface px-4 py-2 text-center text-sm text-text-muted"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        주간 총 {totalSets}세트
      </div>
    </div>
  );
}
