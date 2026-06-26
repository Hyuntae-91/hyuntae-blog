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
  // Search Console 소유권 확인용. Vercel 환경변수 NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION에
  // 값을 넣으면 <meta name="google-site-verification"> 태그가 자동 생성된다. (미설정 시 태그 없음)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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
