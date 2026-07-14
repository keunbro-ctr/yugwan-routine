'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const COMING_SOON_ITEMS = ['BMI 계산기', 'FFMI 계산기'];

export function NavDrawer({ open, onClose }: NavDrawerProps) {
  const pathname = usePathname();
  const isRoutineActive = pathname === '/' || pathname.startsWith('/edit');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative flex h-full w-72 max-w-[80vw] flex-col border-r border-border bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={onClose}
          className="mb-6 flex h-11 w-11 items-center justify-center text-text-muted hover:text-text"
        >
          ✕
        </button>
        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-text"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isRoutineActive ? 'bg-gold' : 'bg-transparent'}`}
              aria-hidden="true"
            />
            홈짐 루틴 빌더
          </Link>
          {COMING_SOON_ITEMS.map((label) => (
            <span
              key={label}
              className="flex cursor-default items-center gap-2 rounded-lg px-3 py-3 text-sm text-text-dim"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-transparent" aria-hidden="true" />
              {label} (준비중)
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
