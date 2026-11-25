import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import localFont from "next/font/local";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const paperlogy = localFont({
  variable: "--font-paperlogy",
  src: [
    { path: "../public/fonts/Paperlogy-6SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Paperlogy-7Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Paperlogy-8ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/Paperlogy-9Black.ttf", weight: "900", style: "normal" },
  ],
});

const heirOfLight = localFont({
  variable: "--font-heir",
  src: [{ path: "../public/fonts/HeirofLightBold.woff2", weight: "700", style: "normal" }],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yugwan-routine.vercel.app"),
  title: { default: "유관 1평 홈짐", template: "%s · 유관 1평 홈짐" },
  description: "유튜브 채널 유관의 1평 홈짐 시리즈 도구 모음 · 무게조절 덤벨 비교, 홈짐 루틴 빌더",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${paperlogy.variable} ${heirOfLight.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body className="h-full flex flex-col bg-bg text-text">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
