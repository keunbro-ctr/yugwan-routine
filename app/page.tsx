import Link from 'next/link';
import { PRESETS } from '@/lib/presets';
import { avgSetsPerSession, estimatedMinutes } from '@/lib/volume';

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-2xl">
        <p className="text-gold text-sm font-medium tracking-wide mb-2">유관 · 8편</p>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-text mb-2">
          내 루틴, 내가 짠다
        </h1>
        <p className="text-text-muted mb-1">주 3·4·5일 홈짐 루틴 설계기</p>
        <p className="text-text-muted mb-10 leading-relaxed">
          프리셋을 불러와 운동을 추가·삭제·조절하고, 주간·세션 볼륨을 실시간으로 확인하세요.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {PRESETS.map((preset) => {
            const avgMinutes = estimatedMinutes(avgSetsPerSession(preset), preset.minutesPerSet);
            return (
              <Link
                key={preset.id}
                href={`/edit?preset=${preset.id}`}
                className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-gold"
              >
                <p className="text-text font-semibold mb-1 group-hover:text-gold transition-colors">
                  {preset.name}
                </p>
                <p className="text-gold text-sm mb-1">회당 평균 {avgMinutes}분</p>
                <p className="text-text-muted text-xs">
                  {preset.days.map((day) => day.label).join(' · ')}
                </p>
              </Link>
            );
          })}
        </div>

        <Link
          href="/edit?preset=empty"
          className="mt-4 block rounded-xl border border-dashed border-border p-5 text-center text-text-muted transition-colors hover:border-gold hover:text-gold"
        >
          빈 루틴으로 직접 설계
        </Link>

        <p className="mt-12 text-sm text-text-muted">
          이 앱의 배경이 궁금하다면{' '}
          <a href="#" className="text-gold underline underline-offset-2">
            유관 8편 영상
          </a>
          을 참고하세요.
        </p>
      </div>
    </main>
  );
}
