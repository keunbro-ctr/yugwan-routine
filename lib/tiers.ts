import type { WeeklyTier } from './types';

export const TIER_STYLE: Record<WeeklyTier, { label: string; color: string; desc: string }> = {
  below_maintenance: { label: '유지 미만', color: '#3A3A38', desc: '유지선(3세트) 아래입니다.' },
  maintenance:       { label: '유지',      color: '#6B5A2E', desc: '기존 근육을 유지하는 수준입니다. (Bickel 2011 — 젊은 성인, 강도 유지, 32주 조건)' },
  mev:               { label: '최소 유효량', color: '#C99A18', desc: '감지 가능한 근비대가 시작되는 지점입니다.' },
  high:              { label: '높은 효율',  color: '#FFBE00', desc: '세트당 성장이 가장 큰 구간입니다.' },
  moderate:          { label: '중간 효율',  color: '#C79A1C', desc: '성장은 계속됩니다. 세트당 값이 비싸질 뿐입니다.' },
  low:               { label: '낮은 효율',  color: '#9C7614', desc: '성장은 이어집니다. 꺾이는 게 아니라 완만해지는 겁니다.' },
  lowest:            { label: '최저 효율',  color: '#5C4A18', desc: '연구가 드문 구간이라 외삽에 가깝습니다.' },
  unstudied:         { label: '불확실',    color: 'HATCH',   desc: '연구 데이터가 없는 구간입니다. 뭐라 말씀드릴 수가 없습니다.' },
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
