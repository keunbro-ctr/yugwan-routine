'use client';

import Link from 'next/link';
import type React from 'react';
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
              <div
                key={c.href}
                className={`flex items-center rounded-lg ${
                  active ? 'bg-surface-raised' : 'hover:bg-surface-raised/60'
                }`}
              >
                <Link
                  href={c.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2 py-3 pl-3 pr-1 text-sm font-medium text-text"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: active ? c.accent : 'transparent' }}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{c.label}</span>
                  <span className="text-xs tabular-nums text-text-dim">{c.episode}</span>
                </Link>
                <a
                  href={c.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${c.episode} 영상 유튜브에서 보기`}
                  title={`${c.episode} 영상 보기`}
                  className="mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[11px] text-text-dim transition-colors hover:text-[var(--acc)]"
                  style={{ '--acc': c.accent } as React.CSSProperties}
                >
                  ▶
                </a>
              </div>
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
