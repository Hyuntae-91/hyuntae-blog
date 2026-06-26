import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  hasLocale,
  type Locale,
  locales,
  resolvePostHrefLocale,
  resolvePostSourceLocale,
} from "./locale-helpers";
import type { CategoryGroup } from "./categories";

// 개발(포트폴리오)과 취미(life)는 콘텐츠 트리부터 분리한다.
// 그룹 인자는 dev를 기본값으로 둬서, 기존 호출부(홈·블로그·RSS·llms·sitemap)는
// 손대지 않아도 개발 전용으로 동작한다 → 포트폴리오 신호가 흐려지지 않는다.
const contentDirs: Record<CategoryGroup, string> = {
  dev: path.join(process.cwd(), "content/posts"),
  life: path.join(process.cwd(), "content/life"),
};

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  originalLang: Locale;
  tags: string[];
  category: string;
  description: string;
  availableLocales: Locale[];
  sourceLocale: Locale;
  hrefLocale: Locale;
  isTranslationAvailable: boolean;
  group: CategoryGroup;
}

function getPostDirectories(group: CategoryGroup): string[] {
  const contentDir = contentDirs[group];
  if (!fs.existsSync(contentDir)) return [];

  return fs.readdirSync(contentDir).filter((entry) => {
    const stat = fs.statSync(path.join(contentDir, entry));
    return stat.isDirectory();
  });
}

function getLocaleFileMap(
  group: CategoryGroup,
  slug: string
): Partial<Record<Locale, string>> {
  const files: Partial<Record<Locale, string>> = {};
  const contentDir = contentDirs[group];

  for (const locale of locales) {
    const filePath = path.join(contentDir, slug, `${locale}.mdx`);
    if (fs.existsSync(filePath)) {
      files[locale] = filePath;
    }
  }

  return files;
}

function getAvailableLocales(
  localeFiles: Partial<Record<Locale, string>>
): Locale[] {
  return locales.filter((locale) => Boolean(localeFiles[locale]));
}

function readPostFile(filePath: string) {
  return matter(fs.readFileSync(filePath, "utf-8"));
}

function resolveOriginalLocale(
  localeFiles: Partial<Record<Locale, string>>
): Locale | null {
  const firstAvailableLocale = locales.find((locale) => localeFiles[locale]);
  if (!firstAvailableLocale) return null;

  const { data } = readPostFile(localeFiles[firstAvailableLocale]!);
  const configuredOriginalLocale = data.originalLang;

  if (
    typeof configuredOriginalLocale === "string" &&
    hasLocale(configuredOriginalLocale) &&
    localeFiles[configuredOriginalLocale]
  ) {
    return configuredOriginalLocale;
  }

  return firstAvailableLocale;
}

export function getAllPosts(
  locale: Locale,
  group: CategoryGroup = "dev"
): PostMeta[] {
  // TODO: 현재는 호출할 때마다 모든 글 디렉터리를 순회하고 frontmatter를 읽은 뒤
  // 전체 결과를 정렬한다. 개인 블로그 규모에서는 괜찮지만, 글 수가 늘어나거나
  // 이 함수를 참조하는 라우트가 많아지면 비용이 커질 수 있다.
  // 추후 메타데이터 캐싱이나 빌드 타임 인덱스 생성을 고려한다.
  const slugs = getPostDirectories(group);
  const posts: PostMeta[] = [];

  for (const slug of slugs) {
    const localeFiles = getLocaleFileMap(group, slug);
    const availableLocales = getAvailableLocales(localeFiles);
    const originalLocale = resolveOriginalLocale(localeFiles);

    if (!originalLocale) continue;

    const sourceLocale = resolvePostSourceLocale({
      requestedLocale: locale,
      availableLocales,
      originalLocale,
    });

    if (!sourceLocale) continue;

    const target = localeFiles[sourceLocale];
    if (!target) continue;

    const { data } = readPostFile(target);

    posts.push({
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      originalLang:
        typeof data.originalLang === "string" && hasLocale(data.originalLang)
          ? data.originalLang
          : originalLocale,
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category ?? "",
      description: data.description ?? "",
      availableLocales,
      sourceLocale,
      hrefLocale: resolvePostHrefLocale({
        requestedLocale: locale,
        availableLocales,
        originalLocale,
      }),
      isTranslationAvailable: availableLocales.includes(locale),
      group,
    });
  }

  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getPost(
  slug: string,
  locale: Locale,
  group: CategoryGroup = "dev"
) {
  const localeFiles = getLocaleFileMap(group, slug);
  const target = localeFiles[locale];
  if (!target) return null;

  const { data, content } = readPostFile(target);
  const availableLocales = getAvailableLocales(localeFiles);
  const originalLocale = resolveOriginalLocale(localeFiles) ?? locale;

  return {
    meta: {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      originalLang:
        typeof data.originalLang === "string" && hasLocale(data.originalLang)
          ? data.originalLang
          : originalLocale,
      tags: (data.tags as string[]) ?? [],
      category: (data.category as string) ?? "",
      description: (data.description as string) ?? "",
      availableLocales,
      group,
    },
    content,
  };
}

export function getAllSlugs(group: CategoryGroup = "dev"): string[] {
  return getPostDirectories(group);
}

// 취미(life) 영역 헬퍼. 개발 전용 호출부와 명확히 구분해 실수로 섞이지 않게 한다.
export function getLifePosts(locale: Locale): PostMeta[] {
  return getAllPosts(locale, "life");
}

export function getLifePostsByCategory(
  locale: Locale,
  category: string
): PostMeta[] {
  return getLifePosts(locale).filter((post) => post.category === category);
}

// 관련 글 랭킹(순수 함수)은 별도 모듈에서 단위 테스트한다. 여기서는 재노출만 한다.
export { rankRelatedPosts } from "./related-posts";
