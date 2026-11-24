import type { Metadata } from 'next';
import { DumbbellCompare } from '@/components/dumbbells/DumbbellCompare';
import { parseQuery } from '@/lib/dumbbellQuery';
import './dumbbells.css';

export const metadata: Metadata = {
  title: '무게조절 덤벨 비교',
  description:
    '무게조절 덤벨 10종을 한 쌍 가격·최대 중량·길이·조절 간격·확장성으로 비교합니다. 2026.11.24 조사, 배송비 별도.',
};

interface DumbbellsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DumbbellsPage({ searchParams }: DumbbellsPageProps) {
  const initial = parseQuery(await searchParams);
  return (
    <main className="dbx">
      <DumbbellCompare initial={initial} />
    </main>
  );
}
