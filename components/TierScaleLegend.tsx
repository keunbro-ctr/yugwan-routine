import { BOUNDARY_TICKS, ROW_GRID, SCALE_MAX, TRACK_GRADIENT } from './TierVolumeBar';

// 근육 목록 최상단에 한 번만 그리는 공통 범례. 각 행의 트랙과 정확히 같은
// 그리드(ROW_GRID)를 써서 눈금 위치가 모든 행과 정렬되도록 한다.
export function TierScaleLegend() {
  return (
    <div className={`${ROW_GRID} w-full pb-1`}>
      <span aria-hidden="true" />
      <div className="relative">
        <div className="h-1.5 rounded-full" style={{ backgroundImage: TRACK_GRADIENT }} />
        <div className="relative mt-0.5 h-3 text-[10px] text-text-dim">
          {BOUNDARY_TICKS.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2"
              style={{ left: `${(t / SCALE_MAX) * 100}%` }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <span className="text-right text-[10px] text-text-dim">세트</span>
    </div>
  );
}
