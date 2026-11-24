import { describe, expect, it } from 'vitest';
import { DUMBBELLS, formatLength, getDumbbell } from './dumbbells';
import {
  DEFAULT_QUERY,
  calcOneHandKg,
  parseQuery,
  relaxSuggestions,
  runQuery,
  serializeQuery,
  toggleCompare,
  type QueryState,
} from './dumbbellQuery';

// 「덤벨 제품 조사」 261124 추가내용 기준. 한 쌍 가격 = 낱개 × 2 (파워블럭은 세트). 배송비는 따로
const SOURCE: [string, string, number, number, string, string][] = [
  ['orbel', 'dial', 32, 676000, '365mm', '1kg'],
  ['powerblock-exp70', 'pin', 31, 670000, '355mm', '4~5kg'],
  ['onequick', 'dial', 32, 658000, '430mm', '1kg'],
  ['nuobell-new', 'dial', 32, 628000, '435mm', '2kg'],
  ['musclepeak', 'dial', 32.5, 612000, '400mm', '1.5kg'],
  ['nuobell', 'dial', 32, 608000, '435mm', '2kg'],
  ['griptone', 'dial', 32, 538000, '435mm', '1kg'],
  ['masterpiece', 'screw', 32, 484000, '320~345mm', '2kg'],
  ['rolton-03', 'dial', 36, 434000, '약 440mm', '2.25kg'],
  ['rolton-04', 'dial', 36, 338000, '약 440mm', '4kg'],
];

const q = (patch: Partial<QueryState>): QueryState => ({ ...DEFAULT_QUERY, ...patch });
const ids = (r: ReturnType<typeof runQuery>) => r.shown.map((e) => e.item.id);

describe('비교 데이터 ↔ 원자료', () => {
  it('10개 제품, 기본 정렬은 원자료의 가격 높은 순과 같다', () => {
    expect(DUMBBELLS).toHaveLength(10);
    expect(ids(runQuery(DEFAULT_QUERY))).toEqual(SOURCE.map((s) => s[0]));
  });

  it.each(SOURCE)('%s 의 방식·중량·가격·길이·간격', (id, method, kg, price, len, step) => {
    const d = getDumbbell(id)!;
    expect(d.method).toBe(method);
    expect(d.maxKg).toBe(kg);
    expect(d.pairPrice).toBe(price);
    expect(formatLength(d.length)).toBe(len);
    expect(d.step.label).toBe(step);
  });

  it('롤튼 03/04 가격·간격이 섞이지 않는다', () => {
    const r3 = getDumbbell('rolton-03')!;
    const r4 = getDumbbell('rolton-04')!;
    expect([r3.pairPrice, r3.step.min]).toEqual([434000, 2.25]);
    expect([r4.pairPrice, r4.step.min]).toEqual([338000, 4]);
  });

  it('써클은 비교 대상에서 뺐다', () => {
    expect(getDumbbell('circle')).toBeUndefined();
  });

  it('바이줌·24kg 모델이 없다', () => {
    expect(DUMBBELLS.some((d) => /바이줌/.test(d.name))).toBe(false);
    expect(DUMBBELLS.every((d) => d.maxKg >= 30)).toBe(true);
  });

  it('링크는 원자료 상품번호만', () => {
    for (const d of DUMBBELLS) {
      if (!d.url) continue;
      if (d.affiliate) expect(d.url).toMatch(/^https:\/\/naver\.me\/\w+$/);
      else expect(d.url).toMatch(/^https:\/\/(brand|smartstore)\.naver\.com\/[\w-]+\/products\/\d+$/);
    }
  });
});

