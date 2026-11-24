'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LATEST_CONTENT, SITE_NAME, findContent } from '@/lib/contents';
import { NavDrawer } from './NavDrawer';

export function AppHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = findContent(usePathname());

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-bg/95 px-2 backdrop-blur print:hidden">
        <button
          type="button"
          aria-label="메뉴 열기"
          onClick={() => setDrawerOpen(true)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1"
        >
          <span className="h-0.5 w-5 bg-text" />
          <span className="h-0.5 w-5 bg-text" />
          <span className="h-0.5 w-5 bg-text" />
        </button>
        <Link
          href={LATEST_CONTENT.href}
          className="shrink-0 font-serif text-[17px] font-bold tracking-[-0.03em] text-text"
        >
          {SITE_NAME}
        </Link>
        {current && (
          <>
            <span className="text-text-dim" aria-hidden="true">
              ·
            </span>
            <span className="min-w-0 truncate text-sm text-text-muted">{current.label}</span>
          </>
        )}
      </header>
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
