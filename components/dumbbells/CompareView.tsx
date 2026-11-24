'use client';

import type { ReactNode } from 'react';
import {
  METHOD_CHECK,
  METHOD_LABEL,
  formatExpansion,
  formatKg,
  formatLength,
  formatShipping,
  formatWon,
  type Dumbbell,
} from '@/lib/dumbbells';
import { lengthSortKey } from '@/lib/dumbbellQuery';
import { ProductName } from './Cells';

interface Row {
  label: string;
  /** 차이 판정용 문자열 */
  text: (d: Dumbbell) => string;
  render?: (d: Dumbbell, ctx: Ctx) => ReactNode;
  /** 숫자 비교가 되는 행: 작을수록/클수록 좋다는 방향이 아니라 '가장 낮음/짧음/높음' 표시용 */
  num?: (d: Dumbbell) => number | null;
  bestIs?: 'min' | 'max';
  bestLabel?: string;
}

interface Ctx {
  min: number | null;
  max: number | null;
}

const delta = (v: number | null, base: number | null, unit: string, fmt = (n: number) => String(n)) =>
  v === null || base === null || v === base ? null : `+${fmt(v - base)}${unit}`;

const ROWS: Row[] = [
  {
    label: '한 쌍 가격',
    text: (d) => String(d.pairPrice),
    num: (d) => d.pairPrice,
    bestIs: 'min',
    bestLabel: '가장 낮음',
    render: (d, c) => (
      <>
        <span className="dbx-price dbx-num">{formatWon(d.pairPrice)}원</span>
        {delta(d.pairPrice, c.min, '원', formatWon) && (
          <span className="dbx-sub dbx-num">{delta(d.pairPrice, c.min, '원', formatWon)}</span>
        )}
      </>
    ),
  },
  {
    label: '배송비',
    text: (d) => formatShipping(d.shipping),
    render: (d) => <span>{formatShipping(d.shipping)}</span>,
  },
  {
    label: '한 손 최대',
    text: (d) => String(d.maxKg),
    num: (d) => d.maxKg,
    bestIs: 'max',
    bestLabel: '가장 높음',
    render: (d) => <span className="dbx-num">{formatKg(d.maxKg)}</span>,
  },
  {
    label: '길이 (덤벨만)',
    text: (d) => formatLength(d.length),
    num: (d) => lengthSortKey(d),
    bestIs: 'min',
    bestLabel: '가장 짧음',
    render: (d, c) => {
      if (d.length.kind === 'unknown') return <em className="dbx-unsure">확인 필요</em>;
      const k = lengthSortKey(d);
      const dl = delta(k, c.min, 'mm');
      return (
        <>
          <span className="dbx-num">{formatLength(d.length)}</span>
          {d.length.kind === 'approx' && <span className="dbx-sub">{d.length.basis}</span>}
          {dl && <span className="dbx-sub dbx-num">{d.length.kind === 'range' ? `상한 기준 ${dl}` : dl}</span>}
        </>
      );
    },
  },
  {
    label: '조절 간격',
    text: (d) => d.step.label,
    num: (d) => d.step.max,
    bestIs: 'min',
    bestLabel: '가장 촘촘',
    render: (d) => (
      <>
        <span className="dbx-num">{d.step.label}</span>
        {d.step.fineNote && <span className="dbx-sub">{d.step.fineNote}</span>}
      </>
    ),
  },
  {
    label: '최소 무게',
    text: (d) => (d.minKg === null ? '?' : String(d.minKg)),
    render: (d) =>
      d.minKg === null ? <em className="dbx-unsure">확인 필요</em> : <span className="dbx-num">{formatKg(d.minKg)}</span>,
  },
  {
    label: '방식',
    text: (d) => d.method,
    render: (d) => (d.method === 'unknown' ? <em className="dbx-unsure">확인 필요</em> : METHOD_LABEL[d.method]),
  },
  {
    label: '확장성',
    text: (d) => formatExpansion(d.expansion),
    render: (d) => {
      const e = d.expansion;
      return (
        <>
          {e.kind === 'unknown' ? <em className="dbx-unsure">확인 필요</em> : formatExpansion(e)}
          <span className="dbx-sub">{e.note}</span>
        </>
      );
    },
  },
  {
    label: '무게 변경',
    text: (d) => d.changeSpeed,
    render: (d) => (
      <>
        {d.changeSpeed}
        {d.sellerSpeedClaim && <span className="dbx-sub">판매자 표현 「{d.sellerSpeedClaim}」 · 실측 아님</span>}
      </>
    ),
  },
  { label: '유격·소음', text: (d) => d.playNoise },
  { label: '사용감', text: (d) => d.feel },
  { label: '체결 확인', text: (d) => METHOD_CHECK[d.method] },
  {
    label: '구조 설명',
    text: (d) => d.lockingSeller,
    render: (d) => (
      <>
        <span className="dbx-tag">판매자 설명</span>
        {d.lockingSeller}
      </>
    ),
  },
  {
    label: '후기',
    text: (d) => d.reviews,
    render: (d) => (
      <>
        <span className="dbx-tag">카페 후기</span>
        {d.reviews}
      </>
    ),
  },
  { label: '조사 당시', text: (d) => d.storeRecord },
];

