'use client';

import { formatKg } from '@/lib/dumbbells';
import {
  Chevron,
  Detail,
  ExpansionCell,
  LengthCell,
  MethodCell,
  PickBox,
  Price,
  ProductName,
  ShippingCell,
  StepCell,
  UnsureFlag,
  type ListProps,
} from './Cells';

export function ResultCards({ evaluations, openIds, onToggleOpen, compareIds, onPick, canPickMore }: ListProps) {
  return (
    <ul className="dbx-cards">
      {evaluations.map((ev) => {
        const d = ev.item;
        const isOpen = openIds.includes(d.id);
        const picked = compareIds.includes(d.id);
        const detailId = `dbx-card-detail-${d.id}`;
        return (
          <li key={d.id} className="dbx-panel dbx-card">
            <div className="dbx-card-head">
              <div className="dbx-card-titlewrap">
                <p className="dbx-card-name">
                  <ProductName d={d} />
                  <span className="dbx-card-method-pill">
                    <MethodCell d={d} />
                  </span>
                  <UnsureFlag ev={ev} />
                </p>
                {d.variant && <p className="dbx-card-method">{d.variant}</p>}
              </div>
              <Price d={d} />
            </div>
            <dl className="dbx-card-stats">
              <div className="dbx-stat">
                <dt>한 손 최대</dt>
                <dd>{formatKg(d.maxKg)}</dd>
              </div>
              <div className="dbx-stat">
                <dt>길이 (덤벨만)</dt>
                <dd>
                  <LengthCell d={d} />
                </dd>
              </div>
              <div className="dbx-stat">
                <dt>조절 간격</dt>
                <dd>
                  <StepCell d={d} />
                </dd>
              </div>
            </dl>
            <dl className="dbx-card-meta">
              <div className="dbx-meta-item">
                <dt>배송</dt>
                <dd>
                  <ShippingCell d={d} />
                </dd>
              </div>
              <div className="dbx-meta-item">
                <dt>확장</dt>
                <dd>
                  <ExpansionCell d={d} />
                </dd>
              </div>
            </dl>
            <div className="dbx-card-foot">
              <PickBox d={d} checked={picked} disabled={!picked && !canPickMore} onPick={onPick} />
              <button
                type="button"
                className="dbx-textbtn"
                aria-expanded={isOpen}
                aria-controls={detailId}
                onClick={() => onToggleOpen(d.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', padding: '2px 0', minHeight: 26 }}
              >
                {isOpen ? '상세 접기' : '상세 보기'}
                <span className="dbx-expand" aria-hidden="true" style={{ width: 22, height: 22 }}>
                  <span style={{ display: 'inline-flex', transform: isOpen ? 'rotate(90deg)' : undefined }}>
                    <Chevron />
                  </span>
                </span>
              </button>
            </div>
            {isOpen && (
              <div id={detailId}>
                <Detail d={d} ev={ev} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
