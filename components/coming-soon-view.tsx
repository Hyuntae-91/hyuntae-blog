import Link from "next/link";
import { type Locale } from "@/lib/locale-helpers";

// "준비중"이 아니라 "Coming Soon"으로 통일해 노출한다(한·영·일 모두 동일 문구).
// 라벨은 고정이고, 보조 안내문과 돌아가기 링크만 각 언어로 둔다.
const COMING_SOON = "Coming Soon";

const labels: Record<Locale, { body: string; back: string }> = {
  ko: {
    body: "이 글은 아직 공개 전이에요. 곧 올라올 예정이니 조금만 기다려 주세요.",
    back: "블로그 목록으로",
  },
  en: {
    body: "This post isn't published yet — it's on the way. Please check back soon.",
    back: "Back to blog",
  },
  ja: {
    body: "この記事はまだ公開されていません。近日公開予定ですので、もう少しお待ちください。",
    back: "ブログ一覧へ",
  },
};

interface Props {
  locale: Locale;
  // 공개 예정인 글의 제목. 어떤 글을 기다리는지 독자가 알 수 있게 보여준다.
  title: string;
  // 돌아갈 목록 경로. 개발(/blog)과 취미(/life/[category])가 달라 주입한다.
  backHref: string;
}

export function ComingSoonView({ locale, title, backHref }: Props) {
  const t = labels[locale] ?? labels.en;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/70" />
        </span>
        {COMING_SOON}
      </span>

      <h1 className="mb-4 text-2xl font-bold leading-tight tracking-tight md:text-3xl">
        {title}
      </h1>

      <p className="mb-10 max-w-md leading-relaxed text-muted-foreground">
        {t.body}
      </p>

      <Link
        href={backHref}
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        {t.back}
      </Link>
    </div>
  );
}
