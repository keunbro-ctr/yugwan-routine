'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NavDrawer } from './NavDrawer';

export function AppHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-bg px-2">
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
        <Link href="/" className="font-headline text-base font-bold text-text">
          유관 홈짐 루틴 빌더
        </Link>
      </header>
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
