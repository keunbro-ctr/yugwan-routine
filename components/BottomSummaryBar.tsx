import { useRoutineStore } from '@/store/useRoutineStore';

function ArrowUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-bounce ${className ?? ''}`} aria-hidden="true">
      <path d="M12 3 L21 17 L3 17 Z" fill="white" stroke="#FFBE00" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

// 주간 총 세트/부위별 미니바는 대시보드를 열면 어차피 다 나오는 정보라 여기선 보여주지 않는다.
// 얇고, 위쪽이 둥글게 말려 있어 "끌어올려 여는" 느낌을 주는 하나의 CTA만 남긴다.
export function BottomSummaryBar() {
  const openDashboard = useRoutineStore((s) => s.openDashboard);

  return (
    <div
      className="sticky bottom-0 z-10 w-full shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <button
        type="button"
        onClick={openDashboard}
        className="animate-glow-pulse flex w-full items-center justify-center gap-1.5 rounded-t-2xl bg-gold py-2 text-black"
      >
        <ArrowUp className="h-4 w-4" />
        <span className="font-headline text-sm font-bold tracking-wide">대시보드 보기</span>
      </button>
    </div>
  );
}
