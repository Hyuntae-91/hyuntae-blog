// next/og(satori)용 폰트 로더. 제목에 한글/일본어가 들어가므로 로케일에 맞는
// 폰트를 임베드한다. satori는 woff2를 지원하지 않아 woff subset을 사용한다.
const FONT_URL: Record<string, string> = {
  ja: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.1.0/files/noto-sans-jp-japanese-700-normal.woff",
  ko: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.1.0/files/noto-sans-kr-korean-700-normal.woff",
};

export async function loadOgFont(locale: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(FONT_URL[locale] ?? FONT_URL.ko);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}
