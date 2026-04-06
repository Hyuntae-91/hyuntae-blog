import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Backend developer blog — OpenSearch, Spring, Python, and more",
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
