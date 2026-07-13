# 유관 루틴 설계기 — 개발 스펙 (v1)

> Claude Code 입력용. 이 문서만으로 구현 가능하도록 작성됨.
> 배포 대상: Vercel

---

## 0. 목표와 스코프

유튜브 채널 **유관** 8편(홈짐 루틴 설계) 시청자용 웹앱.

프리셋 4종을 불러와 운동 추가/삭제/세트 조절/대체하고, 주간·세션 볼륨을 실시간 집계해 보여준 뒤 PDF/XLSX로 내보낸다.

**v1 범위**

- 백엔드 없음. 완전 정적 배포.
- 상태는 localStorage + URL 인코딩.
- 로그인 없음.

**v1 제외 (명시적으로 만들지 말 것)**

- 로그인/DB, 수행 기록 트래킹, 타이머, 캘린더, 1RM 계산기, 커스텀 운동 생성, 반복수·RIR 편집, 운동 순서 규칙 검사, BMI/FFMI 계산기(라우트만 예약)

**기술 스택**

- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- 상태: Zustand
- 내보내기: `xlsx` (SheetJS) / PDF는 `@media print` + `window.print()` 우선
- 배포: Vercel (정적, 환경변수 없음)

---

## 1. 도메인 규칙 (여기가 틀리면 전부 틀림)

### 1-1. 단위

**모든 볼륨 계산은 fractional set 기준.**

- 직접 관여 부위 계수 1.0 / 간접 0.5 (0.25·0.75도 사용자 조정 가능)
- 운동의 부위 기여 = `세트수 × 계수`

예: 덤벨 벤치프레스 4세트 → 가슴 4.0, 전면삼각근 2.0, 삼두 2.0

**direct/total 세트와 절대 섞지 말 것.** UI에 노출되는 모든 숫자는 fractional이다.

### 1-2. 주간 누적 볼륨 티어 (부위별)

근거: Pelland et al., *Sports Medicine* (2026).

```ts
type WeeklyTier =
  | 'below_maintenance'  // 0 ~ 2.9   유지 미만
  | 'maintenance'        // 3 ~ 3.9   유지
  | 'mev'                // 4 ~ 4.9   성장 최소 유효량
  | 'high'                // 5 ~ 10    높은 효율
  | 'moderate'            // 11 ~ 18   중간 효율
  | 'low'                 // 19 ~ 29   낮은 효율
  | 'lowest'              // 30 ~ 42   최저 효율
  | 'unstudied';          // 43+       미검증
```

**제약 (제품 철학 — 위반 금지):**

- **어떤 티어도 '나쁨/과다/에러' 상태가 아니다.** 절벽은 없다. 효율이 완만해질 뿐.
- 색은 골드(`#FFBE00`)의 채도/명도 단계로만 표현. **빨강 금지.**
- `unstudied`(43+)는 "권장하지 않음"이 아니라 **"연구 데이터가 없어 판단 불가"**. 빗금 패턴으로 표현.
- 유지(3)는 Bickel 2011 근거이며 조건부(젊은 성인, 강도 유지, 32주). 툴팁에 명시.

### 1-3. 세션당 부위 볼륨 (PUOS)

근거: Remmert et al., SportRxiv **프리프린트**(동료심사 미통과 — UI에 명시).

**경계는 단 하나: 11 fractional 세트.**

```ts
type SessionState = 'normal' | 'above_puos';
// sets <= 11 → 'normal'
// sets >= 12 → 'above_puos'
```

**절대 하지 말 것:**

- "11을 넘으면 이득이 없다" / "정크 볼륨" — 논문이 명시적으로 부인하는 해석. 11을 넘어도 근비대는 계속 일어난다.
- **8세트 기준선 — 존재하지 않는다.** (8.165는 11 fractional의 direct 환산값이라 단위가 다름. 코드/UI 어디에도 넣지 말 것.)
- 빨강 경고, 저장 차단, 에러 표시

**할 것:**

- `above_puos`에서 깃발 아이콘 + 분산 제안 시트
- 툴팁: *"11과 12 사이에 생물학적 차이는 없습니다. 저자들도 PUOS가 자의적 기준임을 밝히고 있습니다."*

