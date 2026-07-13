import { SOURCES } from '@/lib/tiers';

export function SourceFootnote() {
  return (
    <ul className="space-y-1 border-t border-border pt-3 mt-4 text-xs text-text-muted">
      {SOURCES.map((source) => (
        <li key={source}>{source}</li>
      ))}
    </ul>
  );
}
