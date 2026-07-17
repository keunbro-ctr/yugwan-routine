import { beforeEach, describe, expect, it } from 'vitest';
import { PRESETS } from '../lib/presets';
import { useRoutineStore } from './useRoutineStore';

function resetStoreToPreset(presetId: string) {
  const preset = PRESETS.find((p) => p.id === presetId)!;
  useRoutineStore.getState().loadPreset(structuredClone(preset));
}

beforeEach(() => {
  resetStoreToPreset('ul4');
});

describe('reorderExercises', () => {
  it('moves an exercise from one index to another within the day', () => {
    const dayId = useRoutineStore.getState().routine.days[0].id;
    const before = useRoutineStore
      .getState()
      .routine.days.find((d) => d.id === dayId)!
      .exercises.map((re) => re.exerciseId);

    useRoutineStore.getState().reorderExercises(dayId, 0, 2);

    const after = useRoutineStore
      .getState()
      .routine.days.find((d) => d.id === dayId)!
      .exercises.map((re) => re.exerciseId);

    // 0번이 2번 위치로 옮겨지고, 1·2번이 한 칸씩 앞으로 당겨진다.
    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[2]);
    expect(after[2]).toBe(before[0]);
    expect(after).toHaveLength(before.length);
  });

  it('does not affect other days', () => {
    const days = useRoutineStore.getState().routine.days;
    const dayId = days[0].id;
    const otherDayId = days[1].id;
    const otherBefore = days
      .find((d) => d.id === otherDayId)!
      .exercises.map((re) => re.exerciseId);

    useRoutineStore.getState().reorderExercises(dayId, 0, 1);

    const otherAfter = useRoutineStore
      .getState()
      .routine.days.find((d) => d.id === otherDayId)!
      .exercises.map((re) => re.exerciseId);
    expect(otherAfter).toEqual(otherBefore);
  });
});

describe('uid stamping', () => {
  it('gives every exercise a stable uid when a preset is loaded', () => {
    const uids = useRoutineStore
      .getState()
      .routine.days.flatMap((day) => day.exercises.map((re) => re.uid));
    expect(uids.every((uid) => typeof uid === 'string' && uid.length > 0)).toBe(true);
    expect(new Set(uids).size).toBe(uids.length); // 전부 유일
  });

  it('gives a fresh uid to exercises added via addExercise', () => {
    const dayId = useRoutineStore.getState().routine.days[0].id;
    useRoutineStore.getState().addExercise(dayId, 'db-curl');
    const exercises = useRoutineStore.getState().routine.days.find((d) => d.id === dayId)!
      .exercises;
    const added = exercises[exercises.length - 1];
    expect(added.uid).toBeTruthy();
  });
});

describe('resetRoutine', () => {
  it('restores a preset-based routine to its original values after edits', () => {
    const dayId = useRoutineStore.getState().routine.days[0].id;
    useRoutineStore.getState().setSets(dayId, 0, 9);
    useRoutineStore.getState().addExercise(dayId, 'db-curl');
    expect(useRoutineStore.getState().routine.days[0].exercises[0].sets).toBe(9);

    useRoutineStore.getState().resetRoutine();

    const original = PRESETS.find((p) => p.id === 'ul4')!;
    const resetDay = useRoutineStore.getState().routine.days[0];
    expect(resetDay.exercises.map((re) => ({ exerciseId: re.exerciseId, sets: re.sets }))).toEqual(
      original.days[0].exercises.map((re) => ({ exerciseId: re.exerciseId, sets: re.sets }))
    );
  });

  it('falls back to an empty routine when there is no matching preset ("custom")', () => {
    useRoutineStore.getState().loadEmpty();
    useRoutineStore.getState().addExercise(useRoutineStore.getState().routine.days[0].id, 'db-curl');
    expect(useRoutineStore.getState().routine.days[0].exercises).toHaveLength(1);

    useRoutineStore.getState().resetRoutine();

    const state = useRoutineStore.getState();
    expect(state.routine.id).toBe('custom');
    expect(state.routine.days.every((d) => d.exercises.length === 0)).toBe(true);
  });
});
