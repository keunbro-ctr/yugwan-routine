'use client';

import { useRoutineStore } from '@/store/useRoutineStore';

export function EditorToolbar() {
  const resetRoutine = useRoutineStore((s) => s.resetRoutine);

  return (
    <div className="flex gap-2 px-4 pt-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-sm font-medium text-text transition-colors hover:border-gold hover:text-gold"
      >
        <span aria-hidden="true">🖨</span> PDF 다운로드
      </button>
      <button
        type="button"
        onClick={() => {
          if (
            window.confirm(
              '정말 초기화할까요? 처음 불러온 프리셋 상태로 되돌아가고, 지금까지 편집한 내용은 사라집니다.'
            )
          ) {
            resetRoutine();
          }
        }}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-sm font-medium text-text-muted transition-colors hover:border-gold hover:text-gold"
      >
        <span aria-hidden="true">↺</span> 초기화
      </button>
    </div>
  );
}
