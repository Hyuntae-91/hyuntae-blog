"use client";

import { useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n";

const messages: Record<Locale, { title: string; body: string; button: string }> = {
  ko: {
    title: "번역 준비 중",
    body: "이 글의 한국어 번역은 아직 준비 중입니다. 원본 글로 이동합니다.",
    button: "확인",
  },
  en: {
    title: "Translation in progress",
    body: "The English translation of this post is not yet available. You will be redirected to the original post.",
    button: "OK",
  },
  ja: {
    title: "翻訳準備中",
    body: "この記事の日本語翻訳はまだ準備中です。原文に移動します。",
    button: "確認",
  },
};

interface Props {
  locale: Locale;
  originalLocale: Locale;
  slug: string;
  // 원본 글로 이동할 경로. 개발(/blog)과 취미(/life/[category])가 달라 주입한다.
  // 미지정 시 개발 블로그 경로로 폴백한다.
  redirectHref?: string;
}

export function TranslationPendingModal({
  locale,
  originalLocale,
  slug,
  redirectHref,
}: Props) {
  const router = useRouter();
  const msg = messages[locale] ?? messages.en;

  function handleConfirm() {
    router.replace(redirectHref ?? `/${originalLocale}/blog/${slug}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold">{msg.title}</h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {msg.body}
        </p>
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          {msg.button}
        </button>
      </div>
    </div>
  );
}
