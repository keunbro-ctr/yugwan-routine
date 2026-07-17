export type MuscleKey =
  | '가슴' | '광배/등' | '중상부/등' | '사두' | '둔근' | '햄스트링'
  | '측면삼각근' | '전면삼각근' | '후면삼각근' | '이두' | '삼두'
  | '종아리' | '복근' | '기립근';

export const PRIMARY_MUSCLES = [
  '가슴', '광배/등', '중상부/등', '사두', '둔근', '햄스트링',
  '측면삼각근', '전면삼각근', '후면삼각근', '이두', '삼두',
] as const;

export const SECONDARY_MUSCLES = ['종아리', '복근', '기립근'] as const;

export type MovementPattern =
  | 'horizontal_push' | 'vertical_push' | 'chest_isolation'
  | 'horizontal_pull' | 'vertical_pull' | 'shrug'
  | 'squat' | 'hinge' | 'knee_flexion' | 'hip_extension'
  | 'lateral_raise' | 'rear_delt'
  | 'elbow_flexion' | 'elbow_extension';

export interface Exercise {
  id: string;
  name: string;
  pattern: MovementPattern;
  category: '가슴' | '등' | '어깨' | '하체' | '팔';
  note: string;
  coefficients: Partial<Record<MuscleKey, number>>;
}

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  coefficientOverride?: Partial<Record<MuscleKey, number>>;
  // 드래그 순서 변경 시 아이템 정체성을 유지하기 위한 안정적인 id.
  // 정적 프리셋 데이터(lib/presets.ts)와 테스트 픽스처엔 없고, 스토어를 거치는
  // 런타임 인스턴스(addExercise/loadPreset/loadEmpty, 그리고 구버전 데이터 마이그레이션)에서 채워진다.
  uid?: string;
}

export interface Day {
  id: string;
  label: string;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  name: string;
  days: Day[];
  minutesPerSet: number;
}

export type WeeklyTier =
  | 'below_maintenance'
  | 'maintenance'
  | 'mev'
  | 'high'
  | 'moderate'
  | 'low'
  | 'lowest'
  | 'unstudied';

export type SessionState = 'normal' | 'above_puos';
