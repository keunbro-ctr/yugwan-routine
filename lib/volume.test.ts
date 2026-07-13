import { describe, expect, it } from 'vitest';
import type { Day, Routine } from './types';
import { EXERCISES } from './exercises';
import { PRESETS } from './presets';
import {
  frequency,
  sessionState,
  sessionVolume,
  suggestRedistribution,
  weeklyTier,
  weeklyVolume,
} from './volume';

describe('sessionVolume — 스펙 §1-1 예시', () => {
  it('덤벨 벤치프레스 4세트 → 가슴 4.0 / 전면삼각근 2.0 / 삼두 2.0', () => {
    const day: Day = {
      id: 'X',
      label: 'Day X',
      exercises: [{ exerciseId: 'db-bench-press', sets: 4 }],
    };
    const volume = sessionVolume(day, EXERCISES);
    expect(volume['가슴']).toBe(4);
    expect(volume['전면삼각근']).toBe(2);
    expect(volume['삼두']).toBe(2);
    expect(volume['광배/등']).toBe(0);
  });
});

describe('weeklyTier — §1-2 경계값', () => {
  it.each([
    [2.9, 'below_maintenance'],
    [3, 'maintenance'],
    [3.9, 'maintenance'],
    [4, 'mev'],
    [4.9, 'mev'],
    [5, 'high'],
    [10, 'high'],
    [11, 'moderate'],
    [18, 'moderate'],
    [19, 'low'],
    [29, 'low'],
    [30, 'lowest'],
    [42, 'lowest'],
    [43, 'unstudied'],
  ] as const)('%s 세트 → %s', (sets, tier) => {
    expect(weeklyTier(sets)).toBe(tier);
  });
});

describe('sessionState — §1-3 경계값 (PUOS)', () => {
  it('11 → normal', () => {
    expect(sessionState(11)).toBe('normal');
  });
  it('12 → above_puos', () => {
    expect(sessionState(12)).toBe('above_puos');
  });
  it('8은 특별한 경계가 아니다 (존재하지 않는 기준)', () => {
    expect(sessionState(8)).toBe('normal');
    expect(sessionState(8.165)).toBe('normal');
  });
});

describe('frequency — §1-5', () => {
  it('해당 부위 fractional > 0인 Day 수를 센다', () => {
    const routine: Routine = {
      id: 'test',
      name: 'test',
      minutesPerSet: 3,
      days: [
        { id: 'A', label: 'A', exercises: [{ exerciseId: 'db-bench-press', sets: 3 }] }, // 가슴
        { id: 'B', label: 'B', exercises: [{ exerciseId: 'pullup-overhand', sets: 3 }] }, // 광배/등
        { id: 'C', label: 'C', exercises: [{ exerciseId: 'incline-db-bench-press', sets: 3 }] }, // 가슴
      ],
    };
    expect(frequency(routine, '가슴', EXERCISES)).toBe(2);
    expect(frequency(routine, '광배/등', EXERCISES)).toBe(1);
    expect(frequency(routine, '사두', EXERCISES)).toBe(0);
  });
});

describe('suggestRedistribution — §3-3', () => {
  it('현재 Day를 제외한 나머지 Day와 각 Day의 해당 부위 현재 세트를 반환한다', () => {
    const routine = PRESETS.find((r) => r.id === 'ul4')!;
    const suggestions = suggestRedistribution(routine, 'A', '가슴', EXERCISES);
    expect(suggestions.map((s) => s.targetDayId)).toEqual(['B', 'C', 'D']);
    expect(suggestions.every((s) => typeof s.currentSets === 'number')).toBe(true);
  });
});

describe('weeklyVolume — 부동소수점 반올림', () => {
  it('결과는 항상 소수 1자리로 반올림된다', () => {
    for (const routine of PRESETS) {
      const volume = weeklyVolume(routine, EXERCISES);
      for (const value of Object.values(volume)) {
        expect(value).toBeCloseTo(Math.round(value * 10) / 10, 10);
      }
    }
  });
});
