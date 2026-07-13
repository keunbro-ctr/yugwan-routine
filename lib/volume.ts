import type {
  Day,
  Exercise,
  MuscleKey,
  Routine,
  RoutineExercise,
  SessionState,
  WeeklyTier,
} from './types';
import { PRIMARY_MUSCLES, SECONDARY_MUSCLES } from './types';

const ALL_MUSCLES: MuscleKey[] = [...PRIMARY_MUSCLES, ...SECONDARY_MUSCLES];

function emptyMuscleRecord(): Record<MuscleKey, number> {
  const record = {} as Record<MuscleKey, number>;
  for (const muscle of ALL_MUSCLES) record[muscle] = 0;
  return record;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function exerciseCoefficients(
  routineExercise: RoutineExercise,
  db: Exercise[]
): Partial<Record<MuscleKey, number>> {
  if (routineExercise.coefficientOverride) return routineExercise.coefficientOverride;
  return db.find((e) => e.id === routineExercise.exerciseId)?.coefficients ?? {};
}

function rawSessionVolume(day: Day, db: Exercise[]): Record<MuscleKey, number> {
  const totals = emptyMuscleRecord();
  for (const routineExercise of day.exercises) {
    const coefficients = exerciseCoefficients(routineExercise, db);
    for (const [muscle, coefficient] of Object.entries(coefficients) as [MuscleKey, number][]) {
      totals[muscle] += routineExercise.sets * coefficient;
    }
  }
  return totals;
}

export function sessionVolume(day: Day, db: Exercise[]): Record<MuscleKey, number> {
  const totals = rawSessionVolume(day, db);
  for (const muscle of ALL_MUSCLES) totals[muscle] = round1(totals[muscle]);
  return totals;
}

export function weeklyVolume(routine: Routine, db: Exercise[]): Record<MuscleKey, number> {
  const totals = emptyMuscleRecord();
  for (const day of routine.days) {
    const dayRaw = rawSessionVolume(day, db);
    for (const muscle of ALL_MUSCLES) totals[muscle] += dayRaw[muscle];
  }
  for (const muscle of ALL_MUSCLES) totals[muscle] = round1(totals[muscle]);
  return totals;
}

// 경계: Pelland et al., Sports Medicine (2026). 각 구간은 [하한, 다음 하한) 반열림 구간.
export function weeklyTier(sets: number): WeeklyTier {
  if (sets < 3) return 'below_maintenance';
  if (sets < 4) return 'maintenance';
  if (sets < 5) return 'mev';
  if (sets < 11) return 'high';
  if (sets < 19) return 'moderate';
  if (sets < 30) return 'low';
  if (sets < 43) return 'lowest';
  return 'unstudied';
}

// 경계는 단 하나: 11 fractional 세트 (Remmert et al., SportRxiv 프리프린트). 8은 존재하지 않는 값.
export function sessionState(sets: number): SessionState {
  return sets >= 12 ? 'above_puos' : 'normal';
}

export function frequency(routine: Routine, muscle: MuscleKey, db: Exercise[]): number {
  return routine.days.filter((day) => rawSessionVolume(day, db)[muscle] > 0).length;
}

export function weeklyTotalSets(routine: Routine): number {
  return routine.days.reduce(
    (sum, day) => sum + day.exercises.reduce((daySum, re) => daySum + re.sets, 0),
    0
  );
}

export function sessionTotalSets(day: Day): number {
  return day.exercises.reduce((sum, re) => sum + re.sets, 0);
}

export function avgSetsPerSession(routine: Routine): number {
  const activeDayCount = routine.days.filter((day) => day.exercises.length > 0).length;
  if (activeDayCount === 0) return 0;
  return round1(weeklyTotalSets(routine) / activeDayCount);
}

export function estimatedMinutes(totalSets: number, minutesPerSet: number): number {
  return Math.round(totalSets * minutesPerSet);
}

// 분산 제안: 초과 부위를 옮길 수 있는 다른 Day 목록과 그 Day의 현재 해당 부위 세트를 반환한다.
// 실제 세트 이동(감소/가산, 11 이하가 될 때까지만)은 store/UI 레이어에서 이 결과를 바탕으로 수행한다.
export function suggestRedistribution(
  routine: Routine,
  dayId: string,
  muscle: MuscleKey,
  db: Exercise[]
): { targetDayId: string; currentSets: number }[] {
  return routine.days
    .filter((day) => day.id !== dayId)
    .map((day) => ({
      targetDayId: day.id,
      currentSets: round1(rawSessionVolume(day, db)[muscle] ?? 0),
    }));
}
