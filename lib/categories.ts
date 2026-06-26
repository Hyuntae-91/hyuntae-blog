import type { Locale } from "./locale-helpers";

// 글의 큰 갈래. dev = 개발(포트폴리오), life = 취미(여행·음악·문학·경제).
// 포트폴리오 신호를 흐리지 않도록 두 그룹은 콘텐츠 트리·목록·RSS까지 분리한다.
export type CategoryGroup = "dev" | "life";

export interface Category {
  id: string;
  group: CategoryGroup;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
  // lucide-react 아이콘 이름. 취미 허브 카드에서 사용한다.
  icon: string;
}

// 취미 영역(/life)의 카테고리 정의. 라벨/설명/아이콘의 single source of truth.
export const LIFE_CATEGORIES: Category[] = [
  {
    id: "travel",
    group: "life",
    label: { ko: "여행", en: "Travel", ja: "旅行" },
    description: {
      ko: "다녀온 곳과 그 사이의 기록",
      en: "Places I've been and the notes in between",
      ja: "訪れた場所と、その間の記録",
    },
    icon: "Plane",
  },
  {
    id: "music",
    group: "life",
    label: { ko: "음악", en: "Music", ja: "音楽" },
    description: {
      ko: "작곡·작사·일렉기타",
      en: "Composing, songwriting, and electric guitar",
      ja: "作曲・作詞・エレキギター",
    },
    icon: "Guitar",
  },
  {
    id: "literature",
    group: "life",
    label: { ko: "문학", en: "Books", ja: "文学" },
    description: {
      ko: "읽은 책과 문학 이야기",
      en: "Books I've read and what stayed with me",
      ja: "読んだ本と文学の話",
    },
    icon: "BookOpen",
  },
  {
    id: "economy",
    group: "life",
    label: { ko: "경제", en: "Economy", ja: "経済" },
    description: {
      ko: "경제와 투자에 대한 기록",
      en: "Notes on the economy and investing",
      ja: "経済と投資に関する記録",
    },
    icon: "TrendingUp",
  },
];

export const LIFE_CATEGORY_IDS: string[] = LIFE_CATEGORIES.map((c) => c.id);

export function getCategory(id: string): Category | undefined {
  return LIFE_CATEGORIES.find((category) => category.id === id);
}

export function isLifeCategory(id: string): boolean {
  return LIFE_CATEGORIES.some((category) => category.id === id);
}

// 카테고리 라벨을 로케일에 맞게 반환한다. 정의에 없는 id는 원본 문자열로 폴백한다.
export function getCategoryLabel(id: string, locale: Locale): string {
  return getCategory(id)?.label[locale] ?? id;
}
