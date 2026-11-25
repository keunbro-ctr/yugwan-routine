import type { Metadata } from 'next';
import { DumbbellCompare } from '@/components/dumbbells/DumbbellCompare';
import { parseQuery } from '@/lib/dumbbellQuery';
import './dumbbells.css';

export const metadata: Metadata = {
  title: '무게조절 덤벨 비교',
  description:
    '무게조절 덤벨 10종을 한 쌍 가격·최대 중량·길이·조절 간격·확장성으로 비교합니다. 2026.11.24 조사, 배송비 별도.',
  // 링크 미리보기(카톡 등). 없으면 페이지 첫 큰 그림(광고 배너)을 집어 간다
  openGraph: {
    title: '무게조절 덤벨 비교 · 유관 1평 홈짐',
    description: '무게조절 덤벨 10종을 가격·최대 중량·길이·조절 간격으로 한눈에 비교',
    url: '/dumbbells',
    siteName: '유관 1평 홈짐',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/og/dumbbells-v2.jpg', width: 1200, height: 630, alt: '무게조절 덤벨 비교 · 유관 1평 홈짐' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og/dumbbells-v2.jpg'] },
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