### 1-4. 부위 분류

```ts
const PRIMARY_MUSCLES = [
  '가슴','광배/등','상부등/승모','사두','둔근','햄스트링',
  '측면삼각근','전면삼각근','후면삼각근','이두','삼두'
] as const;  // 티어 판정 대상

const SECONDARY_MUSCLES = ['종아리','복근','기립근'] as const;
// 계산은 하되 티어 판정 제외. 대시보드에서 접힌 섹션.
```

### 1-5. 파생 지표

```ts
weeklyTotalSets   // 전체 Day 세트 합 (계수 미적용)
sessionTotalSets  // 해당 Day 세트 합
avgSetsPerSession = weeklyTotalSets / activeDayCount
estimatedMinutes  = totalSets × minutesPerSet   // 기본 3분 (2.5/3/4 선택)
frequency(muscle) // 해당 부위 fractional > 0 인 Day 수 → 대시보드에 "주 N회"
```

**빈도는 대시보드 부위 막대 우측에 반드시 표기.** 세션 초과의 원인(주 1회 몰빵)과 해법(분할)을 한 줄에 같이 보여주는 핵심 장치.

---

## 2. 데이터 모델

```ts
type MuscleKey =
  | '가슴' | '광배/등' | '상부등/승모' | '사두' | '둔근' | '햄스트링'
  | '측면삼각근' | '전면삼각근' | '후면삼각근' | '이두' | '삼두'
  | '종아리' | '복근' | '기립근';

type MovementPattern =
  | 'horizontal_push' | 'vertical_push' | 'chest_isolation'
  | 'horizontal_pull' | 'vertical_pull' | 'shrug'
  | 'squat' | 'hinge' | 'knee_flexion' | 'hip_extension'
  | 'lateral_raise' | 'rear_delt'
  | 'elbow_flexion' | 'elbow_extension';

interface Exercise {
  id: string;
  name: string;                 // 정정된 표준 한국어명 (§4)
  pattern: MovementPattern;     // ⇄ 대체 추천 기준
  category: '가슴'|'등'|'어깨'|'하체'|'팔';
  note: string;
  coefficients: Partial<Record<MuscleKey, number>>;  // 0인 부위는 생략
}

interface RoutineExercise {
  exerciseId: string;
  sets: number;   // 1~10
  coefficientOverride?: Partial<Record<MuscleKey, number>>;
}

interface Day { id: string; label: string; exercises: RoutineExercise[]; }

interface Routine {
  id: string;
  name: string;
  days: Day[];
  minutesPerSet: number;  // 기본 3
}
```

**대체(⇄) 로직:** `pattern`이 동일한 운동만 후보로 제시. 무작위 교체가 아니라 **패턴 유지 = 설계 교육**이 목적.

---

## 3. 기능 명세

### 3-1. 홈 `/`

프리셋 카드 4장 + "빈 루틴으로 직접 설계" + 8편 영상 링크 → `/edit?preset=ul4`

### 3-2. 에디터 `/edit`

- Day 탭 (가로 스와이프), Day 추가/삭제 (2~6일)
- **세션 헤더:** `Day A · 18세트 · 약 55~70분`
- **세션 부위 집계:** 한 줄 가로 스크롤. `≤11` 회색 텍스트 / `≥12` 골드 깃발 + 탭 가능
- **운동 카드:** 세트 스테퍼(⊖/⊕, 1~10) · 대체(⇄) · 메뉴(⋮: 삭제 / 계수 조정)
- **운동 추가:** 바텀시트, 카테고리 필터 칩
- **계수 조정:** 카드 펼침 → 부위별 슬라이더 (0 / 0.25 / 0.5 / 0.75 / 1). **기본 접힘**
- **하단 고정 요약 바:** 주간 총 세트 + 부위별 미니 진행바. 실시간 갱신. 탭 → 대시보드 슬라이드업

### 3-3. 분산 제안 시트 (세션 12+ 깃발 탭)

