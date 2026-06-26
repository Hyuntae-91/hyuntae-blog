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
  // openGraph는 로케일을 알 수 없는 root에 두지 않고, 각 [locale] 페이지에서
  // buildOpenGraph로 og:locale을 동적으로 설정한다.
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