describe('필터', () => {
  it('중량은 기본 구성으로만 — 키트 용량으로 통과시키지 않는다', () => {
    // 33.4kg 이상: 36kg 기본 구성(롤튼 2개)만. 파워블럭(키트 41kg)·마스터피스(32kg, 확장 65kg)의 확장 용량은 무시
    expect(ids(runQuery(q({ minWeight: 33.4 })))).toEqual(['rolton-03', 'rolton-04']);
    expect(ids(runQuery(q({ minWeight: 37 })))).toEqual([]);
  });

  it('길이: 범위가 기준에 걸치면 확인 필요, 미확인은 0으로 보지 않는다', () => {
    // 마스터피스 320~345mm 가 330 기준에 걸친다
    const r = runQuery(q({ maxLength: 330 }));
    expect(ids(r)).toEqual([]);
    expect(r.hiddenUnsure.map((e) => e.item.id)).toEqual(['masterpiece']);

    const withUnsure = runQuery(q({ maxLength: 330, includeUnsure: true }));
    expect(ids(withUnsure)).toContain('masterpiece');

    // 범위 상한까지 포함하면 확정 통과
    expect(ids(runQuery(q({ maxLength: 345 })))).toEqual(['masterpiece']);
    expect(ids(runQuery(q({ maxLength: 365 })))).toEqual(['orbel', 'powerblock-exp70', 'masterpiece']);
  });

  it('근삿값 440은 440 기준에서 통과, 439에서 탈락', () => {
    expect(ids(runQuery(q({ maxLength: 440 })))).toContain('rolton-04');
    expect(ids(runQuery(q({ maxLength: 439 })))).not.toContain('rolton-04');
  });

  it('조절 간격: 파워블럭 4~5kg은 4kg 기준에 걸쳐 확인 필요, 5kg 기준에서 통과', () => {
    const r4 = runQuery(q({ maxStep: 4 }));
    expect(ids(r4)).not.toContain('powerblock-exp70');
    expect(r4.hiddenUnsure.map((e) => e.item.id)).toEqual(['powerblock-exp70']);
    expect(ids(runQuery(q({ maxStep: 5 })))).toContain('powerblock-exp70');
    expect(ids(runQuery(q({ maxStep: 1 })))).toEqual(['orbel', 'onequick', 'griptone']);
  });

  it('방식 필터', () => {
    expect(ids(runQuery(q({ methods: ['dial'] })))).toHaveLength(8);
    expect(ids(runQuery(q({ methods: ['pin', 'screw'] })))).toEqual(['powerblock-exp70', 'masterpiece']);
  });

  it('확장 키트: 상위 모델 교체는 키트가 아니다', () => {
    const r = runQuery(q({ kitOnly: true }));
    expect(ids(r)).toEqual(['powerblock-exp70', 'masterpiece']);
    expect(r.hiddenUnsure.map((e) => e.item.id)).toEqual([]);
  });

  it('예산', () => {
    expect(ids(runQuery(q({ budget: 450000 })))).toEqual(['rolton-03', 'rolton-04']);
    expect(ids(runQuery(q({ budget: 430000 })))).toEqual(['rolton-04']); // 예산은 배송비 제외 한 쌍 가격 기준
    expect(ids(runQuery(q({ budget: 338000 })))).toEqual(['rolton-04']);
    expect(ids(runQuery(q({ budget: 337000 })))).toEqual([]);
  });

  it('결과 0개면 완화 제안이 나온다', () => {
    const state = q({ budget: 450000, minWeight: 36, maxLength: 400 });
    expect(runQuery(state).shown).toHaveLength(0);
    const s = relaxSuggestions(state);
    expect(s.length).toBeGreaterThan(0);
    expect(s.find((x) => x.key === 'maxLength')?.count).toBe(2); // 롤튼 2.25kg·4kg 단위
  });
});

describe('정렬', () => {
  it('가격 낮은 순', () => {
    expect(ids(runQuery(q({ sort: 'price-asc' })))).toEqual(SOURCE.map((s) => s[0]).reverse());
  });
  it('길이 짧은 순 — 범위는 상한 기준', () => {
    const order = ids(runQuery(q({ sort: 'length-asc' })));
    expect(order.slice(0, 3)).toEqual(['masterpiece', 'powerblock-exp70', 'orbel']);
    expect(order.at(-1)).toBe('rolton-04');
  });
});

describe('비교 선택·URL', () => {
  it('최대 3개', () => {
    let list: string[] = [];
    for (const id of ['orbel', 'griptone', 'rolton-03', 'rolton-04']) list = toggleCompare(list, id);
    expect(list).toEqual(['orbel', 'griptone', 'rolton-03']);
    expect(toggleCompare(list, 'griptone')).toEqual(['orbel', 'rolton-03']);
  });

  it('직렬화 → 파싱 왕복', () => {
    const state = q({
      budget: 600000,
      minWeight: 33.4,
      methods: ['pin', 'screw'],
      maxLength: 400,
      maxStep: 2,
      kitOnly: true,
      includeUnsure: true,
      sort: 'length-asc',
      compare: ['powerblock-exp70', 'masterpiece'],
      diffOnly: true,
    });
    const qs = serializeQuery(state);
    expect(qs).toContain('c=powerblock-exp70,masterpiece');
    expect(parseQuery(new URLSearchParams(qs))).toEqual(state);
    expect(serializeQuery(DEFAULT_QUERY)).toBe('');
  });

  it('잘못된 값은 버린다', () => {
    const s = parseQuery({ budget: '-1', kg: 'abc', m: 'dial,laser', c: 'x,orbel,orbel,circle,griptone,onequick,musclepeak', sort: 'nope' });
    expect(s.budget).toBeNull();
    expect(s.minWeight).toBeNull();
    expect(s.methods).toEqual(['dial']);
    expect(s.compare).toEqual(['orbel', 'griptone', 'onequick']);
    expect(s.sort).toBe('price-desc');
  });
});

describe('필요한 중량 계산기', () => {
  it('1RM ÷ 3, 8회 중량 × 0.4, 소수 첫째 자리 올림', () => {
    expect(calcOneHandKg('oneRm', 90)).toBe(30);
    expect(calcOneHandKg('oneRm', 100)).toBe(33.4);
    expect(calcOneHandKg('eightRep', 80)).toBe(32);
    expect(calcOneHandKg('oneRm', 0)).toBeNull();
  });
});
