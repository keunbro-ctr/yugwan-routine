import { useRoutineStore } from '@/store/useRoutineStore';

function ChevronUp({ className, delayMs }: { className?: string; delayMs: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-bounce ${className ?? ''}`}
      style={{ animationDelay: `${delayMs}ms` }}
      aria-hidden="true"
    >
      <path d="M6 15l6-6 6 6" />
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
        className="animate-glow-pulse flex w-full items-center justify-center gap-2 rounded-t-3xl bg-gold py-3 text-black"
      >
        <span className="flex flex-col items-center" aria-hidden="true">
          <ChevronUp className="h-3.5 w-3.5" delayMs={0} />
          <ChevronUp className="-mt-2.5 h-3.5 w-3.5" delayMs={120} />
          <ChevronUp className="-mt-2.5 h-3.5 w-3.5" delayMs={240} />
        </span>
        <span className="font-headline text-lg font-bold tracking-wide">대시보드 보기</span>
      </button>
    </div>
  );
}
