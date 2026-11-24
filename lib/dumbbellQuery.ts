// 덤벨 비교 화면의 필터·정렬·URL 상태 — 화면과 분리된 순수 함수
import { DUMBBELLS, MAX_COMPARE, type Dumbbell, type Method } from './dumbbells';

export type SortKey = 'price-desc' | 'price-asc' | 'length-asc';

export const SORT_LABEL: Record<SortKey, string> = {
  'price-desc': '가격 높은 순',
  'price-asc': '가격 낮은 순',
  'length-asc': '길이 짧은 순',
};

export const FILTER_METHODS: Method[] = ['dial', 'pin', 'screw'];

export interface QueryState {
  /** 한 쌍 예산 상한 (원) */
  budget: number | null;
  /** 필요한 한 손 최대 중량 (kg) — 기본 판매 구성으로만 판단 */
  minWeight: number | null;
  /** 비어 있으면 모든 방식 */
  methods: Method[];
  /** 덤벨 단독 길이 상한 (mm) */
  maxLength: number | null;
  /** 조절 간격 상한 (kg) */
  maxStep: number | null;
  /** 기존 덤벨에 붙이는 확장 키트가 있는 제품만 */
  kitOnly: boolean;
  /** 조건 판단이 안 되는 제품(값 미확인·범위 걸침)을 결과에 함께 보일지 */
  includeUnsure: boolean;
  sort: SortKey;
  compare: string[];
  diffOnly: boolean;
}

export const DEFAULT_QUERY: QueryState = {
  budget: null,
  minWeight: null,
  methods: [],
  maxLength: null,
  maxStep: null,
  kitOnly: false,
  includeUnsure: false,
  sort: 'price-desc',
  compare: [],
  diffOnly: false,
};

/** 조건 하나에 대한 판정. unsure = 값이 미확인이거나 범위가 기준선에 걸쳐 판단할 수 없음 */
export type Verdict = 'pass' | 'fail' | 'unsure';

export interface Evaluation {
  item: Dumbbell;
  verdict: Verdict;
  /** unsure 사유 (화면 표시용) */
  unsureReasons: string[];
}

function lengthVerdict(d: Dumbbell, limit: number): { v: Verdict; why?: string } {
  const m = d.length;
  switch (m.kind) {
    case 'exact':
      return { v: m.value <= limit ? 'pass' : 'fail' };
    case 'approx':
      // 근삿값은 표시값으로 판단하되 '약' 표시를 화면에 유지한다
      return { v: m.value <= limit ? 'pass' : 'fail' };
    case 'range':
      if (m.max <= limit) return { v: 'pass' };
      if (m.min > limit) return { v: 'fail' };
      return { v: 'unsure', why: `길이 ${m.min}~${m.max}mm가 기준 ${limit}mm에 걸침` };
    case 'unknown':
      return { v: 'unsure', why: '덤벨 단독 길이 확인 필요' };
  }
}

function stepVerdict(d: Dumbbell, limit: number): { v: Verdict; why?: string } {
  if (d.step.max <= limit) return { v: 'pass' };
  if (d.step.min > limit) return { v: 'fail' };
  return { v: 'unsure', why: `기본 간격 ${d.step.label} 중 일부만 기준 이내` };
}

export function evaluate(d: Dumbbell, q: QueryState): Evaluation {
  const reasons: string[] = [];
  let failed = false;

  if (q.budget !== null && d.pairPrice > q.budget) failed = true;
  // 기본 판매 구성의 최대 중량만 본다. 확장 키트·상위 모델 용량은 섞지 않는다.
  if (q.minWeight !== null && d.maxKg < q.minWeight) failed = true;

  if (q.methods.length > 0) {
    if (d.method === 'unknown') reasons.push('무게 조절 방식 확인 필요');
    else if (!q.methods.includes(d.method)) failed = true;
  }

  if (q.maxLength !== null) {
    const r = lengthVerdict(d, q.maxLength);
    if (r.v === 'fail') failed = true;
    if (r.v === 'unsure' && r.why) reasons.push(r.why);
  }

  if (q.maxStep !== null) {
    const r = stepVerdict(d, q.maxStep);
    if (r.v === 'fail') failed = true;
    if (r.v === 'unsure' && r.why) reasons.push(r.why);
  }

  if (q.kitOnly) {
    if (d.expansion.kind === 'unknown') reasons.push('확장 방식 확인 필요');
    else if (d.expansion.kind !== 'kit') failed = true;
  }

  if (failed) return { item: d, verdict: 'fail', unsureReasons: [] };
  if (reasons.length > 0) return { item: d, verdict: 'unsure', unsureReasons: reasons };
  return { item: d, verdict: 'pass', unsureReasons: [] };
}

