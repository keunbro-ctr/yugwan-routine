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
import type { Evaluation } from '@/lib/dumbbellQuery';

export interface ListProps {
  evaluations: Evaluation[];
  openIds: string[];
  onToggleOpen: (id: string) => void;
  compareIds: string[];
  onPick: (id: string) => void;
  canPickMore: boolean;
}

export function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Price({ d }: { d: Dumbbell }) {
  return (
    <span>
      <span className="dbx-price dbx-num">
        {formatWon(d.pairPrice)}
        <span className="dbx-muted" style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 12 }}>
          원
        </span>
      </span>
    </span>
  );
}

/** 배송비 — 한 쌍 가격과 따로 (주문당 1회) */
export function ShippingCell({ d }: { d: Dumbbell }) {
  if (d.shipping === null) return <em className="dbx-unsure">확인 필요</em>;
  if (d.shipping === 'free') return <span className="dbx-muted">무료</span>;
  return <span className="dbx-num">{formatWon(d.shipping)}원</span>;
}

/** 제품 이름 — 판매 페이지로 바로 가는 링크 */
export function ProductName({ d }: { d: Dumbbell }) {
  if (!d.url) return <>{d.name}</>;
  return (
    <a className="dbx-namelink" href={d.url} target="_blank" rel={d.affiliate ? 'sponsored noopener' : 'noopener noreferrer'} title="판매 페이지 열기 (새 창)">
      {d.name}
      <svg className="dbx-namelink-ico" width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M5 2H2v8h8V7M7 2h3v3M10 2L5.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="dbx-sr"> (판매 페이지, 새 창)</span>
    </a>
  );
}

export function LengthCell({ d }: { d: Dumbbell }) {
  if (d.length.kind === 'unknown') return <em className="dbx-unsure">확인 필요</em>;
  return <span className="dbx-num">{formatLength(d.length)}</span>;
}

export function StepCell({ d }: { d: Dumbbell }) {
  return (
    <span>
      <span className="dbx-num">{d.step.label}</span>
      {d.step.fineNote && <span className="dbx-sub">무게추로 세분 가능</span>}
    </span>
  );
}

export function MethodCell({ d }: { d: Dumbbell }) {
  if (d.method === 'unknown') return <em className="dbx-unsure">확인 필요</em>;
  return <span>{METHOD_LABEL[d.method]}</span>;
}

export function ExpansionCell({ d }: { d: Dumbbell }) {
  const e = d.expansion;
  if (e.kind === 'unknown') return <em className="dbx-unsure">확인 필요</em>;
  if (e.kind === 'kit')
    return (
      <span>
        <span className="dbx-strong">{formatExpansion(e)}</span>
        <span className="dbx-sub">
          {e.kitPrice !== null ? `키트 ${formatWon(e.kitPrice)}원 별도` : '키트 가격 미확인'}
        </span>
      </span>
    );
  return <span className={e.kind === 'none' ? 'dbx-muted' : undefined}>{formatExpansion(e)}</span>;
}

export function UnsureFlag({ ev }: { ev: Evaluation }) {
  if (ev.verdict !== 'unsure') return null;
  return (
    <span className="dbx-flag" title={ev.unsureReasons.join(' · ')}>
      확인 필요
    </span>
  );
}

export function PickBox({
  d,
  checked,
  disabled,
  onPick,
}: {
  d: Dumbbell;
  checked: boolean;
  disabled: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <label className="dbx-pick" title={disabled ? '최대 3개까지 고를 수 있습니다' : undefined}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={() => onPick(d.id)}
        aria-label={`${d.name} 비교에 담기`}
      />
      <span>비교</span>
    </label>
  );
}

export function Detail({ d, ev }: { d: Dumbbell; ev?: Evaluation }) {
  const e = d.expansion;
  return (
    <div className="dbx-detail">
      {ev && ev.verdict === 'unsure' && (
        <p className="dbx-note" style={{ gridColumn: '1 / -1', margin: '8px 0 0' }}>
          조건 판단 보류: {ev.unsureReasons.join(' · ')}
        </p>
      )}
      <div className="dbx-dgroup">
        <h4>가격·규격</h4>
        <dl className="dbx-dl">
          <dt>가격 구성</dt>
          <dd>
            {d.priceNote}
            <span className="dbx-sub">
              배송비 {formatShipping(d.shipping)} · 한 쌍 가격과 별도, 주문당 1회 · {d.checked} 확인
            </span>
          </dd>
          <dt>최소 무게</dt>
          <dd className="dbx-num">{d.minKg === null ? <em className="dbx-unsure">확인 필요</em> : formatKg(d.minKg)}</dd>
          <dt>조절 간격</dt>
          <dd>
            {d.step.label}
            {d.step.fineNote && <span className="dbx-sub">{d.step.fineNote}</span>}
          </dd>
          <dt>길이</dt>
          <dd>
            {d.length.kind === 'unknown' ? d.length.reason : formatLength(d.length)}
            {(d.length.kind === 'approx' || d.length.kind === 'range') && (
              <span className="dbx-sub">{d.length.basis}</span>
            )}
            {d.lengthNote && <span className="dbx-sub">{d.lengthNote}</span>}
          </dd>
          <dt>확장</dt>
          <dd>
            {e.note}
            {e.kind === 'kit' && e.kitPrice !== null && (
              <span className="dbx-sub">키트 {formatWon(e.kitPrice)}원 (2026-11-12 조사, 배송비 제외) — 위 한 쌍 가격에는 없음</span>
            )}
          </dd>
        </dl>
      </div>

      <div className="dbx-dgroup">
        <h4>쓰는 느낌</h4>
        <dl className="dbx-dl">
          <dt>무게 변경</dt>
          <dd>
            {d.changeSpeed}
            {d.sellerSpeedClaim && (
              <span className="dbx-sub">판매자 표현 「{d.sellerSpeedClaim}」 · 실측 아님</span>
            )}
          </dd>
          <dt>유격·소음</dt>
          <dd>{d.playNoise}</dd>
          <dt>사용감</dt>
          <dd>{d.feel}</dd>
        </dl>
      </div>

      <div className="dbx-dgroup">
        <h4>체결 구조와 확인</h4>
        <dl className="dbx-dl">
          <dt>체결 확인</dt>
          <dd>{METHOD_CHECK[d.method]}</dd>
          <dt>구조 설명</dt>
          <dd>
            <span className="dbx-tag">판매자 설명</span>
            {d.lockingSeller}
          </dd>
          <dt>후기</dt>
          <dd>
            <span className="dbx-tag">카페 후기</span>
            {d.reviews}
          </dd>
        </dl>
      </div>

      <div className="dbx-dgroup" style={{ gridColumn: '1 / -1' }}>
        <dl className="dbx-dl">
          <dt>조사 당시</dt>
          <dd>{d.storeRecord}</dd>
          <dt>출처</dt>
          <dd>{d.sources.join(' · ')}</dd>
        </dl>
      </div>
    </div>
  );
}