1. 초과 부위 + 현재 세션 세트 표시
2. 문구: *"성장은 계속되지만, 추가 이득이 '의미 있는 크기'인지 확신하기 어려워지는 구간입니다."*
3. 다른 Day 목록 + 각 Day의 해당 부위 현재 세트
4. Day 선택 → 초과분 이동
   - 해당 Day에서 그 부위 기여도가 가장 높은 운동의 세트를 감소, 대상 Day에 동일 운동 추가(있으면 세트 가산)
   - **세션 세트가 11 이하가 될 때까지만.** 과도하게 옮기지 않는다
5. 툴팁: 경계가 부드러운 선임을 명시

### 3-4. 대시보드

- 메트릭 카드 3개: 주간 총 세트 / 회당 평균 / 주당 예상 시간
- 주요 부위 11개 막대 (Pelland 티어 색) + `주 N회`
- 보조 부위 3개 접힌 섹션
- 각주 블록 (§8 `SOURCES`)
- 막대 탭 → 티어 의미 + 출처 툴팁

### 3-5. 저장 / 공유 / 내보내기

- **자동 저장:** localStorage, debounce 500ms
- **URL 공유:** 루틴 상태 압축(lz-string) → base64 → `?r=`. 백엔드 없이 공유. 바이럴 루프
- **XLSX (SheetJS):** 원본 엑셀과 동일 구조 — `루틴입력` / `부위별집계` / `요일별집계`
- **PDF:** A4 1장. "냉장고에 붙이는 루틴표". `@media print` + `window.print()` 우선(라이브러리 의존 최소화)

### 3-6. `/calculator`

BMI/FFMI. v1은 "준비 중" 플레이스홀더.

---

## 4. 운동 DB (통합 · 최종)

제공된 엑셀 4개 파일의 운동DB는 **31개 운동, 계수 전부 동일**함을 확인. 단일 소스로 통합한다.

운동명은 표준 한국어로 정정 완료.

