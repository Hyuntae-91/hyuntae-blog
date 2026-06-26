import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    alternateLocale: ["en_US", "ja_JP"],
  },
  robots: {
    index: true,
    follow: true,
  },
  // 검색엔진 소유권 확인용. 해당 환경변수에 값을 넣으면 메타태그가 자동 생성된다.
  // - Google:  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  // - Naver:   NEXT_PUBLIC_NAVER_SITE_VERIFICATION
  // (미설정 시 빈 태그가 생기지 않도록 Naver는 값이 있을 때만 추가한다)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    ...(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? {
          other: {
            "naver-site-verification":
              process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION,
          },
        }
      : {}),
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
