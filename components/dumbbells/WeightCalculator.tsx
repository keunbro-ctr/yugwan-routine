'use client';

import { useId, useState } from 'react';
import { formatKg } from '@/lib/dumbbells';
import { CALC_FORMULA, CALC_LABEL, calcOneHandKg, type CalcMode } from '@/lib/dumbbellQuery';
import { Chevron } from './Cells';

interface Props {
  current: number | null;
  onApply: (kg: number) => void;
}

export function WeightCalculator({ current, onApply }: Props) {
  const id = useId();
  const [mode, setMode] = useState<CalcMode>('oneRm');
  const [text, setText] = useState('');
  const value = text.trim() === '' ? null : calcOneHandKg(mode, Number(text));
  const applied = value !== null && current === value;

  return (
    <details className="dbx-panel dbx-calc">
      <summary>
        <span>
          필요한 무게 계산하기
          <small>벤치프레스 기록으로 한 손 덤벨 기준을 가늠합니다</small>
        </span>
        <Chevron />
      </summary>
      <div className="dbx-calc-body">
        <div className="dbx-field" role="group" aria-labelledby={`${id}-mode`}>
          <span className="dbx-label" id={`${id}-mode`}>
            입력할 기록
          </span>
          <div className="dbx-seg">
            {(Object.keys(CALC_LABEL) as CalcMode[]).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
                {m === 'oneRm' ? '1RM' : '약 8회 중량'}
              </button>
            ))}
          </div>
        </div>
        <label className="dbx-field" htmlFor={`${id}-in`}>
          <span className="dbx-label">
            {CALC_LABEL[mode]} · {CALC_FORMULA[mode]}
          </span>
          <span className="dbx-inputrow" style={{ maxWidth: 260 }}>
            <input
              id={`${id}-in`}
              className="dbx-input dbx-num"
              type="number"
              inputMode="decimal"
              min={1}
              max={500}
              placeholder={mode === 'oneRm' ? '예: 100' : '예: 80'}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <span className="dbx-unit">kg</span>
          </span>
        </label>
        <div className="dbx-calc-result" aria-live="polite">
          <span className="dbx-label">한 손 덤벨 기준</span>
          <span className="dbx-calc-num">{value === null ? '—' : formatKg(value)}</span>
          <button
            type="button"
            className="dbx-btn dbx-btn-primary"
            disabled={value === null || applied}
            onClick={() => value !== null && onApply(value)}
          >
            {applied ? '필터에 적용됨' : '이 무게 이상으로 거르기'}
          </button>
        </div>
        <p className="dbx-muted" style={{ fontSize: 12.5, margin: 0 }}>
          영상에서 제안하는 구매 기준용 근사치입니다. 개인의 수행 능력을 예측하지 않습니다. 필터는 가격에
          포함된 기본 구성의 최대 중량으로만 거르고, 확장 키트나 상위 모델 용량은 섞지 않습니다.
        </p>
      </div>
    </details>
  );
}
