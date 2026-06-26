"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

// giscus 설정값은 환경변수로 받는다. giscus.app에서 받은 값을 Vercel에 넣으면 된다.
const REPO = process.env.NEXT_PUBLIC_GISCUS_REPO;
const REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
const CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

const LABEL: Record<string, string> = {
  ko: "댓글",
  en: "Comments",
  ja: "コメント",
};

interface CommentsProps {
  // slug 기준으로 댓글 스레드를 묶어 같은 글의 ko/en/ja 번역이 댓글을 공유한다.
  term: string;
  lang: string;
}

export function Comments({ term, lang }: CommentsProps) {
  const { resolvedTheme } = useTheme();

  // 환경변수가 없으면(미설정) 렌더하지 않는다.
  if (!REPO || !REPO_ID || !CATEGORY_ID) return null;

  return (
    <section aria-label={LABEL[lang] ?? "Comments"}>
      <h2 className="mb-4 text-lg font-semibold">{LABEL[lang] ?? "Comments"}</h2>
      <Giscus
        repo={REPO as `${string}/${string}`}
        repoId={REPO_ID}
        category={CATEGORY}
        categoryId={CATEGORY_ID}
        mapping="specific"
        term={term}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        lang={lang}
        loading="lazy"
      />
    </section>
  );
}
