// 사이트에 올라간 콘텐츠 목록. 메뉴·머리글이 이 목록을 쓴다.
// 새 콘텐츠를 만들면 여기에 한 줄 추가한다. 순서는 date 로 자동 정렬된다 (최신이 맨 위).

export interface ContentEntry {
  href: string;
  /** 메뉴·머리글에 쓰는 이름 */
  label: string;
  /** 어느 영상 편과 짝인지 */
  episode: string;
  /** 사이트에 올린 날 (YYYY-MM-DD). 정렬 기준 */
  date: string;
  /** 활성 표시 색. 화면 강조색과 맞춘다 (앰버 화면과 샴페인 화면을 섞지 않는다) */
  accent: string;
  /** 이 경로면 이 콘텐츠로 본다 */
  match: (pathname: string) => boolean;
}

const ENTRIES: ContentEntry[] = [
  {
    href: '/',
    label: '1평 홈짐 루틴 빌더',
    episode: '8편',
    date: '2026-07-13',
    accent: '#FFBE00',
    match: (p) => p === '/' || p.startsWith('/edit'),
  },
  {
    href: '/dumbbells',
    label: '무게조절 덤벨 비교',
    episode: '14편',
    date: '2026-11-17',
    accent: '#D8C197',
    match: (p) => p.startsWith('/dumbbells'),
  },
];

export const CONTENTS: ContentEntry[] = [...ENTRIES].sort((a, b) => b.date.localeCompare(a.date));

export const LATEST_CONTENT = CONTENTS[0];

export const SITE_NAME = '유관 1평 홈짐';

export function findContent(pathname: string): ContentEntry | undefined {
  return CONTENTS.find((c) => c.match(pathname));
}