interface Props {
  items: Dumbbell[];
  diffOnly: boolean;
  onRemove: (id: string) => void;
}

export function CompareView({ items, diffOnly, onRemove }: Props) {
  const rows = ROWS.map((r) => {
    const texts = items.map(r.text);
    const isDiff = new Set(texts).size > 1;
    const nums = r.num ? items.map(r.num).filter((n): n is number => n !== null) : [];
    const ctx: Ctx = {
      min: nums.length ? Math.min(...nums) : null,
      max: nums.length ? Math.max(...nums) : null,
    };
    return { r, isDiff, ctx };
  }).filter((x) => !diffOnly || items.length < 2 || x.isDiff);

  return (
    <div className="dbx-cwrap">
      {/* PC(≥760px): 가로 비교 표 */}
      <table className="dbx-ctable dbx-c-desktop">
        <caption className="dbx-sr">선택한 덤벨 나란히 비교</caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="dbx-sr">항목</span>
            </th>
            {items.map((d) => (
              <th key={d.id} scope="col">
                <div className="dbx-ccol-head">
                  <span>
                    <ProductName d={d} />
                    {d.variant && <span className="dbx-sub">{d.variant}</span>}
                  </span>
                  <button
                    type="button"
                    className="dbx-x"
                    onClick={() => onRemove(d.id)}
                    aria-label={`${d.name} 비교에서 빼기`}
                  >
                    ✕
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ r, isDiff, ctx }) => (
            <tr key={r.label} className={isDiff && items.length > 1 ? 'is-diff' : undefined}>
              <th scope="row">{r.label}</th>
              {items.map((d) => {
                const v = r.num ? r.num(d) : null;
                const target = r.bestIs === 'min' ? ctx.min : ctx.max;
                const best = items.length > 1 && isDiff && v !== null && target !== null && v === target;
                return (
                  <td key={d.id} className={best ? 'is-best' : undefined}>
                    {r.render ? r.render(d, ctx) : r.text(d)}
                    {best && r.bestLabel && <span className="dbx-flag">{r.bestLabel}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 모바일(≤759px): 가로 스크롤 없는 세로형 항목별 나란히 비교 */}
      <div
        className="dbx-cmobile dbx-c-mobile"
        style={{ '--cmp-cols': items.length } as React.CSSProperties}
      >
        <div className="dbx-cm-head">
          {items.map((d) => (
            <div key={d.id} className="dbx-cm-prod">
              <div className="dbx-cm-prod-top">
                <span className="dbx-cm-prod-name">
                  <ProductName d={d} />
                </span>
                <button
                  type="button"
                  className="dbx-x dbx-cm-x"
                  onClick={() => onRemove(d.id)}
                  aria-label={`${d.name} 비교에서 빼기`}
                >
                  ✕
                </button>
              </div>
              {d.variant && <span className="dbx-sub">{d.variant}</span>}
            </div>
          ))}
        </div>
        <div className="dbx-cm-body">
          {rows.map(({ r, isDiff, ctx }) => (
            <section
              key={r.label}
              className={`dbx-cm-row${isDiff && items.length > 1 ? ' is-diff' : ''}`}
            >
              <h3 className="dbx-cm-label">{r.label}</h3>
              <div className="dbx-cm-vals">
                {items.map((d) => {
                  const v = r.num ? r.num(d) : null;
                  const target = r.bestIs === 'min' ? ctx.min : ctx.max;
                  const best = items.length > 1 && isDiff && v !== null && target !== null && v === target;
                  return (
                    <div key={d.id} className={`dbx-cm-val${best ? ' is-best' : ''}`}>
                      <div>{r.render ? r.render(d, ctx) : r.text(d)}</div>
                      {best && r.bestLabel && <span className="dbx-flag">{r.bestLabel}</span>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {diffOnly && items.length > 1 && rows.length === 0 && (
        <p className="dbx-empty dbx-muted">고른 제품끼리 다른 항목이 없습니다.</p>
      )}
    </div>
  );
}
