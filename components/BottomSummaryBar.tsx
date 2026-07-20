import { useRoutineStore } from '@/store/useRoutineStore';

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
        className="animate-glow-pulse flex w-full items-center justify-center gap-2 rounded-t-3xl bg-gold py-3 text-black"
      >
        <span className="flex items-center gap-0.5" aria-hidden="true">
          <span className="animate-bounce text-sm [animation-delay:0ms]">^</span>
          <span className="animate-bounce text-sm [animation-delay:120ms]">^</span>
          <span className="animate-bounce text-sm [animation-delay:240ms]">^</span>
        </span>
        <span className="font-headline text-lg font-bold tracking-wide">대시보드 보기</span>
      </button>
    </div>
  );
}