/** 정렬용 길이 — 범위는 상한(보수적), 미확인은 null (항상 맨 뒤) */
export function lengthSortKey(d: Dumbbell): number | null {
  const m = d.length;
  if (m.kind === 'exact' || m.kind === 'approx') return m.value;
  if (m.kind === 'range') return m.max;
  return null;
}

export function sortItems(items: Dumbbell[], sort: SortKey): Dumbbell[] {
  const copy = [...items];
  const byPriceDesc = (a: Dumbbell, b: Dumbbell) => b.pairPrice - a.pairPrice;
  switch (sort) {
    case 'price-desc':
      return copy.sort(byPriceDesc);
    case 'price-asc':
      return copy.sort((a, b) => a.pairPrice - b.pairPrice);
    case 'length-asc':
      return copy.sort((a, b) => {
        const ka = lengthSortKey(a);
        const kb = lengthSortKey(b);
        if (ka === null && kb === null) return byPriceDesc(a, b);
        if (ka === null) return 1;
        if (kb === null) return -1;
        return ka - kb || byPriceDesc(a, b);
      });
  }
}

export interface QueryResult {
  /** 화면에 보일 제품 (정렬 완료) */
  shown: Evaluation[];
  /** 조건 판단이 안 돼 숨긴 제품 (includeUnsure=false일 때) */
  hiddenUnsure: Evaluation[];
  failedCount: number;
}

export function runQuery(q: QueryState, data: Dumbbell[] = DUMBBELLS): QueryResult {
  const evals = data.map((d) => evaluate(d, q));
  const passes = evals.filter((e) => e.verdict === 'pass');
  const unsure = evals.filter((e) => e.verdict === 'unsure');
  const visible = q.includeUnsure ? [...passes, ...unsure] : passes;
  const order = sortItems(
    visible.map((e) => e.item),
    q.sort,
  );
  const byId = new Map(visible.map((e) => [e.item.id, e]));
  return {
    shown: order.map((d) => byId.get(d.id)!),
    hiddenUnsure: q.includeUnsure ? [] : unsure,
    failedCount: evals.filter((e) => e.verdict === 'fail').length,
  };
}

export function isFilterActive(q: QueryState): boolean {
  return (
    q.budget !== null ||
    q.minWeight !== null ||
    q.methods.length > 0 ||
    q.maxLength !== null ||
    q.maxStep !== null ||
    q.kitOnly
  );
}

/** 결과가 0개일 때 어떤 조건을 풀면 몇 개가 나오는지 */
export function relaxSuggestions(
  q: QueryState,
  data: Dumbbell[] = DUMBBELLS,
): { key: keyof QueryState; label: string; count: number }[] {
  const candidates: { key: keyof QueryState; label: string; patch: Partial<QueryState> }[] = [
    { key: 'budget', label: '예산 상한 해제', patch: { budget: null } },
    { key: 'minWeight', label: '최대 중량 조건 해제', patch: { minWeight: null } },
    { key: 'methods', label: '조절 방식 전체', patch: { methods: [] } },
    { key: 'maxLength', label: '길이 상한 해제', patch: { maxLength: null } },
    { key: 'maxStep', label: '조절 간격 조건 해제', patch: { maxStep: null } },
    { key: 'kitOnly', label: '확장 키트 조건 해제', patch: { kitOnly: false } },
    { key: 'includeUnsure', label: '확인 필요 제품도 보기', patch: { includeUnsure: true } },
  ];
  return candidates
    .filter((c) => {
      const cur = q[c.key];
      const next = c.patch[c.key];
      return JSON.stringify(cur) !== JSON.stringify(next);
    })
    .map((c) => ({ key: c.key, label: c.label, count: runQuery({ ...q, ...c.patch }, data).shown.length }))
    .filter((s) => s.count > 0);
}

