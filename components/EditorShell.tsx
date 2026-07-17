'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useRef, useState } from 'react';
import { PRESETS } from '@/lib/presets';
import { useRoutineStore } from '@/store/useRoutineStore';
import { AddExerciseSheet } from './AddExerciseSheet';
import { BottomSummaryBar } from './BottomSummaryBar';
import { Dashboard } from './Dashboard';
import { DayTabs } from './DayTabs';
import { EditorToolbar } from './EditorToolbar';
import { ExerciseCard } from './ExerciseCard';
import { PrintableRoutine } from './PrintableRoutine';
import { SessionHeader } from './SessionHeader';
import { SessionMuscleStrip } from './SessionMuscleStrip';

interface EditorShellProps {
  initialPresetId?: string;
}

export function EditorShell({ initialPresetId }: EditorShellProps) {
  const hasHydrated = useRoutineStore((s) => s.hasHydrated);
  const routine = useRoutineStore((s) => s.routine);
  const activeDayId = useRoutineStore((s) => s.activeDayId);
  const loadPreset = useRoutineStore((s) => s.loadPreset);
  const loadEmpty = useRoutineStore((s) => s.loadEmpty);
  const reorderExercises = useRoutineStore((s) => s.reorderExercises);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const loadedPresetRef = useRef<string | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!hasHydrated || !initialPresetId) return;
    // 홈에서 프리셋 카드(혹은 "빈 루틴으로 직접 설계")를 클릭한 것은 명시적인 사용자 의도이므로 그대로 반영한다.
    // 이미 같은 값을 불러온 상태라면(리렌더/재방문) 편집 중인 내용을 덮어쓰지 않는다.
    // preset 파라미터 없이 /edit에 진입한 경우(뒤로가기 등 재방문)에는 기존 저장 상태를 그대로 둔다.
    if (loadedPresetRef.current === initialPresetId) return;
    if (initialPresetId === 'empty') {
      loadEmpty();
      loadedPresetRef.current = initialPresetId;
      return;
    }
    const preset = PRESETS.find((p) => p.id === initialPresetId);
    if (preset) {
      loadPreset(structuredClone(preset));
      loadedPresetRef.current = initialPresetId;
    }
  }, [hasHydrated, initialPresetId, loadPreset, loadEmpty]);

  if (!hasHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-text-muted">불러오는 중…</div>
    );
  }

  const activeDay = routine.days.find((day) => day.id === activeDayId) ?? routine.days[0];
  const sortableIds = activeDay.exercises.map((re, i) => re.uid ?? `${activeDay.id}-${i}`);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = sortableIds.indexOf(String(active.id));
    const toIndex = sortableIds.indexOf(String(over.id));
    if (fromIndex === -1 || toIndex === -1) return;
    reorderExercises(activeDay.id, fromIndex, toIndex);
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col print:hidden">
        <DayTabs />
        <SessionHeader />
        <EditorToolbar />
        <SessionMuscleStrip />
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {activeDay.exercises.map((_, index) => (
                  <ExerciseCard key={sortableIds[index]} dayId={activeDay.id} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={() => setAddSheetOpen(true)}
            className="mt-3 w-full rounded-xl border border-dashed border-border py-3 text-sm text-text-muted transition-colors hover:border-gold hover:text-gold"
          >
            + 운동 추가
          </button>
        </div>
        <BottomSummaryBar />
        <AddExerciseSheet
          dayId={activeDay.id}
          open={addSheetOpen}
          onClose={() => setAddSheetOpen(false)}
        />
        <Dashboard />
      </div>
      <PrintableRoutine />
    </>
  );
}
