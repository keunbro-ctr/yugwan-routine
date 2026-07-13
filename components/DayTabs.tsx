import { useRoutineStore } from '@/store/useRoutineStore';

export function DayTabs() {
  const days = useRoutineStore((s) => s.routine.days);
  const activeDayId = useRoutineStore((s) => s.activeDayId);
  const setActiveDay = useRoutineStore((s) => s.setActiveDay);
  const addDay = useRoutineStore((s) => s.addDay);
  const removeDay = useRoutineStore((s) => s.removeDay);

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 border-b border-border">
      {days.map((day) => (
        <button
          key={day.id}
          type="button"
          onClick={() => setActiveDay(day.id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            day.id === activeDayId
              ? 'bg-gold text-black'
              : 'bg-surface text-text-muted hover:text-text'
          }`}
        >
          {day.label}
        </button>
      ))}
      <button
        type="button"
        onClick={addDay}
        disabled={days.length >= 6}
        aria-label="Day 추가"
        className="shrink-0 w-11 h-11 rounded-full border border-border text-text-muted disabled:opacity-30 hover:border-gold hover:text-gold transition-colors"
      >
        +
      </button>
      {days.length > 2 && (
        <button
          type="button"
          onClick={() => removeDay(activeDayId)}
          aria-label="현재 Day 삭제"
          className="shrink-0 w-11 h-11 rounded-full border border-border text-text-muted hover:border-gold hover:text-gold transition-colors"
        >
          −
        </button>
      )}
    </div>
  );
}
