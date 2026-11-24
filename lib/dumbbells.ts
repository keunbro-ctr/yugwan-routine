// 무게조절 덤벨 비교 데이터
//
// 기준: 유관 14편 조사표 「0. 종합표 · 가격순 (2026-11-12)」 + 「덤벨 제품 조사」 261124 추가내용 (2026-11-24)
// - 한 쌍 가격 = 낱개 「상품 가격」 × 2. 배송비는 넣지 않고 shipping 으로 따로 표시한다 (주문당 1회).
//   대본 연출이 한 쌍 가격 기준이라 배송비를 섞지 않는다 (2026-11-24 사용자 지시).
//   세트 상품(파워블럭)은 세트 가격. 쿠폰 최대할인가는 쓰지 않는다.
// - 파워블럭 별매 거치대 제외. 그립톤은 2개 구매 할인 반영.
// - 11-24 에 가격을 다시 확인하지 않은 제품은 checked 에 11-12 로 남긴다.
// - 바이줌과 최대 24kg 모델, 써클은 비교 대상에서 제외. 프리시전 누오(품절)는 11-24 에 누오 신형으로 교체.
// - 평점·리뷰 수·품절은 조사 당시 기록이다. 현재 상태가 아니다.
// - 안전성 등급은 공개 화면에 쓰지 않는다. 구조 설명(판매자)·후기를 구분해 문장으로만 싣는다.
//
// 수치는 표시 문자열과 정렬·필터용 숫자를 따로 둔다.
// 확정값·근삿값·범위값·미확인을 구분하고, 미확인은 절대 0으로 바꾸지 않는다.

export const SURVEY_DATE = '2026-11-24';
export const SURVEY_DATE_LABEL = '2026.11.24';
const OLD = '2026-11-12';

/** 길이 등 측정값의 상태 */
export type Measure =
  | { kind: 'exact'; value: number }
  | { kind: 'approx'; value: number; basis: string }
  | { kind: 'range'; min: number; max: number; basis: string }
  | { kind: 'unknown'; reason: string };

export type Method = 'dial' | 'pin' | 'screw' | 'unknown';

export const METHOD_LABEL: Record<Method, string> = {
  dial: '다이얼',
  pin: '핀',
  screw: '수동 나사',
  unknown: '확인 필요',
};

/** 무게를 바꿨을 때 체결 상태를 어떻게 확인하는가 — 방식 단위 설명 */
export const METHOD_CHECK: Record<Method, string> = {
  screw: '원판을 끼우고 나사를 직접 조인다. 체결 상태를 손과 눈으로 확인한다.',
  pin: '블록 사이에 핀을 직접 꽂는다. 핀 위치를 눈으로 확인할 수 있다.',
  dial: '거치대 위에서 손잡이·다이얼을 돌려 내부 기구로 원판을 물린다. 겉에서 체결 상태를 보기 어렵다.',
  unknown: '무게를 바꾸는 방식을 아직 확인하지 못했다.',
};

export type Expansion =
  | { kind: 'kit'; toKg: number; kitPrice: number | null; note: string }
  | { kind: 'newModel'; toKg: number; note: string }
  | { kind: 'none'; note: string }
  | { kind: 'unknown'; note: string };

export interface StepSpec {
  label: string;
  /** 기본 조절 간격. 범위면 min/max가 다르다 */
  min: number;
  max: number;
  /** 보조 무게추처럼 기본 간격과 다른 세분 수단 */
  fineNote?: string;
}

export interface Dumbbell {
  id: string;
  name: string;
  /** 같은 판매 페이지 안의 타입 구분 등 */
  variant?: string;
  method: Method;
  /** 가격에 포함된 기본 구성의 한 손 최대 중량 */
  maxKg: number;
  /** 한 쌍 가격 · 원 · 낱개 × 2 (배송비 제외) */
  pairPrice: number;
  priceNote: string;
  /** 판매 페이지 배송비 표기 · 원. 'free' 무료배송, null 미확인. 주문당 1회. 한 쌍 가격과 따로 표시 */
  shipping: number | 'free' | null;
  /** 가격·배송비를 확인한 날 */
  checked: string;
  length: Measure;
  lengthNote?: string;
  step: StepSpec;
  minKg: number | null;
  expansion: Expansion;
  /** 무게 변경 편의 — 구조로 나눈 분류. 실측 아님 */
  changeSpeed: string;
  /** 판매자가 쓴 속도 문구. 실측값처럼 쓰지 않는다 */
  sellerSpeedClaim?: string;
  playNoise: string;
  feel: string;
  /** 체결 구조 — 판매자 설명 */
  lockingSeller: string;
  /** 후기 요약 — 마이홈짐 카페 · 직접/전언 구분 */
  reviews: string;
  /** 조사 당시 스토어 기록 */
  storeRecord: string;
  /** 원자료에 있는 판매 페이지 링크만 */
  url: string | null;
  sources: string[];
}