```ts
export const EXERCISES: Exercise[] = [
  // ── 가슴 ──
  { id: 'db-bench-press', name: '덤벨 벤치프레스', pattern: 'horizontal_push', category: '가슴',
    note: '각도조절벤치 플랫 활용',
    coefficients: { '가슴': 1, '전면삼각근': 0.5, '삼두': 0.5 } },
  { id: 'incline-db-bench-press', name: '인클라인 덤벨 벤치프레스', pattern: 'horizontal_push', category: '가슴',
    note: '벤치 각도 조절로 윗가슴 타겟',
    coefficients: { '가슴': 1, '전면삼각근': 0.5, '삼두': 0.5 } },
  { id: 'db-fly', name: '덤벨 플라이', pattern: 'chest_isolation', category: '가슴',
    note: '벤치 활용 가슴 고립 운동',
    coefficients: { '가슴': 1 } },
  { id: 'db-guillotine-press', name: '덤벨 길로틴 프레스', pattern: 'horizontal_push', category: '가슴',
    note: '벤치 활용, 가슴 상부/전체 타겟',
    coefficients: { '가슴': 1, '전면삼각근': 0.5, '삼두': 0.5 } },
  { id: 'chest-dips', name: '체스트 딥스', pattern: 'horizontal_push', category: '가슴',
    note: '문틀철봉 거치형 딥스 바 또는 치닝디핑 활용. 상체를 앞으로 기울여 가슴 강조',
    coefficients: { '가슴': 1, '전면삼각근': 0.5, '삼두': 1 } },

  // ── 등 ──
  { id: 'chest-supported-db-row', name: '체스트 서포티드 덤벨 로우', pattern: 'horizontal_pull', category: '등',
    note: '인클라인 벤치에 가슴을 대고 수행. 기립근 부담 없이 등 중상부 타겟',
    coefficients: { '광배/등': 0.5, '상부등/승모': 1, '후면삼각근': 0.5, '이두': 0.5 } },
  { id: 'pullup-overhand', name: '오버핸드 그립 풀업', pattern: 'vertical_pull', category: '등',
    note: '문틀철봉 활용 (광배근, 대원근)',
    coefficients: { '광배/등': 1, '상부등/승모': 0.5, '이두': 0.5 } },
  { id: 'pullup-neutral', name: '뉴트럴 그립 풀업', pattern: 'vertical_pull', category: '등',
    note: '문틀철봉 + 모스트그립 소품 장착',
    coefficients: { '광배/등': 1, '상부등/승모': 0.5, '이두': 0.5 } },
  { id: 'one-arm-db-row', name: '원암 덤벨 로우', pattern: 'horizontal_pull', category: '등',
    note: '크록 로우와 대체관계',
    coefficients: { '광배/등': 1, '상부등/승모': 0.5, '후면삼각근': 0.5, '이두': 0.5, '기립근': 0.5 } },
  { id: 'kroc-row', name: '크록 로우', pattern: 'horizontal_pull', category: '등',
    note: '고중량 덤벨 로우 변형. 원암 덤벨 로우와 대체관계',
    coefficients: { '광배/등': 1, '상부등/승모': 0.5, '후면삼각근': 0.5, '이두': 0.5, '기립근': 0.5 } },
  { id: 'kelso-shrug', name: '켈소 슈러그', pattern: 'shrug', category: '등',
    note: '등 중상부 (Paul Kelso 고안)',
    coefficients: { '상부등/승모': 1 } },

  // ── 어깨 ──
  { id: 'db-lateral-raise', name: '덤벨 래터럴 레이즈', pattern: 'lateral_raise', category: '어깨',
    note: '몸을 살짝 기울이거나 벤치 활용하여 저항 곡선 개선',
    coefficients: { '측면삼각근': 1 } },
  { id: 'seated-db-shoulder-press', name: '시티드 덤벨 숄더 프레스', pattern: 'vertical_push', category: '어깨',
    note: '벤치에 앉아서 전면/측면 삼각근 타겟',
    coefficients: { '측면삼각근': 0.5, '전면삼각근': 1, '삼두': 0.5 } },
  { id: 'lying-db-lateral-raise', name: '라잉 덤벨 래터럴 레이즈', pattern: 'lateral_raise', category: '어깨',
    note: '벤치에 옆으로 누워 수행. 측면삼각근 신장 구간 강조',
    coefficients: { '측면삼각근': 1 } },
  { id: 'prone-db-reverse-fly', name: '프론 덤벨 리버스 플라이', pattern: 'rear_delt', category: '어깨',
    note: '벤치에 엎드리거나 인클라인에 기대어 후면삼각근 고립',
    coefficients: { '후면삼각근': 1 } },

  // ── 하체 ──
  { id: 'bss-standard', name: '불가리안 스플릿 스쿼트 · 기본형', pattern: 'squat', category: '하체',
    note: '상체 중립. 둔근·사두 균등 타겟',
    coefficients: { '사두': 1, '둔근': 1 } },
  { id: 'bss-quad', name: '불가리안 스플릿 스쿼트 · 사두형', pattern: 'squat', category: '하체',
    note: '상체를 세우고 무릎을 앞으로 보내 대퇴사두 강조',
    coefficients: { '사두': 1, '둔근': 0.5 } },
  { id: 'bss-glute', name: '불가리안 스플릿 스쿼트 · 둔근형', pattern: 'squat', category: '하체',
    note: '상체를 기울이고 힙힌지를 강조하여 둔근 강조',
    coefficients: { '사두': 0.5, '둔근': 1, '햄스트링': 0.5 } },
  { id: 'sissy-squat', name: '시시 스쿼트', pattern: 'squat', category: '하체',
    note: '맨몸/덤벨 활용. 레그익스텐션 없이 대퇴직근 타겟',
    coefficients: { '사두': 1 } },
  { id: 'db-walking-lunge', name: '덤벨 워킹 런지', pattern: 'squat', category: '하체',
    note: '마당·층간소음 무관 시 사용 (기본은 BSS로 대체)',
    coefficients: { '사두': 1, '둔근': 1 } },
  { id: 'nordic-ham-curl', name: '노르딕 햄스트링 컬', pattern: 'knee_flexion', category: '하체',
    note: '무릎 굴곡 기능으로 햄스트링 강하게 고립',
    coefficients: { '햄스트링': 1 } },
  { id: 'reverse-hyperextension', name: '리버스 하이퍼익스텐션', pattern: 'hip_extension', category: '하체',
    note: '벤치 끝에 골반을 걸치고 다리를 들어 후면사슬 타겟',
    coefficients: { '둔근': 0.5, '햄스트링': 1, '기립근': 0.5 } },
  { id: 'b-stance-rdl', name: '덤벨 B-스탠스 RDL', pattern: 'hinge', category: '하체',
    note: '뒷발을 킥스탠드처럼 두고 한쪽 다리에 부하 집중. 힙힌지로 햄스트링 신장성 수축 극대화',
    coefficients: { '둔근': 0.5, '햄스트링': 1, '기립근': 0.5 } },
  { id: 'single-leg-db-hip-thrust', name: '싱글 레그 덤벨 힙 스러스트', pattern: 'hip_extension', category: '하체',
    note: '벤치에 등을 대고 한 발로 수행',
    coefficients: { '둔근': 1, '햄스트링': 0.5 } },

  // ── 팔 ──
  { id: 'one-arm-db-oh-extension', name: '원암 덤벨 오버헤드 익스텐션', pattern: 'elbow_extension', category: '팔',
    note: '어깨 굴곡 상태에서 수행 → 삼두 장두 신장 극대화',
    coefficients: { '삼두': 1 } },
  { id: 'db-skull-crusher', name: '덤벨 스컬 크러셔', pattern: 'elbow_extension', category: '팔',
    note: '벤치와 덤벨 활용. 삼두 전체(내측·외측두 위주). 장두 신장은 오버헤드 대비 제한적',
    coefficients: { '삼두': 1 } },
  { id: 'db-preacher-curl', name: '덤벨 프리처 컬', pattern: 'elbow_flexion', category: '팔',
    note: '각도조절벤치 등받이에 팔을 걸치고 수행',
    coefficients: { '이두': 1 } },
  { id: 'hammer-preacher-curl', name: '해머 그립 프리처 컬', pattern: 'elbow_flexion', category: '팔',
    note: '각도조절벤치 등받이 활용 + 해머그립',
    coefficients: { '이두': 1 } },
  { id: 'db-curl', name: '덤벨 컬', pattern: 'elbow_flexion', category: '팔',
    note: '덤벨 활용 기본 이두 운동',
    coefficients: { '이두': 1 } },
  { id: 'db-hammer-curl', name: '덤벨 해머 컬', pattern: 'elbow_flexion', category: '팔',
    note: '상완근·상완요골근 비중이 높음',
    coefficients: { '이두': 1 } },
  { id: 'incline-db-curl', name: '인클라인 덤벨 컬', pattern: 'elbow_flexion', category: '팔',
    note: '인클라인 벤치를 활용해 이두 신장 구간 강조',
    coefficients: { '이두': 1 } },
];
```

