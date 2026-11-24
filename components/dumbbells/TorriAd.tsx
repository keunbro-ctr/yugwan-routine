'use client';

import Image from 'next/image';
import { useState } from 'react';

// 14편 광고 · 토리 노르웨이숲 탈취제. 하단 판매 수수료 안내 문구 표시.
// TODO: 고정댓글에 쓰는 할인 링크를 받으면 url 을 그것으로 바꾼다. 지금은 공식 제품 페이지.
export const TORRI_AD = {
  url: 'https://torrihome.kr/deodorizer',
  eyebrow: 'Norwegian Spruce Forest',
  brand: '토리',
  title: ['노르웨이', '산스장 탈취제'],
  body: ['땀·고무 냄새 밴 운동방을', '비 온 뒤 숲 냄새로'],
  cta: '숲 향 보러 가기',
  disclosure: '이 링크로 탈취제를 구매하시면 제게 판매 수수료가 지급됩니다.',
} as const;

interface Props {
  /** 하단 비교 바가 떠 있으면 그 위로 올린다 */
  raised: boolean;
}

export function TorriAd({ raised }: Props) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const close = () => {
    setVisible(false);
  };

  return (
    <aside className={`dbx-ad${raised ? ' is-raised' : ''}`} aria-label="토리 노르웨이 산스장 탈취제 안내">
      <a className="dbx-ad-link" href={TORRI_AD.url} target="_blank" rel="sponsored noopener">
        {/* PC: 9:5 가로 배너 / 모바일: 14:5 컴팩트 전용 배너 */}
        <span className="dbx-ad-scene">
          <Image
            className="dbx-ad-img-pc"
            src="/images/ad/torri-banner-v2.jpg"
            alt="노르웨이 숲 속에서 두 손으로 든 토리 탈취제"
            fill
            sizes="720px"
            priority
          />
          <Image
            className="dbx-ad-img-mo"
            src="/images/ad/torri-banner-mobile-v2.jpg"
            alt="노르웨이 숲 속에서 두 손으로 든 토리 탈취제"
            fill
            sizes="100vw"
            priority
          />
        </span>
        <span className="dbx-ad-text">
          <span className="dbx-ad-eyebrow">{TORRI_AD.eyebrow}</span>
          <span className="dbx-ad-title">
            <span className="dbx-ad-brand">{TORRI_AD.brand}</span>{' '}
            {TORRI_AD.title[0]}
            <br className="dbx-ad-br" />
            <span className="dbx-ad-sp"> </span>
            {TORRI_AD.title[1]}
          </span>
          <span className="dbx-ad-rule" aria-hidden="true" />
          <span className="dbx-ad-sub">
            {TORRI_AD.body[0]}
            <br className="dbx-ad-br" />
            <span className="dbx-ad-sp"> </span>
            {TORRI_AD.body[1]}
          </span>
          <span className="dbx-ad-cta">
            {TORRI_AD.cta} <span aria-hidden="true">→</span>
          </span>
        </span>
      </a>
      <p className="dbx-ad-disclosure">{TORRI_AD.disclosure}</p>
      <button type="button" className="dbx-ad-close" onClick={close} aria-label="배너 닫기">
        ✕
      </button>
    </aside>
  );
}
