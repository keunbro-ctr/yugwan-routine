'use client';

import { useId, useState } from 'react';
import { METHOD_LABEL, formatKg, formatWon, type Method } from '@/lib/dumbbells';
import { DEFAULT_QUERY, FILTER_METHODS, type QueryState } from '@/lib/dumbbellQuery';
import { Chevron } from './Cells';

const BUDGETS = [350000, 450000, 550000, 600000, 650000];
const LENGTHS = [360, 370, 400, 440];
const STEPS = [1, 1.5, 2, 2.25, 4, 5];

function withCurrent(list: number[], current: number | null): number[] {
  if (current === null || list.includes(current)) return list;
  return [...list, current].sort((a, b) => a - b);
}

function budgetLabel(n: number): string {
  return n % 10000 === 0 ? `${n / 10000}만 원 이하` : `${formatWon(n)}원 이하`;
}

export function activeChips(q: QueryState): { key: string; label: string; clear: Partial<QueryState> }[] {
  const chips: { key: string; label: string; clear: Partial<QueryState> }[] = [];
  if (q.budget !== null)
    chips.push({ key: 'budget', label: `한 쌍 ${budgetLabel(q.budget)}`, clear: { budget: null } });
  if (q.minWeight !== null)
    chips.push({ key: 'kg', label: `한 손 ${formatKg(q.minWeight)} 이상`, clear: { minWeight: null } });
  if (q.methods.length > 0)
    chips.push({ key: 'm', label: q.methods.map((m) => METHOD_LABEL[m]).join('·'), clear: { methods: [] } });
  if (q.maxLength !== null)
    chips.push({ key: 'len', label: `길이 ${q.maxLength}mm 이하`, clear: { maxLength: null } });
  if (q.maxStep !== null)
    chips.push({ key: 'step', label: `간격 ${formatKg(q.maxStep)} 이하`, clear: { maxStep: null } });
  if (q.kitOnly) chips.push({ key: 'kit', label: '확장 키트 지원', clear: { kitOnly: false } });
  return chips;
}

interface Props {
  q: QueryState;
  update: (patch: Partial<QueryState>) => void;
}

export function FilterPanel({ q, update }: Props) {
  const id = useId();
  const [kgText, setKgText] = useState(q.minWeight === null ? '' : String(q.minWeight));
  const [syncedKg, setSyncedKg] = useState(q.minWeight);
  // 모바일에서만 접힌다 (데스크톱은 CSS로 항상 표시)
  const [open, setOpen] = useState(false);

  // 계산기·칩 해제 등 바깥에서 값이 바뀌면 입력창을 맞춘다 (렌더 중 상태 보정)
  if (syncedKg !== q.minWeight) {
    setSyncedKg(q.minWeight);
    const parsed = kgText.trim() === '' ? null : Number(kgText);
    if (parsed !== q.minWeight) setKgText(q.minWeight === null ? '' : String(q.minWeight));
  }

  const onKg = (text: string) => {
    setKgText(text);
    const t = text.trim();
    if (t === '') return update({ minWeight: null });
    const n = Number(t);
    if (Number.isFinite(n) && n > 0 && n <= 200) update({ minWeight: n });
  };

  const toggleMethod = (m: Method) =>
    update({ methods: q.methods.includes(m) ? q.methods.filter((x) => x !== m) : [...q.methods, m] });

  const activeCount = activeChips(q).length;

  return (
    <>
      <button
        type="button"
        className="dbx-filter-toggle"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>
          조건 고르기{' '}
          <small>{activeCount > 0 ? `${activeCount}개 적용 중` : '무게·예산·방식·길이·간격·확장'}</small>
        </span>
        <Chevron />
      </button>
      <section
        id={`${id}-panel`}
        className={`dbx-panel dbx-filters${open ? '' : ' is-collapsed'}`}
        aria-label="조건 필터"
      >
        <label className="dbx-field" htmlFor={`${id}-kg`}>
          <span className="dbx-label">필요한 한 손 최대 중량</span>
          <span className="dbx-inputrow">
            <input
              id={`${id}-kg`}
              className="dbx-input dbx-num"
              type="number"
              inputMode="decimal"
              min={1}
              max={200}
              step={0.5}
              placeholder="예: 32"
              value={kgText}
              onChange={(e) => onKg(e.target.value)}
            />
            <span className="dbx-unit">kg 이상</span>
          </span>
        </label>

        <label className="dbx-field">
          <span className="dbx-label">한 쌍 예산 상한</span>
          <select
            className="dbx-select"
            value={q.budget ?? ''}
            onChange={(e) => update({ budget: e.target.value === '' ? null : Number(e.target.value) })}
          >
            <option value="">상관없음</option>
            {withCurrent(BUDGETS, q.budget).map((b) => (
              <option key={b} value={b}>
                {budgetLabel(b)}
              </option>
            ))}
          </select>
        </label>

        <div className="dbx-field dbx-field-wide" role="group" aria-labelledby={`${id}-m`}>
          <span className="dbx-label" id={`${id}-m`}>
            조절 방식 <span className="dbx-muted">(여러 개 선택)</span>
          </span>
          <div className="dbx-seg">
            {FILTER_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={q.methods.includes(m)}
                onClick={() => toggleMethod(m)}
              >
                {METHOD_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <label className="dbx-field">
          <span className="dbx-label">덤벨 단독 길이</span>
          <select
            className="dbx-select"
            value={q.maxLength ?? ''}
            onChange={(e) => update({ maxLength: e.target.value === '' ? null : Number(e.target.value) })}
          >
            <option value="">상관없음</option>
            {withCurrent(LENGTHS, q.maxLength).map((l) => (
              <option key={l} value={l}>
                {l}mm 이하
              </option>
            ))}
          </select>
        </label>

        <label className="dbx-field">
          <span className="dbx-label">조절 간격</span>
          <select
            className="dbx-select"
            value={q.maxStep ?? ''}
            onChange={(e) => update({ maxStep: e.target.value === '' ? null : Number(e.target.value) })}
          >
            <option value="">상관없음</option>
            {withCurrent(STEPS, q.maxStep).map((s) => (
              <option key={s} value={s}>
                {formatKg(s)} 이하
              </option>
            ))}
          </select>
        </label>

        <label className="dbx-check">
          <input
            type="checkbox"
            checked={q.kitOnly}
            onChange={(e) => update({ kitOnly: e.target.checked ?? DEFAULT_QUERY.kitOnly })}
          />
          <span>
            확장 키트 지원만
            <span className="dbx-sub">기존 덤벨에 붙이는 방식</span>
          </span>
        </label>
      </section>
    </>
  );
}
