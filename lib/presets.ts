import type { Routine } from './types';

// ① 주 3일 · 무분할
export const FULL3: Routine = {
  id: 'full3', name: '주 3일 · 무분할', minutesPerSet: 3,
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

// ④ 주 5일 · 무분할
export const FULL5: Routine = {
  id: 'full5', name: '주 5일 · 무분할', minutesPerSet: 3,
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
