'use client';

import { Fragment } from 'react';
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

const COLS = 9;

export function ResultTable({
  evaluations,
  openIds,
  onToggleOpen,
  compareIds,
  onPick,
  canPickMore,
  pageSticky = false,
}: ListProps & { pageSticky?: boolean }) {
  return (
    <div className={`dbx-tablewrap${pageSticky ? ' is-page-sticky' : ''}`}>
      <table className="dbx-table">
        <caption className="dbx-sr">무게조절 덤벨 비교표</caption>
        <thead>
          <tr>
            <th scope="col" className="dbx-sticky">
              제품
            </th>
            <th scope="col" className="is-num">
              한 쌍 가격
            </th>
            <th scope="col" className="is-num">
              배송비
            </th>
            <th scope="col" className="is-num">
              한 손 최대
            </th>
            <th scope="col" className="is-num">
              길이 (덤벨만)
            </th>
            <th scope="col">조절 간격</th>
            <th scope="col">방식</th>
            <th scope="col">확장성</th>
            <th scope="col">
              <span className="dbx-sr">비교 선택</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {evaluations.map((ev) => {
            const d = ev.item;
            const isOpen = openIds.includes(d.id);
            const picked = compareIds.includes(d.id);
            const detailId = `dbx-detail-${d.id}`;
            return (
              <Fragment key={d.id}>
                <tr className={`dbx-row${isOpen ? ' is-open' : ''}`}>
                  <th scope="row" className="dbx-sticky" style={{ fontWeight: 400 }}>
                    <div className="dbx-pname">
                      <button
                        type="button"
                        className="dbx-expand"
                        aria-expanded={isOpen}
                        aria-controls={detailId}
                        aria-label={`${d.name} 상세 ${isOpen ? '접기' : '펼치기'}`}
                        onClick={() => onToggleOpen(d.id)}
                      >
                        <Chevron />
                      </button>
                      <span className="dbx-pname-text">
                        <b>
                          <ProductName d={d} />
                          <UnsureFlag ev={ev} />
                        </b>
                        {d.variant && <small>{d.variant}</small>}
                      </span>
                    </div>
                  </th>
                  <td className="is-num">
                    <Price d={d} />
                  </td>
                  <td className="is-num">
                    <ShippingCell d={d} />
                  </td>
                  <td className="is-num">{formatKg(d.maxKg)}</td>
                  <td className="is-num">
                    <LengthCell d={d} />
                  </td>
                  <td>
                    <StepCell d={d} />
                  </td>
                  <td>
                    <MethodCell d={d} />
                  </td>
                  <td>
                    <ExpansionCell d={d} />
                  </td>
                  <td>
                    <PickBox d={d} checked={picked} disabled={!picked && !canPickMore} onPick={onPick} />
                  </td>
                </tr>
                {isOpen && (
                  <tr className="dbx-detailrow" id={detailId}>
                    <td colSpan={COLS}>
                      <Detail d={d} ev={ev} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
