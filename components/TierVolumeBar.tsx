import { TIER_STYLE } from '@/lib/tiers';
import { weeklyTier } from '@/lib/volume';

const HATCH_PATTERN =
  'repeating-linear-gradient(45deg, #F2F1EC, #F2F1EC 2px, transparent 2px, transparent 4px)';

// 대시보드 부위 트랙의 시각적 스케일. 실제 값 대부분이 이 범위 안에 들어온다.
export const SCALE_MAX = 20;
// "최소 유효량"이 시작되는 4세트 지점 — 다른 경계선보다 살짝 진하게 표시.
const THRESHOLD_SETS = 4;

// 범례와 모든 행이 공유하는 고정 트랙 배경: 구간별 티어 색을 그대로 이어붙인다(값에 따라 변하지 않음).
// 범례 목록(유지 3세트 제외, 최소 유효량 4세트부터 시작)과 맞춰 0~4는 "아직 미달" 단일 톤으로
// 묶고, 4에서 정확히 최소 유효량 색으로 바뀌도록 해 그 경계가 흐릿해지지 않게 한다.
// 스케일을 넘어가는 경계(30/43)는 트랙 밖이라 그리지 않는다.
const TRACK_SEGMENTS: { upTo: number; color: string }[] = [
  { upTo: 4, color: TIER_STYLE.below_maintenance.color },
  { upTo: 5, color: TIER_STYLE.mev.color },
  { upTo: 11, color: TIER_STYLE.high.color },
  { upTo: 19, color: TIER_STYLE.moderate.color },
  { upTo: SCALE_MAX, color: TIER_STYLE.low.color },
];

export const TRACK_GRADIENT = (() => {
  const stops: string[] = [];
  let prevPct = 0;
  for (const seg of TRACK_SEGMENTS) {
    const pct = Math.min(100, (seg.upTo / SCALE_MAX) * 100);
    stops.push(`${seg.color} ${prevPct}%`, `${seg.color} ${pct}%`);
    prevPct = pct;
  }
  return `linear-gradient(to right, ${stops.join(', ')})`;
})();

// 범례/행에 숫자로 표시할 경계 지점 (트랙 스케일 안쪽만). 4는 최소 유효량 시작점이라
// 아래 TrackBoundaries에서 일반 경계선 대신 강조색 기준선으로 따로 그린다.
export const BOUNDARY_TICKS = [4, 5, 11, 19].filter((t) => t < SCALE_MAX);
const PLAIN_LINE_TICKS = BOUNDARY_TICKS.filter((t) => t !== THRESHOLD_SETS);

// 범례/행이 함께 쓰는 3분할 그리드 — 라벨 | 트랙 | 수치 순서와 폭을 여기서 고정해 정렬을 보장한다.
export const ROW_GRID = 'grid grid-cols-[64px_1fr_92px] items-center gap-2';

function TrackBoundaries() {
  return (
    <>
      {PLAIN_LINE_TICKS.map((t) => (
        <span
          key={t}
          className="absolute top-0 h-full w-px bg-bg/40"
          style={{ left: `${(t / SCALE_MAX) * 100}%` }}
          aria-hidden="true"
        />
      ))}
      <span
        className="absolute top-0 h-full w-px bg-threshold-line"
        style={{ left: `${(THRESHOLD_SETS / SCALE_MAX) * 100}%` }}
        aria-hidden="true"
      />
    </>
  );
}

interface TierVolumeBarProps {
  label: string;
  value: number;
  freqLabel?: string;
  onClick?: () => void;
}

export function TierVolumeBar({ label, value, freqLabel, onClick }: TierVolumeBarProps) {
  const pct = Math.min(100, (value / SCALE_MAX) * 100);
  // 43+(미검증)는 스케일 밖이라 점이 오른쪽 끝에 고정되는데, 색 대신 빗금으로
  // "판단 불가"임을 표시해 다른 값과 혼동되지 않게 한다.
  const isUnstudied = weeklyTier(value) === 'unstudied';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`${ROW_GRID} w-full py-1 text-left disabled:cursor-default`}
    >
      <span className="truncate text-sm text-text">{label}</span>
      <div className="relative h-1.5 overflow-visible rounded-full" style={{ backgroundImage: TRACK_GRADIENT }}>
        <TrackBoundaries />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg"
          style={{
            left: `${pct}%`,
            backgroundColor: isUnstudied ? '#4A4A46' : 'var(--color-text)',
            backgroundImage: isUnstudied ? HATCH_PATTERN : undefined,
          }}
          aria-hidden="true"
        />
      </div>
      <span className="flex items-center justify-end gap-1.5 whitespace-nowrap text-xs">
        {freqLabel && <span className="text-text-muted">{freqLabel}</span>}
        <span className="font-headline font-medium tabular-nums text-text">{value}세트</span>
      </span>
    </button>
  );
}
