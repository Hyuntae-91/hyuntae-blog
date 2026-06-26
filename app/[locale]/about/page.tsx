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
      ko: "AWS OpenSearch 도입으로 570만 건 통합 검색 구현(평균 135ms·p95 312ms·성공률 99.7%), Datadog APM으로 N+1 병목을 특정해 응답 6초→100ms 개선, Testcontainers 통합테스트 도입",
      en: "Unified search over 5.7M records on AWS OpenSearch (135ms avg, 312ms p95, 99.7% success). Traced an N+1 bottleneck with Datadog APM and cut response time from 6s to under 100ms. Adopted Testcontainers for integration testing.",
      ja: "AWS OpenSearch導入で570万件の統合検索を実現(平均135ms・p95 312ms・成功率99.7%)。Datadog APMでN+1ボトルネックを特定し、レスポンスを6秒→100ms以内に改善。Testcontainersで統合テストを導入。",
    },
    tags: ["Java", "Spring", "OpenSearch", "Datadog", "Testcontainers"],
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
      ko: "MAU 900만 오프라인 위치 플랫폼 백엔드 설계·운영. Pub/Sub·Cloud Functions로 FCM 100만 건을 5초 내 전송(전달 성공률 98%↑), 공간 인덱스 튜닝으로 100ms 내 위치 조회(iOS 100만 MAU 마케팅 전환), LGU+ WPS 측위 정확도 32.3m→19.9m 개선",
      en: "Designed and ran the backend for a 9M-MAU offline location platform. Built a Pub/Sub + Cloud Functions pipeline delivering 1M FCM notifications in under 5 seconds (98%+ delivery), tuned spatial indexes for sub-100ms location lookups (powering a 1M-MAU iOS campaign), and improved LGU+ WPS positioning accuracy from 32.3m to 19.9m.",
      ja: "MAU 900万のオフライン位置プラットフォームのバックエンドを設計・運用。Pub/Sub・Cloud FunctionsでFCM 100万件を5秒以内に送信(配信成功率98%以上)、空間インデックスのチューニングで位置取得を100ms以内に短縮(iOS 100万MAUのマーケティング施策を実現)、LGU+ WPSの測位精度を32.3m→19.9mに改善。",
    },
    tags: ["Python", "FastAPI", "GCP", "Pub/Sub", "BigQuery"],
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
    "MAU 900만 오프라인 위치 플랫폼(loplat)에서 4년간, 측정→가설→검증 루프로 병목을 지표로 잡아온 백엔드 엔지니어입니다.",
    "FCM 100만 건을 5초 내 전송하는 파이프라인을 구축하고, N+1 병목을 응답 6초→100ms로 개선하는 등 대규모 트래픽 환경에서 성능을 최적화해 왔습니다.",
    "현재는 Java/Spring 기반 서비스에서 AWS OpenSearch 도입과 레거시 API 병목 제거로 검색·응답 성능을 개선하고 있습니다.",
    "테스트 가능한 구조로 변경 비용을 낮추는 데 관심이 많고, Testcontainers 통합테스트 도입 등 운영 체계 고도화에 꾸준히 투자합니다.",
  ],
  en: [
    "Backend engineer who spent four years at a 9M-MAU offline location platform (loplat), chasing down bottlenecks with a measure-hypothesize-verify loop.",
    "Built a pipeline that delivers 1M FCM notifications in under 5 seconds and cut an N+1 bottleneck from 6s to under 100ms — performance work that held up under heavy traffic.",
    "These days I work on a Java/Spring service, sharpening search and response times by adopting AWS OpenSearch and clearing out legacy API bottlenecks.",
    "I care about making systems cheap to change and worth trusting, and I keep investing in operational maturity — like bringing in Testcontainers for integration tests.",
  ],
  ja: [
    "MAU 900万のオフライン位置プラットフォーム(loplat)で4年間、計測→仮説→検証のループでボトルネックを数値で捉えてきたバックエンドエンジニアです。",
    "FCM 100万件を5秒以内に送信するパイプラインを構築し、N+1ボトルネックをレスポンス6秒→100ms以内に改善するなど、大規模トラフィック環境で性能を最適化してきました。",
    "現在はJava/SpringベースのサービスでAWS OpenSearchの導入とレガシーAPIのボトルネック除去により、検索・レスポンス性能を改善しています。",
    "テスト可能な構造で変更コストを下げることに関心があり、Testcontainersによる統合テスト導入など運用体制の高度化に継続的に取り組んでいます。",
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
