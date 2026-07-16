import { readFile } from "node:fs/promises";
import path from "node:path";

// next/og(satori)용 폰트 로더. 제목에 한글/일본어가 들어가므로 로케일에 맞는
// 폰트를 임베드한다. satori는 woff2를 지원하지 않아 woff subset을 사용한다.
// assets/fonts/에 로컬 번들링(원래는 매 요청마다 jsdelivr CDN에서 fetch했으나,
// OG 라우트가 정적 생성되지 않아 매 요청마다 네트워크 왕복이 발생해 제거함).
const FONT_PATH: Record<string, string> = {
  ja: "assets/fonts/noto-sans-jp-japanese-700-normal.woff",
  ko: "assets/fonts/noto-sans-kr-korean-700-normal.woff",
};

export async function loadOgFont(locale: string): Promise<Buffer | null> {
  try {
    const relativePath = FONT_PATH[locale] ?? FONT_PATH.ko;
    return await readFile(path.join(process.cwd(), relativePath));
  } catch {
    return null;
  }
}