const CAFE = '마이홈짐 카페 후기 요약 (2024-11 ~ 2026-11 글)';
const STORE = `판매 페이지 (${SURVEY_DATE} 조사)`;

export const DUMBBELLS: Dumbbell[] = [
  {
    id: 'orbel',
    name: '올웨이트 오르벨',
    method: 'dial',
    maxKg: 32,
    pairPrice: 676000,
    priceNote: '낱개 338,000원 × 2 (쿠폰 최대할인가 낱개 337,000원)',
    shipping: 'free',
    checked: SURVEY_DATE,
    length: { kind: 'exact', value: 365 },
    lengthNote: '거치대 포함 420mm',
    step: { label: '1kg', min: 1, max: 1 },
    minKg: 5,
    expansion: { kind: 'newModel', toKg: 40, note: '40kg 모델로 갈아타기 (기존 덤벨에 붙이는 키트 아님)' },
    changeSpeed: '빠름 (구조로 분류)',
    playNoise: '자료 없음',
    feel: '손잡이 35mm',
    lockingSeller: '하우징·내부 기어 금속, 듀얼 강철 보강봉 + 상하 역방향 보강 브릿지',
    reviews: '카페 후기를 찾지 못했다.',
    storeRecord: '★5.0 · 리뷰 5건 (표본이 작다)',
    url: 'https://smartstore.naver.com/via_health/products/13709671230',
    sources: [STORE],
  },
  {
    id: 'powerblock-exp70',
    name: '파워블럭 스틸 EXP70',
    method: 'pin',
    maxKg: 31,
    pairPrice: 670000,
    priceNote: '한 쌍 세트 670,000원. 별매 거치대 제외 (쿠폰 최대할인가 669,500원)',
    shipping: 23500,
    checked: SURVEY_DATE,
    length: { kind: 'exact', value: 355 },
    lengthNote: '31kg을 꽉 채운 길이. 가벼울수록 짧아진다 (22kg 300mm)',
    step: {
      label: '4~5kg',
      min: 4,
      max: 5,
      fineNote: '보조 무게추로 세분 가능 (무게추를 넣으면 무게중심이 아래로 내려간다는 후기)',
    },
    minKg: 2,
    expansion: {
      kind: 'kit',
      toKg: 41,
      kitPrice: 227000,
      note: `41kg 추가 키트를 기존 덤벨에 붙인다. 키트 가격은 ${OLD} 조사 당시 판매가, 배송비 제외`,
    },
    changeSpeed: '빠름 (핀 옮기기)',
    playNoise: '스틸은 유격이 조금 있고 소리가 난다 (직접 후기)',
    feel: '프레스는 좋다는 평. 컬·풀오버·고블릿 스쿼트는 어색하다는 평. 무게추를 넣으면 중심이 아래로',
    lockingSeller: '겹쳐진 블록 사이에 핀을 꽂아 들어 올릴 무게를 고른다. 제조사 설명서(Elite EXP)는 들어 올린 뒤 핀 위치를 눈으로 확인하라고 안내한다 — 국내 판매 모델과 세부 형상이 같은지는 확인하지 못했다',
    reviews: '이탈 경험 없음 (직접, 여러 명) · 핀 파손은 종종 있다 (전언) · 스틸은 떨어뜨리면 휠 수 있다 (전언). 후기에 스틸·우레탄·유사품이 섞여 있다.',
    storeRecord: '★4.79 · 리뷰 29건 (수입사 스토어 한 곳 기준)',
    url: 'https://brand.naver.com/frogfitness/products/2801546980',
    sources: [STORE, CAFE, '파워블럭 상세 페이지 「중량별 크기 비교」'],
  },
  {
    id: 'onequick',
    name: '더스크랙 원퀵',
    method: 'dial',
    maxKg: 32,
    pairPrice: 658000,
    priceNote: '낱개 329,000원 × 2',
    shipping: 11000,
    checked: SURVEY_DATE,
    length: { kind: 'exact', value: 430 },
    lengthNote: '상세 페이지의 「49cm」 표기는 무엇을 잰 값인지 확인 필요',
    step: { label: '1kg', min: 1, max: 1 },
    minKg: 3,
    expansion: { kind: 'none', note: '32kg이 최대' },
    changeSpeed: '빠름 (구조로 분류)',
    sellerSpeedClaim: '0.1초',
    playNoise: '1kg 조절용 반달 추에서 소리가 난다. 거슬린다는 의견과 괜찮다는 의견이 갈린다',
    feel: '손잡이가 넓은 편. 내려놓을 때 홈에 맞춰 거치해야 한다. 남은 원판이 걸쇠에 걸려 쓰러지지 않는다는 후기',
    lockingSeller: '상단 결합 유닛 · 내부 고정 결합링 · 원판 고정바 · 하단 결합 유닛',
    reviews: '이탈 경험 없음 (직접, 여러 명, 4년 넘게 사용한 후기 포함) · 바닥에 떨어뜨리면 부서진다 (직접).',
    storeRecord: '★4.86 · 리뷰 540건',
    url: 'https://brand.naver.com/duskrack/products/7869000895',
    sources: [STORE, CAFE],
  },
  {
    id: 'musclepeak',
    name: '머슬피크',
    method: 'dial',
    maxKg: 32.5,
    pairPrice: 612000,
    priceNote: '낱개 306,000원 × 2 (쿠폰 최대할인가 낱개 305,500원)',
    shipping: 'free',
    checked: SURVEY_DATE,
    length: { kind: 'exact', value: 400 },
    lengthNote: '거치대 포함 460mm',
    step: { label: '1.5kg', min: 1.5, max: 1.5 },
    minKg: 4,
    expansion: { kind: 'newModel', toKg: 41.5, note: '41.5kg 모델로 갈아타기 (기존 덤벨에 붙이는 키트 아님)' },
    changeSpeed: '빠름 (구조로 분류)',
    sellerSpeedClaim: '1초',
    playNoise: '소리는 나지만 유격은 못 느꼈다 (직접 후기)',
    feel: '41.5kg 모델 고중량 구간에서 거치대에 남은 원판이 쓰러진다는 후기. 원판 표면이 거칠다. 손잡이 34mm',
    lockingSeller: '원판·결합 슬롯 탄소강(플라스틱 없음), 수직형 고정핀 스틸바 + 거치대 유닛 락',
    reviews: '이탈 경험담 없음. 후기는 주로 41.5kg·32kg 모델 이야기다.',
    storeRecord: '★4.94 · 리뷰 230건',
    url: 'https://smartstore.naver.com/musclepeak/products/12628051272',
    sources: [STORE, CAFE],
  },
  {
    id: 'nuobell',
    name: '누오벨',
    method: 'dial',
    maxKg: 32,
    pairPrice: 608000,
    priceNote: '낱개 304,000원 × 2 (기본 블랙)',
    shipping: 10000,
    checked: SURVEY_DATE,
    length: { kind: 'exact', value: 435 },
    lengthNote: '길이는 11-12 애쉬그레이 판매 페이지 기준',
    step: { label: '2kg', min: 2, max: 2 },
    minKg: 2,
    expansion: { kind: 'newModel', toKg: 40, note: '40kg 모델로 갈아타기 (기존 덤벨에 붙이는 키트 아님)' },
    changeSpeed: '빠름 (구조로 분류)',
    playNoise: '정품 누오를 쓴 사용자가 셋(마스터피스·누오·파워블럭) 중 유격이 가장 많았다고 함',
    feel: '길어서 컬·오버헤드 익스텐션이 그저 그렇다는 후기',
    lockingSeller: '내부 연결 구조 (재질 미확인)',
    reviews: '정품 3~4년 사용에 이탈 없음 (직접) ↔ 32kg에서 끝 원판이 빠졌다 (직접). 사례가 양쪽 다 있다.',
    storeRecord: '★4.88 · 리뷰 332건',
    url: 'https://smartstore.naver.com/komomall/products/5254571567',
    sources: [STORE, CAFE],
  },
  {
    id: 'nuobell-new',
    name: '누오 신형',
    method: 'dial',
    maxKg: 32,
    pairPrice: 628000,
    priceNote: '낱개 314,000원 × 2',
    shipping: 10000,
    checked: SURVEY_DATE,
    length: { kind: 'exact', value: 435 },
    lengthNote: '거치대 포함 480mm · 높이 170mm (FLEXBELL i 32KG 사이즈표)',
    step: { label: '2kg', min: 2, max: 2 },
    minKg: 2,
    expansion: { kind: 'newModel', toKg: 40, note: '40kg 모델로 갈아타기 (기존 덤벨에 붙이는 키트 아님) — 누오벨과 같다 (사용자 확인)' },
    changeSpeed: '빠름 (구조로 분류)',
    playNoise: '신형 후기 미수집. 누오 계열은 유격이 많은 편이라는 의견',
    feel: '손잡이 지름 32mm · 길이 105mm. 구조는 누오벨과 거의 같다',
    lockingSeller: '다이얼 구조 — 누오벨과 거의 같다 (상세 설명 미수집)',
    reviews: '신형 후기를 아직 찾지 않았다. 누오 계열 후기: 3~4년 이탈 없음 (직접) ↔ 32kg 끝 원판 빠짐 (직접).',
    storeRecord: '★4.93 · 리뷰 129건',
    url: 'https://smartstore.naver.com/komomall/products/8536766120',
    sources: [STORE, CAFE, '판매 페이지 사이즈표 「FLEXBELL i 32KG」'],
  },
  {
    id: 'masterpiece-mark2',
    name: '마스터피스 MARK2',
    method: 'screw',
    maxKg: 36,
    pairPrice: 530000,
    priceNote: '낱개 265,000원 × 2',
    shipping: 16000,
    checked: SURVEY_DATE,
    length: { kind: 'range', min: 340, max: 365, basis: '36kg 세팅 기준 판매자 표기' },
    lengthNote: '끼운 판 수만큼 길어진다 (20kg 세팅 260~285mm)',
    step: { label: '2kg', min: 2, max: 2 },
    minKg: 4,
    expansion: {
      kind: 'kit',
      toKg: 64,
      kitPrice: null,
      note: '추가 키트로 64kg까지 (추가 구성 시 65~67kg 표기). 키트 가격은 조사표에 없다',
    },
    changeSpeed: '느림 (나사 풀고 판 교체)',
    playNoise: '유격·소리가 거의 없다 (직접, 여러 명)',
    feel: '개별 덤벨 같은 운동감이라는 평 ↔ 고중량에서 무게중심이 쏠린다는 의견도 1건. 내측 손잡이 174mm로 긴 편',
    lockingSeller: '원판을 끼우고 볼트를 직접 조여 고정. 기어·플라스틱 부품이 없다고 설명',
    reviews: '이탈·고장 경험담 없음. 무게 폭을 크게 바꾸면 나사를 한참 돌려야 한다 (직접). 녹·마감 문제로 환불한 글 1건.',
    storeRecord: '★4.93 · 리뷰 209건',
    url: 'https://smartstore.naver.com/wit-fit/products/12176175143',
    sources: [STORE, CAFE],
  },
  {
    id: 'griptone',
    name: '멜킨 그립톤',
    method: 'dial',
    maxKg: 32,
    pairPrice: 538000,
    priceNote: '낱개 269,000원 × 2 (쿠폰 최대할인가 낱개 268,000원. 11-12 에는 2개 구매 시 30,000원 할인이 있었다 — 11-24 미확인이라 넣지 않음)',
    shipping: 10000,
    checked: SURVEY_DATE,
    length: { kind: 'exact', value: 435 },
    lengthNote: '거치대 포함 510mm',
    step: { label: '1kg', min: 1, max: 1 },
    minKg: 3,
    expansion: { kind: 'none', note: '32kg이 최대' },
    changeSpeed: '빠름 (구조로 분류)',
    sellerSpeedClaim: '1초',
    playNoise: '자료 없음',
    feel: '손잡이 지름 34mm · 길이 105mm',
    lockingSeller: '5중 잠금 (상단·측면 인터락 + 센터 스틸바 + 하단 인터락 + 오토 세이프 락). 거치대를 벗어나면 회전을 잠그는 장치',
    reviews: '그립톤 후기를 찾지 못했다. 카페의 멜킨 이탈 이야기는 이전 모델이다.',
    storeRecord: '★4.8 · 리뷰 81건',
    url: 'https://brand.naver.com/melkin/products/13175080512',
    sources: [STORE, CAFE],
  },
  {
    id: 'rolton-03',
    name: '멜킨 롤튼 36kg (2.25kg 단위조절)',
    method: 'dial',
    maxKg: 36,
    pairPrice: 434000,
    priceNote: '낱개 217,000원 × 2 (거치대 포함 · 쿠폰 최대할인가 낱개 206,000원)',
    shipping: 10000,
    checked: SURVEY_DATE,
    length: { kind: 'approx', value: 440, basis: '판매자 Q&A 답변 「약 44cm」' },
    lengthNote: '거치대 포함 485mm. 03·04 중 어느 타입 답변인지 명시 없음',
    step: { label: '2.25kg', min: 2.25, max: 2.25 },
    minKg: 2.3,
    expansion: { kind: 'none', note: '36kg이 최대' },
    changeSpeed: '빠름 (구조로 분류)',
    playNoise: '자료 없음',
    feel: '손잡이 지름 32mm · 길이 105mm',
    lockingSeller: '4중 잠금 (상단 더블락 커넥터 + 센터 스틸바 + 바텀 커넥터 + 오토 세이프 락). 결합부에 나일론·ABS 포함',
    reviews: '멜킨 이전 모델 이탈 사례 (직접 1명 2회 · 전언). 현 롤튼 모델 후기와는 구분해야 한다.',
    storeRecord: '★4.88 · 리뷰 380건',
    url: 'https://brand.naver.com/melkin/products/6991532917',
    sources: [STORE, CAFE, '판매자 Q&A 답변 (2024-07-12)'],
  },
  {
    id: 'rolton-04',
    name: '멜킨 롤튼 36kg (4kg 단위조절)',
    method: 'dial',
    maxKg: 36,
    pairPrice: 338000,
    priceNote: '낱개 169,000원 × 2 (거치대 포함 · 쿠폰 최대할인가 낱개 168,000원)',
    shipping: 10000,
    checked: SURVEY_DATE,
    length: { kind: 'approx', value: 440, basis: '판매자 Q&A 답변 「약 44cm」' },
    lengthNote: '거치대 포함 485mm. 03·04 중 어느 타입 답변인지 명시 없음',
    step: { label: '4kg', min: 4, max: 4 },
    minKg: 4,
    expansion: { kind: 'none', note: '36kg이 최대' },
    changeSpeed: '빠름 (구조로 분류)',
    playNoise: '자료 없음',
    feel: '손잡이 지름 32mm · 길이 105mm',
    lockingSeller: '4중 잠금 (상단 더블락 커넥터 + 센터 스틸바 + 바텀 커넥터 + 오토 세이프 락). 결합부에 나일론·ABS 포함',
    reviews: '멜킨 이전 모델 이탈 사례 (직접 1명 2회 · 전언). 현 롤튼 모델 후기와는 구분해야 한다.',
    storeRecord: '★4.87 · 리뷰 1,642건',
    url: 'https://brand.naver.com/melkin/products/6999306828',
    sources: [STORE, CAFE, '판매자 Q&A 답변 (2024-07-12)'],
  },
];

export const MAX_COMPARE = 3;

export function getDumbbell(id: string): Dumbbell | undefined {
  return DUMBBELLS.find((d) => d.id === id);
}

// ── 표시 문자열 ──

export function formatWon(n: number): string {
  return n.toLocaleString('ko-KR');
}

export function formatKg(n: number): string {
  return `${Number.isInteger(n) ? n : n.toString()}kg`;
}

export function formatShipping(s: Dumbbell['shipping']): string {
  if (s === 'free') return '무료';
  if (s === null) return '확인 필요';
  return `${formatWon(s)}원`;
}

export function formatLength(m: Measure): string {
  switch (m.kind) {
    case 'exact':
      return `${m.value}mm`;
    case 'approx':
      return `약 ${m.value}mm`;
    case 'range':
      return `${m.min}~${m.max}mm`;
    case 'unknown':
      return '확인 필요';
  }
}

export function formatExpansion(e: Expansion): string {
  switch (e.kind) {
    case 'kit':
      return `키트로 ${formatKg(e.toKg)}`;
    case 'newModel':
      return `${formatKg(e.toKg)} 모델로 교체`;
    case 'none':
      return '확장 없음';
    case 'unknown':
      return '확인 필요';
  }
}
