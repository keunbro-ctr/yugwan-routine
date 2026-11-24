'use client';

import { useEffect, useMemo, useState } from 'react';
import { DUMBBELLS, MAX_COMPARE, SURVEY_DATE_LABEL, getDumbbell } from '@/lib/dumbbells';
import {
  DEFAULT_QUERY,
  SORT_LABEL,
  isFilterActive,
  relaxSuggestions,
  runQuery,
  serializeQuery,
  toggleCompare,
  type QueryState,
  type SortKey,
} from '@/lib/dumbbellQuery';
import { CompareView } from './CompareView';
import { FilterPanel, activeChips } from './FilterPanel';
import { LengthChart } from './LengthChart';
import { ResultCards } from './ResultCards';
import { ResultTable } from './ResultTable';
import { TorriAd } from './TorriAd';
import { WeightCalculator } from './WeightCalculator';

interface Props {
  initial: QueryState;
}

export function DumbbellCompare({ initial }: Props) {
  const [q, setQ] = useState<QueryState>(initial);
  const [open, setOpen] = useState<string[]>([]);
  const [mobileTable, setMobileTable] = useState(false);

  // 상태 → URL. 히스토리를 쌓지 않고 현재 주소만 바꾼다 (새로고침·공유 시 같은 상태로 복원)
  useEffect(() => {
    const qs = serializeQuery(q);
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, '', next);
    }
  }, [q]);

  const update = (patch: Partial<QueryState>) => setQ((prev) => ({ ...prev, ...patch }));
  const resetFilters = () =>
    setQ((prev) => ({ ...DEFAULT_QUERY, sort: prev.sort, compare: prev.compare, diffOnly: prev.diffOnly }));

  const result = useMemo(() => runQuery(q), [q]);
  const suggestions = useMemo(
    () => (result.shown.length === 0 ? relaxSuggestions(q) : []),
    [q, result.shown.length],
  );
  const chips = activeChips(q);
  const compared = q.compare.map((id) => getDumbbell(id)!).filter(Boolean);

  const toggleOpen = (id: string) =>
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const onPick = (id: string) => update({ compare: toggleCompare(q.compare, id) });
  const canPickMore = q.compare.length < MAX_COMPARE;

  const lengthItems = compared.length > 0 ? compared : result.shown.map((e) => e.item);

  const listProps = {
    evaluations: result.shown,
    openIds: open,
    onToggleOpen: toggleOpen,
    compareIds: q.compare,
    onPick,
    canPickMore,
  };

  return (
    <>
      <div className="dbx-wrap">
        <header className="dbx-hero">
          <p className="dbx-eyebrow">유관 · 14편 · 무게조절 덤벨 {DUMBBELLS.length}종</p>
          <h1 className="dbx-title">내 홈짐에 맞는 덤벨 찾기</h1>
          <p className="dbx-lead">필요한 무게부터 정하고, 돈을 더 쓸 조건을 골라보세요.</p>
          <p className="dbx-basis">한 쌍 가격 · 배송비 별도 · {SURVEY_DATE_LABEL} 조사</p>
        </header>

        <FilterPanel q={q} update={update} />

        <div className="dbx-summary" aria-live="polite">
          <p className="dbx-count">
            <strong className="dbx-num">{result.shown.length}</strong>개 제품
          </p>
          <div className="dbx-chips">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                className="dbx-chip"
                onClick={() => update(c.clear)}
                aria-label={`${c.label} 조건 해제`}
              >
                {c.label}
                <span aria-hidden="true">✕</span>
              </button>
            ))}
            {isFilterActive(q) && (
              <button type="button" className="dbx-textbtn" onClick={resetFilters}>
                전체 초기화
              </button>
            )}
          </div>
          <label className="dbx-sortwrap">
            <span className="dbx-label">정렬</span>
            <select
              className="dbx-select"
              value={q.sort}
              onChange={(e) => update({ sort: e.target.value as SortKey })}
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {result.hiddenUnsure.length > 0 && (
          <p className="dbx-note">
            값이 확인되지 않았거나 범위가 기준에 걸쳐 판단할 수 없는 제품 {result.hiddenUnsure.length}개를
            결과에서 뺐습니다 ({result.hiddenUnsure.map((e) => e.item.name).join(', ')}).
            <button type="button" className="dbx-textbtn" onClick={() => update({ includeUnsure: true })}>
              확인 필요 제품도 보기
            </button>
          </p>
        )}
        {q.includeUnsure && isFilterActive(q) && (
          <p className="dbx-note">
            확인 필요 제품을 함께 보고 있습니다. 해당 제품에는 「확인 필요」 표시가 붙습니다.
            <button type="button" className="dbx-textbtn" onClick={() => update({ includeUnsure: false })}>
              확정 통과 제품만 보기
            </button>
          </p>
        )}

        {result.shown.length === 0 ? (
          <div className="dbx-panel dbx-empty" role="status">
            <p>조건에 맞는 제품이 없습니다. 조건을 하나 풀어 보세요.</p>
            <div className="dbx-empty-actions">
              {suggestions.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className="dbx-btn"
                  onClick={() =>
                    update(
                      s.key === 'includeUnsure'
                        ? { includeUnsure: true }
                        : { [s.key]: DEFAULT_QUERY[s.key] } as Partial<QueryState>,
                    )
                  }
                >
                  {s.label} → {s.count}개
                </button>
              ))}
              <button type="button" className="dbx-btn dbx-btn-primary" onClick={resetFilters}>
                전체 초기화
              </button>
            </div>
            {q.minWeight !== null && q.minWeight > 36 && (
              <p className="dbx-muted" style={{ marginTop: 12, marginBottom: 0, fontSize: 13 }}>
                이 비교표는 기본 판매 구성 최대 36kg까지입니다. 기존 덤벨에 키트를 붙여 더 무겁게 쓸 수
                있는 제품은 파워블럭(키트로 41kg)과 마스터피스(키트로 64kg)이며, 키트를 붙인 구성은 이
                비교의 가격·길이에 포함되어 있지 않습니다.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="dbx-only-desktop">
              <ResultTable {...listProps} pageSticky />
            </div>
            <div className="dbx-only-mobile">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button
                  type="button"
                  className="dbx-textbtn"
                  aria-pressed={mobileTable}
                  onClick={() => setMobileTable((v) => !v)}
                >
                  {mobileTable ? '카드로 보기' : '전체 표 보기'}
                </button>
              </div>
              {mobileTable ? <ResultTable {...listProps} /> : <ResultCards {...listProps} />}
            </div>
          </>
        )}

        <section className="dbx-section" id="compare" aria-labelledby="compare-title">
          <div className="dbx-section-head">
            <div>
              <h2 className="dbx-h2" id="compare-title">
                골라서 나란히 보기
              </h2>
              <p className="dbx-h2-desc">
                표에서 「비교」를 눌러 최대 {MAX_COMPARE}개까지 고릅니다. 지금 {compared.length}개 선택.
              </p>
            </div>
            {compared.length >= 2 && (
              <label className="dbx-check">
                <input
                  type="checkbox"
                  checked={q.diffOnly}
                  onChange={(e) => update({ diffOnly: e.target.checked })}
                />
                차이만 보기
              </label>
            )}
          </div>
          {compared.length === 0 ? (
            <p className="dbx-panel dbx-empty dbx-muted">아직 고른 제품이 없습니다.</p>
          ) : (
            <CompareView
              items={compared}
              diffOnly={q.diffOnly}
              onRemove={onPick}
            />
          )}
        </section>

        <section className="dbx-section" aria-labelledby="length-title">
          <h2 className="dbx-h2" id="length-title">
            같은 축척으로 본 덤벨 길이
          </h2>
          <p className="dbx-h2-desc">
            {compared.length > 0
              ? '고른 제품의 최대 중량 구성 · 덤벨 단독 길이'
              : '현재 결과 제품의 최대 중량 구성 · 덤벨 단독 길이 (비교로 고르면 그 제품만 표시)'}
          </p>
          <LengthChart items={lengthItems} />
        </section>

        <section className="dbx-section" aria-label="필요한 중량 계산">
          <WeightCalculator
            current={q.minWeight}
            onApply={(kg) => update({ minWeight: kg })}
          />
        </section>

        <footer className="dbx-foot">
          <ul>
            <li>한 쌍 가격은 {SURVEY_DATE_LABEL} 조사 당시 낱개 판매가(쿠폰 적용 전 상품 가격) × 2입니다. 파워블럭은 한 쌍 세트 가격이며 별매 거치대는 빠져 있습니다. 배송비는 따로 적었고, 한 쌍을 한 번에 주문하면 한 번 붙는 것으로 봤습니다.</li>
            <li>제품 이름을 누르면 판매 페이지(네이버 스마트스토어)가 새 창으로 열립니다.</li>
            <li>멜킨 롤튼 링크는 네이버 쇼핑커넥트 제휴 링크로, 구매 시 소정의 수수료가 지급될 수 있습니다.</li>
            <li>평점·리뷰 수·품절 표시는 조사 당시 기록이며 지금 상태가 아닙니다. 구매 전 판매 페이지에서 다시 확인하세요.</li>
            <li>무게 변경 「빠름·느림」은 구조로 나눈 분류입니다. 「0.1초」「1초」는 판매자 표현이며 실측값이 아닙니다.</li>
            <li>안전성은 점수나 등급으로 매기지 않았습니다. 체결 구조(판매자 설명)와 후기(직접·전언)를 나눠 적었습니다. 후기의 「이탈 경험 없음」은 사고가 없다는 증명이 아닙니다.</li>
            <li>후기는 마이홈짐 카페 글을 요약한 것으로, 우리 표와 다른 모델·이전 모델 이야기가 섞여 있을 수 있습니다.</li>
            <li>바이줌, 최대 24kg 모델, 써클은 비교 대상에서 뺐습니다.</li>
          </ul>
        </footer>
      </div>

      <TorriAd raised={compared.length > 0} />

      {compared.length > 0 && (
        <div className="dbx-bar" role="region" aria-label="비교 선택 목록">
          <div className="dbx-wrap dbx-bar-inner">
            <span className="dbx-bar-label">
              비교 {compared.length}/{MAX_COMPARE}
            </span>
            <div className="dbx-bar-items">
              {compared.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className="dbx-chip"
                  onClick={() => onPick(d.id)}
                  aria-label={`${d.name} 비교에서 빼기`}
                >
                  {d.name}
                  <span aria-hidden="true">✕</span>
                </button>
              ))}
            </div>
            <a href="#compare" className="dbx-btn dbx-btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
              비교 보기
            </a>
            <button type="button" className="dbx-textbtn" onClick={() => update({ compare: [], diffOnly: false })}>
              비우기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
