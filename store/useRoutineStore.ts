import { arrayMove } from '@dnd-kit/sortable';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRESETS } from '@/lib/presets';
import type { Day, MuscleKey, Routine } from '@/lib/types';

const DAY_LABEL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// 드래그 순서 변경 시 아이템 정체성을 유지하기 위해, uid가 없는 exercise에만 채운다.
// (프리셋 정적 데이터·구버전 localStorage 데이터에 한 번만 백필하는 용도로도 재사용)
function stampUids(routine: Routine): Routine {
  return {
    ...routine,
    days: routine.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((re) => ({ ...re, uid: re.uid ?? crypto.randomUUID() })),
    })),
  };
}

function emptyRoutine(): Routine {
  return stampUids({
    id: 'custom',
    name: '커스텀 루틴',
    minutesPerSet: 3,
    days: [
      { id: 'A', label: 'Day A', exercises: [] },
      { id: 'B', label: 'Day B', exercises: [] },
    ],
  });
}

function updateDay(routine: Routine, dayId: string, updater: (day: Day) => Day): Routine {
  return {
    ...routine,
    days: routine.days.map((day) => (day.id === dayId ? updater(day) : day)),
  };
}

interface RoutineStore {
  routine: Routine;
  activeDayId: string;
  dashboardOpen: boolean;
  hasHydrated: boolean;

  loadPreset: (preset: Routine) => void;
  loadEmpty: () => void;
  resetRoutine: () => void;
  setActiveDay: (dayId: string) => void;
  addDay: () => void;
  removeDay: (dayId: string) => void;
  addExercise: (dayId: string, exerciseId: string) => void;
  removeExercise: (dayId: string, index: number) => void;
  reorderExercises: (dayId: string, fromIndex: number, toIndex: number) => void;
  setSets: (dayId: string, index: number, sets: number) => void;
  setCoefficientOverride: (dayId: string, index: number, muscle: MuscleKey, value: number) => void;
  clearCoefficientOverride: (dayId: string, index: number) => void;
  openDashboard: () => void;
  closeDashboard: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set, get) => ({
      routine: emptyRoutine(),
      activeDayId: 'A',
      dashboardOpen: false,
      hasHydrated: false,

      loadPreset: (preset) => {
        const routine = stampUids(preset);
        set({ routine, activeDayId: routine.days[0]?.id ?? 'A' });
      },

      loadEmpty: () => {
        const routine = emptyRoutine();
        set({ routine, activeDayId: routine.days[0].id });
      },

      // 현재 루틴이 원래 불러왔던 프리셋(routine.id)으로 되돌아간다.
      // 빈 루틴("custom")으로 시작했다면 대응하는 프리셋이 없으므로 빈 상태로 되돌린다.
      resetRoutine: () => {
        const { routine } = get();
        const preset = PRESETS.find((p) => p.id === routine.id);
        if (preset) {
          get().loadPreset(structuredClone(preset));
        } else {
          get().loadEmpty();
        }
      },

      setActiveDay: (dayId) => set({ activeDayId: dayId }),

      addDay: () => {
        const { routine } = get();
        if (routine.days.length >= 6) return;
        const letter = DAY_LABEL_LETTERS[routine.days.length];
        const newDay: Day = { id: letter, label: `Day ${letter}`, exercises: [] };
        set({ routine: { ...routine, days: [...routine.days, newDay] }, activeDayId: newDay.id });
      },

      removeDay: (dayId) => {
        const { routine, activeDayId } = get();
        if (routine.days.length <= 2) return;
        const remaining = routine.days.filter((day) => day.id !== dayId);
        const nextActive = activeDayId === dayId ? remaining[0].id : activeDayId;
        set({ routine: { ...routine, days: remaining }, activeDayId: nextActive });
      },

      addExercise: (dayId, exerciseId) => {
        set((state) => ({
          routine: updateDay(state.routine, dayId, (day) => ({
            ...day,
            exercises: [...day.exercises, { exerciseId, sets: 3, uid: crypto.randomUUID() }],
          })),
        }));
      },

      removeExercise: (dayId, index) => {
        set((state) => ({
          routine: updateDay(state.routine, dayId, (day) => ({
            ...day,
            exercises: day.exercises.filter((_, i) => i !== index),
          })),
        }));
      },

      reorderExercises: (dayId, fromIndex, toIndex) => {
        set((state) => ({
          routine: updateDay(state.routine, dayId, (day) => ({
            ...day,
            exercises: arrayMove(day.exercises, fromIndex, toIndex),
          })),
        }));
      },

      setSets: (dayId, index, sets) => {
        const clamped = Math.min(10, Math.max(1, sets));
        set((state) => ({
          routine: updateDay(state.routine, dayId, (day) => ({
            ...day,
            exercises: day.exercises.map((re, i) => (i === index ? { ...re, sets: clamped } : re)),
          })),
        }));
      },

      setCoefficientOverride: (dayId, index, muscle, value) => {
        set((state) => ({
          routine: updateDay(state.routine, dayId, (day) => ({
            ...day,
            exercises: day.exercises.map((re, i) =>
              i === index
                ? { ...re, coefficientOverride: { ...re.coefficientOverride, [muscle]: value } }
                : re
            ),
          })),
        }));
      },

      clearCoefficientOverride: (dayId, index) => {
        set((state) => ({
          routine: updateDay(state.routine, dayId, (day) => ({
            ...day,
            exercises: day.exercises.map((re, i) => {
              if (i !== index) return re;
              const rest = { ...re };
              delete rest.coefficientOverride;
              return rest;
            }),
          })),
        }));
      },

      openDashboard: () => set({ dashboardOpen: true }),
      closeDashboard: () => set({ dashboardOpen: false }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'yugwan-routine-storage',
      version: 1,
      partialize: (state) => ({ routine: state.routine, activeDayId: state.activeDayId }),
      migrate: (persistedState, version) => {
        const state = persistedState as { routine?: Routine; activeDayId?: string };
        if (version < 1 && state?.routine) {
          state.routine = stampUids(state.routine);
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
