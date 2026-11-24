'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CONTENTS, SITE_NAME } from '@/lib/contents';

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const COMING_SOON_ITEMS = ['BMI 계산기', 'FFMI 계산기'];

export function NavDrawer({ open, onClose }: NavDrawerProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative flex h-full w-72 max-w-[80vw] flex-col border-r border-border bg-surface p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="pl-3 font-serif text-lg font-bold tracking-[-0.03em] text-text">{SITE_NAME}</span>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center text-text-muted hover:text-text"
          >
            ✕
          </button>
        </div>
        <p className="mb-2 px-3 text-xs text-text-dim">최근 만든 순</p>
        <nav className="flex flex-col gap-1">
          {CONTENTS.map((c) => {
            const active = c.match(pathname);
            return (
              <Link
                key={c.href}
                href={c.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-text ${
                  active ? 'bg-surface-raised' : 'hover:bg-surface-raised/60'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: active ? c.accent : 'transparent' }}
                  aria-hidden="true"
                />
                <span className="flex-1">{c.label}</span>
                <span className="text-xs tabular-nums text-text-dim">{c.episode}</span>
              </Link>
            );
          })}
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