// ── 비교 선택 ──

export function toggleCompare(list: string[], id: string): string[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (list.length >= MAX_COMPARE) return list;
  return [...list, id];
}

// ── URL ──

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(src: ParamSource, key: string): string | null {
  if (src instanceof URLSearchParams) return src.get(key);
  const v = src[key];
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

function readPositive(src: ParamSource, key: string, max: number): number | null {
  const raw = readParam(src, key);
  if (raw === null || raw.trim() === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}

const SORT_KEYS = Object.keys(SORT_LABEL) as SortKey[];

export function parseQuery(src: ParamSource): QueryState {
  const methodsRaw = readParam(src, 'm');
  const methods = methodsRaw
    ? FILTER_METHODS.filter((m) => methodsRaw.split(',').includes(m))
    : [];
  const sortRaw = readParam(src, 'sort');
  const sort = SORT_KEYS.includes(sortRaw as SortKey) ? (sortRaw as SortKey) : DEFAULT_QUERY.sort;
  const compareRaw = readParam(src, 'c');
  const validIds = new Set(DUMBBELLS.map((d) => d.id));
  const compare: string[] = [];
  for (const id of compareRaw ? compareRaw.split(',') : []) {
    if (validIds.has(id) && !compare.includes(id) && compare.length < MAX_COMPARE) compare.push(id);
  }
  return {
    budget: readPositive(src, 'budget', 10_000_000),
    minWeight: readPositive(src, 'kg', 200),
    methods,
    maxLength: readPositive(src, 'len', 2000),
    maxStep: readPositive(src, 'step', 50),
    kitOnly: readParam(src, 'kit') === '1',
    includeUnsure: readParam(src, 'unsure') === '1',
    sort,
    compare,
    diffOnly: readParam(src, 'diff') === '1',
  };
}

export function serializeQuery(q: QueryState): string {
  const p = new URLSearchParams();
  if (q.budget !== null) p.set('budget', String(q.budget));
  if (q.minWeight !== null) p.set('kg', String(q.minWeight));
  if (q.methods.length > 0) p.set('m', q.methods.join(','));
  if (q.maxLength !== null) p.set('len', String(q.maxLength));
  if (q.maxStep !== null) p.set('step', String(q.maxStep));
  if (q.kitOnly) p.set('kit', '1');
  if (q.includeUnsure) p.set('unsure', '1');
  if (q.sort !== DEFAULT_QUERY.sort) p.set('sort', q.sort);
  if (q.compare.length > 0) p.set('c', q.compare.join(','));
  if (q.diffOnly) p.set('diff', '1');
  // URLSearchParams는 쉼표를 %2C로 바꾼다. 공유 링크 가독성을 위해 되돌린다.
  return p.toString().replace(/%2C/g, ',');
}

// ── 필요한 중량 계산기 (영상에서 제안하는 구매 기준용 근사치) ──

export type CalcMode = 'oneRm' | 'eightRep';

export const CALC_LABEL: Record<CalcMode, string> = {
  oneRm: '벤치프레스 1RM',
  eightRep: '벤치프레스 약 8회 사용 중량',
};

export const CALC_FORMULA: Record<CalcMode, string> = {
  oneRm: '입력값 ÷ 3',
  eightRep: '입력값 × 0.4',
};

export function calcOneHandKg(mode: CalcMode, input: number): number | null {
  if (!Number.isFinite(input) || input <= 0 || input > 500) return null;
  const raw = mode === 'oneRm' ? input / 3 : input * 0.4;
  // 소수 첫째 자리로 올림 — 필요한 무게보다 가벼운 제품이 통과하지 않게
  return Math.ceil(raw * 10 - 1e-9) / 10;
}
