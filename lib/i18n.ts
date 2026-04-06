import "server-only";

export {
  defaultLocale,
  getLocaleFromCountry,
  hasLocale,
  locales,
  type Locale,
} from "./locale-helpers";

const dictionaries = {
  ko: () => import("@/messages/ko.json").then((m) => m.default),
  en: () => import("@/messages/en.json").then((m) => m.default),
  ja: () => import("@/messages/ja.json").then((m) => m.default),
};

type DictionaryLocale = keyof typeof dictionaries;

export const getDictionary = async (locale: DictionaryLocale) =>
  dictionaries[locale]();
