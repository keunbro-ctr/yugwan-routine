'use client';

import { formatLength, type Dumbbell } from '@/lib/dumbbells';

// 모든 막대가 같은 축척을 쓴다. 0~500mm
const SCALE_MAX = 500;
const TICKS = [0, 100, 200, 300, 400, 500];
const pct = (mm: number) => `${(mm / SCALE_MAX) * 100}%`;

export function LengthChart({ items }: { items: Dumbbell[] }) {
  if (items.length === 0) return <p className="dbx-panel dbx-empty dbx-muted">표시할 제품이 없습니다.</p>;
  const ticks = (
    <div className="dbx-len-grid" aria-hidden="true">
      {TICKS.map((t) => (
        <i key={t} style={{ left: pct(t) }} />
      ))}
    </div>
  );

  return (
    <div className="dbx-panel dbx-len">
      <ul aria-label="덤벨 단독 길이 비교 (같은 축척)">
        {items.map((d) => {
          const m = d.length;
          return (
            <li key={d.id} className="dbx-len-row">
              <span className="dbx-len-name">
                {d.name}
                <small className="dbx-num">
                  {m.kind === 'unknown' ? '확인 필요' : formatLength(m)}
                </small>
              </span>
              <span className="dbx-len-track">
                {ticks}
                {m.kind === 'exact' && (
                  <span className="dbx-len-bar" style={{ width: pct(m.value) }} aria-hidden="true" />
                )}
                {m.kind === 'approx' && (
                  <span className="dbx-len-bar is-approx" style={{ width: pct(m.value) }} aria-hidden="true" />
                )}
                {m.kind === 'range' && (
                  <>
                    <span className="dbx-len-bar" style={{ width: pct(m.min) }} aria-hidden="true" />
                    <span
                      className="dbx-len-range"
                      style={{ left: pct(m.min), width: pct(m.max - m.min) }}
                      aria-hidden="true"
                    />
                  </>
                )}
                {m.kind === 'unknown' && (
                  <span className="dbx-len-unknown" style={{ position: 'absolute', top: 3 }}>
                    덤벨 단독 길이 미확인 — 그리지 않음
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="dbx-len-axis" aria-hidden="true">
        <span />
        <div className="dbx-len-scale">
          {TICKS.map((t) => (
            <span key={t} style={{ left: pct(t) }}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="dbx-legend">
        <span>
          <i style={{ background: 'var(--champ-line)' }} />
          판매자 표기 길이
        </span>
        <span>
          <i className="dbx-len-bar is-approx" style={{ position: 'static' }} />
          근삿값 (판매자 답변 「약」)
        </span>
        <span>
          <i style={{ border: '1px dashed var(--champ-mid)', background: 'rgba(216,193,151,.12)' }} />
          범위 (판 수에 따라)
        </span>
        <span>단위 mm · 최대 중량 구성 기준 · 형상은 단순화한 막대이며 실제 제품 모양이 아님</span>
      </div>
    </div>
  );
}