### 명명 정정 내역 (참고 — 구 엑셀과 대조용)

| 구 명칭 | 신 명칭 | 사유 |
|---|---|---|
| 캘쇼슈러그 | 켈소 슈러그 | Paul **Kelso** 고안. 오기 |
| 덤벨 싱글렉 (B-Stance) RDL | 덤벨 B-스탠스 RDL | B-스탠스는 싱글레그가 아님 (뒷발 접지) |
| 사이드 래터럴 레이즈 | 덤벨 래터럴 레이즈 | lateral=측면. 동어반복 제거 |
| 덤벨 프레스 | 덤벨 벤치프레스 | 벤치 사용 동작 |
| 딥스 (Dips) | 체스트 딥스 | 가슴 계수 1.0 → 가슴 지향 변형 명시 |
| 덤벨 스컬크러셔 | 덤벨 스컬 크러셔 | note의 "장두 타겟" 표현 삭제 (라잉 자세라 장두 신장 제한적) |

---

## 5. 프리셋 4종 (엑셀 원본 그대로 이식)

```ts
// ① 주 3일 · 풀바디
export const FULL3: Routine = {
  id: 'full3', name: '주 3일 · 풀바디', minutesPerSet: 3,
  days: [
    { id: 'A', label: 'Day A', exercises: [
      { exerciseId: 'db-bench-press', sets: 3 },
      { exerciseId: 'pullup-overhand', sets: 5 },
      { exerciseId: 'seated-db-shoulder-press', sets: 3 },
      { exerciseId: 'bss-standard', sets: 3 },
      { exerciseId: 'lying-db-lateral-raise', sets: 4 },
    ]},
    { id: 'B', label: 'Day B', exercises: [
      { exerciseId: 'chest-dips', sets: 3 },
      { exerciseId: 'chest-supported-db-row', sets: 3 },
      { exerciseId: 'db-skull-crusher', sets: 3 },
      { exerciseId: 'db-preacher-curl', sets: 3 },
      { exerciseId: 'b-stance-rdl', sets: 2 },
      { exerciseId: 'nordic-ham-curl', sets: 3 },
      { exerciseId: 'sissy-squat', sets: 3 },
    ]},
    { id: 'C', label: 'Day C', exercises: [
      { exerciseId: 'incline-db-bench-press', sets: 3 },
      { exerciseId: 'pullup-neutral', sets: 5 },
      { exerciseId: 'chest-supported-db-row', sets: 3 },
      { exerciseId: 'bss-standard', sets: 3 },
      { exerciseId: 'db-lateral-raise', sets: 4 },
      { exerciseId: 'prone-db-reverse-fly', sets: 2 },
    ]},
  ],
};

// ② 주 4일 · 상하 / 상하
export const UL4: Routine = {
  id: 'ul4', name: '주 4일 · 상하 / 상하', minutesPerSet: 3,
  days: [
    { id: 'A', label: 'Day A · 상체', exercises: [
      { exerciseId: 'db-bench-press', sets: 3 },
      { exerciseId: 'pullup-overhand', sets: 3 },
      { exerciseId: 'seated-db-shoulder-press', sets: 3 },
      { exerciseId: 'chest-supported-db-row', sets: 3 },
      { exerciseId: 'lying-db-lateral-raise', sets: 3 },
      { exerciseId: 'db-skull-crusher', sets: 3 },
    ]},
    { id: 'B', label: 'Day B · 하체', exercises: [
      { exerciseId: 'bss-standard', sets: 3 },
      { exerciseId: 'b-stance-rdl', sets: 3 },
      { exerciseId: 'sissy-squat', sets: 3 },
      { exerciseId: 'db-preacher-curl', sets: 3 },
    ]},
    { id: 'C', label: 'Day C · 상체', exercises: [
      { exerciseId: 'incline-db-bench-press', sets: 3 },
      { exerciseId: 'db-fly', sets: 2 },
      { exerciseId: 'pullup-neutral', sets: 5 },
      { exerciseId: 'chest-dips', sets: 3 },
      { exerciseId: 'prone-db-reverse-fly', sets: 3 },
      { exerciseId: 'kelso-shrug', sets: 2 },
    ]},
    { id: 'D', label: 'Day D · 하체', exercises: [
      { exerciseId: 'bss-standard', sets: 3 },
      { exerciseId: 'nordic-ham-curl', sets: 3 },
      { exerciseId: 'reverse-hyperextension', sets: 3 },
      { exerciseId: 'db-lateral-raise', sets: 4 },
    ]},
  ],
};

// ③ 주 5일 · 상하 + PPL
export const ULPPL5: Routine = {
  id: 'ulppl5', name: '주 5일 · 상하 + PPL', minutesPerSet: 3,
  days: [
    { id: 'A', label: 'Day A · 상체', exercises: [
      { exerciseId: 'incline-db-bench-press', sets: 4 },
      { exerciseId: 'pullup-overhand', sets: 3 },
      { exerciseId: 'chest-supported-db-row', sets: 3 },
      { exerciseId: 'db-lateral-raise', sets: 3 },
      { exerciseId: 'db-skull-crusher', sets: 3 },
    ]},
    { id: 'B', label: 'Day B · 하체', exercises: [
      { exerciseId: 'bss-standard', sets: 4 },
      { exerciseId: 'b-stance-rdl', sets: 2 },
      { exerciseId: 'prone-db-reverse-fly', sets: 3 },
    ]},
    { id: 'C', label: 'Day C · 푸시', exercises: [
      { exerciseId: 'db-bench-press', sets: 3 },
      { exerciseId: 'seated-db-shoulder-press', sets: 2 },
      { exerciseId: 'db-fly', sets: 3 },
      { exerciseId: 'lying-db-lateral-raise', sets: 4 },
      { exerciseId: 'one-arm-db-oh-extension', sets: 3 },
    ]},
    { id: 'D', label: 'Day D · 풀', exercises: [
      { exerciseId: 'pullup-overhand', sets: 3 },
      { exerciseId: 'pullup-neutral', sets: 3 },
      { exerciseId: 'kelso-shrug', sets: 3 },
      { exerciseId: 'db-preacher-curl', sets: 3 },
    ]},
    { id: 'E', label: 'Day E · 레그', exercises: [
      { exerciseId: 'bss-standard', sets: 3 },
      { exerciseId: 'sissy-squat', sets: 3 },
      { exerciseId: 'nordic-ham-curl', sets: 3 },
      { exerciseId: 'reverse-hyperextension', sets: 3 },
    ]},
  ],
};

// ④ 주 5일 · 풀바디
export const FULL5: Routine = {
  id: 'full5', name: '주 5일 · 풀바디', minutesPerSet: 3,
  days: [
    { id: 'A', label: 'Day A', exercises: [
      { exerciseId: 'db-bench-press', sets: 3 },
      { exerciseId: 'pullup-overhand', sets: 3 },
      { exerciseId: 'db-lateral-raise', sets: 4 },
      { exerciseId: 'db-preacher-curl', sets: 2 },
      { exerciseId: 'bss-standard', sets: 2 },
    ]},
    { id: 'B', label: 'Day B', exercises: [
      { exerciseId: 'seated-db-shoulder-press', sets: 3 },
      { exerciseId: 'chest-supported-db-row', sets: 3 },
      { exerciseId: 'db-fly', sets: 3 },
      { exerciseId: 'sissy-squat', sets: 3 },
      { exerciseId: 'nordic-ham-curl', sets: 3 },
    ]},
    { id: 'C', label: 'Day C', exercises: [
      { exerciseId: 'pullup-neutral', sets: 3 },
      { exerciseId: 'chest-dips', sets: 3 },
      { exerciseId: 'prone-db-reverse-fly', sets: 3 },
      { exerciseId: 'incline-db-curl', sets: 3 },
      { exerciseId: 'bss-standard', sets: 2 },
    ]},
    { id: 'D', label: 'Day D', exercises: [
      { exerciseId: 'incline-db-bench-press', sets: 3 },
      { exerciseId: 'kelso-shrug', sets: 3 },
      { exerciseId: 'lying-db-lateral-raise', sets: 3 },
      { exerciseId: 'b-stance-rdl', sets: 3 },
      { exerciseId: 'reverse-hyperextension', sets: 3 },
    ]},
    { id: 'E', label: 'Day E', exercises: [
      { exerciseId: 'pullup-overhand', sets: 3 },
      { exerciseId: 'db-bench-press', sets: 3 },
      { exerciseId: 'chest-supported-db-row', sets: 3 },
      { exerciseId: 'db-skull-crusher', sets: 3 },
      { exerciseId: 'bss-standard', sets: 2 },
    ]},
  ],
};

export const PRESETS = [FULL3, UL4, ULPPL5, FULL5];
```

