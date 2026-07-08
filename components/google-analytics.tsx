"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import {
  INTERNAL_TRAFFIC_COOKIE_NAME,
  shouldLoadAnalytics,
} from "@/lib/analytics";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return document.cookie
    .split("; ")
    .some((entry) => entry === `${INTERNAL_TRAFFIC_COOKIE_NAME}=1`);
}

// SSR/최초 하이드레이션 시엔 쿠키를 읽을 수 없으니 "내부 방문자 아님"으로
// 간주해 정적 HTML을 모두에게 동일하게 캐시한다. 실제 내부 방문자 쿠키는
// 하이드레이션 직후 useSyncExternalStore가 이 값을 실제 쿠키값으로 교정한다.
// 이걸 서버 레이아웃에서 cookies()로 읽던 예전 방식은 [locale] 하위 전체
// 라우트를 요청마다 렌더링되는 dynamic 라우트로 강등시켜 블로그 글 페이지의
// ISR(revalidate)을 무력화했다.
function getServerSnapshot() {
  return false;
}

export function GoogleAnalytics({ gaId }: { gaId: string | undefined }) {
  const isInternalVisitor = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (!shouldLoadAnalytics({ gaId, isInternalVisitor })) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
