import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, getDictionary, locales, type Locale } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SITE_URL } from "@/lib/constants";
import { buildOpenGraph } from "@/lib/og-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.nav.about,
    description: dict.about.roleSummary,
    openGraph: buildOpenGraph({
      locale: locale as Locale,
      url: `${SITE_URL}/${locale}/about`,
      description: dict.about.roleSummary,
    }),
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/about`])
      ),
    },
  };
}

interface TimelineItem {
  date: string;
  role: Record<Locale, string>;
  company: string;
  description: Record<Locale, string>;
  tags: string[];
}

const timeline: TimelineItem[] = [
  {
    date: "2025.09 - Present",
    role: {
      ko: "백엔드 개발자",
      en: "Backend Developer",
      ja: "バックエンドエンジニア",
    },
    company: "Zimssa",
    description: {
      ko: "AWS OpenSearch 도입으로 검색 시스템 최적화, 레거시 slow API 개선, Testcontainers 통합테스트 도입",
      en: "Search system optimization with AWS OpenSearch, legacy slow API improvements, Testcontainers integration testing",
      ja: "AWS OpenSearchによる検索システム最適化、レガシーslow API改善、Testcontainers統合テスト導入",
    },
    tags: ["Java", "Spring", "OpenSearch", "Testcontainers"],
  },
  {
    date: "2021.06 - 2025.08",
    role: {
      ko: "백엔드 개발자",
      en: "Backend Developer",
      ja: "バックエンドエンジニア",
    },
    company: "loplat",
    description: {
      ko: "MAU 900만 오프라인 위치 플랫폼 백엔드 설계/운영, 100만 건 FCM 알림 5초 내 전송 파이프라인 구축, 공간쿼리 100ms 튜닝",
      en: "Designed and operated backend for offline location platform with 9M MAU, built FCM pipeline delivering 1M notifications in 5 seconds, spatial query tuning to 100ms",
      ja: "MAU 900万のオフライン位置プラットフォームのバックエンド設計・運用、100万件FCM通知を5秒以内に送信するパイプライン構築、空間クエリ100msチューニング",
    },
    tags: ["Python", "FastAPI", "GCP", "Redis", "BigQuery"],
  },
  {
    date: "2019.11 - 2020.07",
    role: {
      ko: "백엔드 개발자",
      en: "Backend Developer",
      ja: "バックエンドエンジニア",
    },
    company: "DotDotDot",
    description: {
      ko: "3D 아바타 메타버스 채팅 앱 백엔드 개발",
      en: "Backend development for 3D avatar metaverse chat application",
      ja: "3Dアバターメタバースチャットアプリのバックエンド開発",
    },
    tags: ["Python", "Flask"],
  },
];

const bio: Record<Locale, string[]> = {
  ko: [
    "MAU 750만 규모의 위치 데이터 플랫폼을 설계하고 운영해 온 백엔드 개발자입니다.",
    "100만 건의 FCM 알림을 5초 내에 전송하는 메시지 파이프라인을 구축했고, 공간쿼리 튜닝으로 대규모 트래픽 환경에서의 성능 최적화를 경험했습니다.",
    "현재는 Java/Spring 기반 서비스에서 AWS OpenSearch 도입과 레거시 API 병목 제거를 통해 검색/응답 성능을 개선하고 있습니다.",
    "신뢰할 수 있는 시스템을 만드는 데 관심이 많으며, Testcontainers 기반 통합테스트 도입 등 운영 체계 고도화에도 꾸준히 투자하고 있습니다.",
  ],
  en: [
    "Backend developer with experience designing and operating a location data platform serving 7.5M MAU.",
    "Built a message pipeline that delivers 1M FCM notifications within 5 seconds. Optimized performance in high-traffic environments through spatial query tuning.",
    "Currently improving search and response performance on a Java/Spring-based service by introducing AWS OpenSearch and eliminating legacy API bottlenecks.",
    "Passionate about building reliable systems, with a focus on operational maturity through practices like Testcontainers-based integration testing.",
  ],
  ja: [
    "MAU 750万規模の位置データプラットフォームを設計・運用してきたバックエンドエンジニアです。",
    "100万件のFCM通知を5秒以内に送信するメッセージパイプラインを構築し、空間クエリチューニングで大規模トラフィック環境でのパフォーマンス最適化を経験しました。",
    "現在はJava/SpringベースのサービスでAWS OpenSearch導入とレガシーAPIボトルネック除去により、検索・レスポンス性能を改善しています。",
    "信頼性の高いシステム構築に関心があり、Testcontainersベースの統合テスト導入など運用体制の高度化にも継続的に取り組んでいます。",
  ],
};

interface LangItem {
  flag: string;
  name: string;
  level: string;
  cert?: string;
  note?: string;
}

type SkillGroupId = "languages" | "frameworks" | "infrastructure" | "data";

const languages: Record<Locale, LangItem[]> = {
  ko: [
    { flag: "🇰🇷", name: "한국어", level: "원어민" },
    { flag: "🇯🇵", name: "일본어", level: "상급", cert: "JLPT N2", note: "N1 준비 중" },
    { flag: "🇺🇸", name: "영어", level: "중급" },
  ],
  en: [
    { flag: "🇰🇷", name: "Korean", level: "Native" },
    { flag: "🇯🇵", name: "Japanese", level: "Advanced", cert: "JLPT N2", note: "Preparing for N1" },
    { flag: "🇺🇸", name: "English", level: "Intermediate" },
  ],
  ja: [
    { flag: "🇰🇷", name: "韓国語", level: "ネイティブ" },
    { flag: "🇯🇵", name: "日本語", level: "上級", cert: "JLPT N2", note: "N1 準備中" },
    { flag: "🇺🇸", name: "英語", level: "中級" },
  ],
};

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Hyuntae-91" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/hyuntae-kim-8aa09514b/" },
  { label: "Email", href: "mailto:dev.hyuntae@gmail.com" },
];

const skillGroups: Array<{ id: SkillGroupId; items: string[] }> = [
  { id: "languages", items: ["Python", "Java"] },
  { id: "frameworks", items: ["FastAPI", "Flask", "Spring"] },
  {
    id: "infrastructure",
    items: ["GCP", "AWS", "Jenkins", "Argo", "K6", "RabbitMQ"],
  },
  { id: "data", items: ["MySQL", "MariaDB", "BigQuery", "Redis", "MongoDB"] },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Profile */}
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl text-muted-foreground">
          K
        </div>
        <h1 className="text-2xl font-bold">
          {locale === "ja" ? (
            <span>
              <ruby>金<rp>(</rp><rt>キム</rt><rp>)</rp></ruby>
              <ruby>賢<rp>(</rp><rt>ヒョン</rt><rp>)</rp></ruby>
              <ruby>泰<rp>(</rp><rt>テ</rt><rp>)</rp></ruby>
              {"（"}
              <ruby>ケン<rp>(</rp><rt>Ken</rt><rp>)</rp></ruby>
              {"）"}
            </span>
          ) : (
            "Kim Hyuntae (Ken)"
          )}
        </h1>
        <p className="mt-1 text-muted-foreground">{dict.about.roleSummary}</p>
        <div className="mt-3 space-y-1">
          {bio[locale].map((line, i) => (
            <p
              key={i}
              className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground"
            >
              {line}
            </p>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-blue-50 px-4 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative ml-4 border-l-2 border-border pl-8">
        {timeline.map((item, i) => (
          <div key={i} className="relative mb-10">
            <div className="absolute -left-[41px] top-1.5 h-3 w-3 rounded-full border-2 border-foreground bg-background" />
            <span className="text-xs text-muted-foreground">{item.date}</span>
            <h3 className="mt-1 text-base font-semibold">
              {item.role[locale]}
            </h3>
            <p className="text-sm text-muted-foreground">{item.company}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {item.description[locale]}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-10" />

      {/* Skills */}
      <div>
        <h2 className="mb-6 text-lg font-semibold">{dict.about.skills}</h2>
        <div className="space-y-4">
          {skillGroups.map((group) => (
            <div key={group.id}>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.about.skillGroups[group.id]}
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-10" />

      {/* Languages */}
      <div>
        <h2 className="mb-6 text-lg font-semibold">
          {dict.about.languagesTitle}
        </h2>
        <div className="space-y-3">
          {languages[locale].map((lang) => (
            <div key={lang.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {lang.level}
                </span>
                {lang.cert && (
                  <Badge variant="outline" className="text-xs">
                    {lang.cert}
                  </Badge>
                )}
                {lang.note && (
                  <span className="text-xs text-muted-foreground">
                    ({lang.note})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
