import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plane, Guitar, BookOpen, TrendingUp } from "lucide-react";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/i18n";
import { LIFE_CATEGORIES } from "@/lib/categories";
import { getLifePosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/constants";
import { buildOpenGraph } from "@/lib/og-meta";

// 카드 글 수는 로컬 콘텐츠(getLifePosts)에서 오므로 배포 시에만 바뀐다.
// 예전 60초 주기는 방문(봇 포함)마다 불필요한 재렌더링을 트리거해 Vercel
// Fluid Active CPU를 과다 소모시켰다 — 24시간 안전밸브로만 둔다.
export const revalidate = 86400;

// 카테고리 정의(categories.ts)의 아이콘 이름 → 실제 컴포넌트 매핑.
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Plane,
  Guitar,
  BookOpen,
  TrendingUp,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.life.hubTitle,
    description: dict.life.hubDescription,
    openGraph: buildOpenGraph({
      locale: locale as Locale,
      url: `${SITE_URL}/${locale}/life`,
      description: dict.life.hubDescription,
    }),
    alternates: {
      canonical: `${SITE_URL}/${locale}/life`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/life`])
      ),
    },
  };
}

export default async function LifeHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const posts = getLifePosts(locale);

  const countByCategory = posts.reduce<Record<string, number>>((acc, post) => {
    acc[post.category] = (acc[post.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold">{dict.life.hubTitle}</h1>
      <p className="mb-8 text-muted-foreground">{dict.life.hubDescription}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {LIFE_CATEGORIES.map((category) => {
          const Icon = ICONS[category.icon];
          const count = countByCategory[category.id] ?? 0;
          return (
            <Link
              key={category.id}
              href={`/${locale}/life/${category.id}`}
              className="group rounded-xl border border-border p-5 transition-colors hover:bg-accent"
            >
              <div className="mb-3 flex items-center gap-3">
                {Icon && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <div>
                  <h2 className="font-semibold leading-tight">
                    {category.label[locale]}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {count} {dict.life.postsLabel}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {category.description[locale]}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