> 참고: 원본 엑셀 일부 셀에 수식 오류가 있었으나(주3 Day A 풀업의 광배 0, 주4 Day C 덤벨 플라이의 가슴 0, 주5풀바디 Day D 인클라인 프레스의 가슴 0), 위 데이터는 운동DB 계수로 재계산되므로 자동 해결됨.

---

## 6. 계산 로직

```ts
function sessionVolume(day: Day, db: Exercise[]): Record<MuscleKey, number>
function weeklyVolume(routine: Routine, db: Exercise[]): Record<MuscleKey, number>
function weeklyTier(sets: number): WeeklyTier
function sessionState(sets: number): SessionState        // >= 12 → above_puos
function frequency(routine: Routine, m: MuscleKey, db: Exercise[]): number
function suggestRedistribution(
  routine: Routine, dayId: string, muscle: MuscleKey, db: Exercise[]
): { targetDayId: string; currentSets: number }[]
```

**부동소수점:** 계수가 0.25/0.5 단위라 합산 오차 발생 가능. 출력 전 `Math.round(v * 10) / 10`.

---

## 7. 파일 구조

```
app/
  page.tsx                 홈
  edit/page.tsx            에디터
  calculator/page.tsx      BMI/FFMI (v1 스텁)
lib/
  types.ts
  exercises.ts             §4
  presets.ts               §5
  volume.ts                §6
  tiers.ts                 티어 정의 + 색상 + 문구 (§8)
  storage.ts               localStorage + URL 인코딩
  export/xlsx.ts, pdf.ts
components/
  DayTabs / SessionHeader / SessionMuscleStrip
  ExerciseCard / SetStepper / SubstituteSheet / AddExerciseSheet
  CoefficientSliders / VolumeBar / Dashboard
  RedistributeSheet / SourceFootnote
store/useRoutineStore.ts
```

