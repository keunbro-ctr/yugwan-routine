import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Day, MuscleKey, Routine } from '@/lib/types';

const DAY_LABEL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function emptyRoutine(): Routine {
  return {
    id: 'custom',
    name: '커스텀 루틴',
    minutesPerSet: 3,
    days: [
      { id: 'A', label: 'Day A', exercises: [] },
      { id: 'B', label: 'Day B', exercises: [] },
    ],
  };
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
  setActiveDay: (dayId: string) => void;
  addDay: () => void;
  removeDay: (dayId: string) => void;
  addExercise: (dayId: string, exerciseId: string) => void;
  removeExercise: (dayId: string, index: number) => void;
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

      loadPreset: (preset) => set({ routine: preset, activeDayId: preset.days[0]?.id ?? 'A' }),

      loadEmpty: () => {
        const routine = emptyRoutine();
        set({ routine, activeDayId: routine.days[0].id });
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
            exercises: [...day.exercises, { exerciseId, sets: 3 }],
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
      partialize: (state) => ({ routine: state.routine, activeDayId: state.activeDayId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