---

## 8. 문구·색상 상수 (하드코딩 금지 — `tiers.ts`에 집중)

```ts
export const TIER_STYLE: Record<WeeklyTier, { label: string; color: string; desc: string }> = {
  below_maintenance: { label: '유지 미만', color: '#3A3A38', desc: '유지선(3세트) 아래입니다.' },
  maintenance:       { label: '유지',      color: '#6B5A2E', desc: '기존 근육을 유지하는 수준입니다. (Bickel 2011 — 젊은 성인, 강도 유지, 32주 조건)' },
  mev:               { label: '성장 시작',  color: '#C99A18', desc: '감지 가능한 근비대가 시작되는 지점입니다.' },
  high:              { label: '높은 효율',  color: '#FFBE00', desc: '세트당 성장이 가장 큰 구간입니다.' },
  moderate:          { label: '중간 효율',  color: '#C79A1C', desc: '성장은 계속됩니다. 세트당 값이 비싸질 뿐입니다.' },
  low:               { label: '낮은 효율',  color: '#9C7614', desc: '성장은 이어집니다. 꺾이는 게 아니라 완만해지는 겁니다.' },
  lowest:            { label: '최저 효율',  color: '#5C4A18', desc: '연구가 드문 구간이라 외삽에 가깝습니다.' },
  unstudied:         { label: '미검증',    color: 'HATCH',   desc: '연구 데이터가 없는 구간입니다. 뭐라 말씀드릴 수가 없습니다.' },
};
// 'HATCH' = repeating-linear-gradient 빗금 패턴 (#4A4A46)

export const PUOS_COPY = {
  above:   "성장은 계속되지만, 추가 이득이 '의미 있는 크기'인지 확신하기 어려워지는 구간입니다.",
  tooltip: '11과 12 사이에 생물학적 차이는 없습니다. 논문 저자들도 PUOS가 자의적으로 결정된 기준임을 밝히고 있습니다.',
};

export const SOURCES = [
  '주간 볼륨 티어: Pelland et al., Sports Medicine (2026)',
  '유지 볼륨 3세트: Bickel et al. (2011)',
  '세션당 11세트(PUOS): Remmert et al., SportRxiv (프리프린트 — 동료심사 미통과)',
  '모든 수치는 fractional 세트(직접 1 / 간접 0.5) 기준입니다.',
];
```

---

## 9. Vercel 배포

- 정적 앱. 환경변수·서버 라우트 없음.
- GitHub 레포 연결 → Vercel 자동 빌드 (`next build`).
- `next.config.js`에 특별 설정 불필요.
- 커스텀 도메인 연결 시 Vercel 대시보드에서 CNAME 지정.

---

## 10. 향후 확장 (v1에서는 구현하지 말 것)

- v1.5: Vercel Analytics + GA4 — 인기 프리셋, 자주 대체되는 운동 수집 → 다음 영상 소재
- v2: Supabase + Kakao OAuth. **"내 루틴 저장하기" 시점에 로그인 유도** (전환율 최고점)
- v2: BMI/FFMI 계산기 활성화
