import { readFile } from "node:fs/promises";
import path from "node:path";

// next/og(satori)용 폰트 로더. 제목에 한글/일본어가 들어가므로 로케일에 맞는
// 폰트를 임베드한다. satori는 woff2를 지원하지 않아 woff subset을 사용한다.
// 폰트는 assets/fonts/에 로컬 번들링한다: OG 이미지가 빌드 타임에 정적 생성되는
// 구조에서 외부 CDN(jsdelivr) fetch는 CDN 장애·패키지 변경에 빌드/재생성이
// 흔들리는 비결정 요인이라 제거했다(빌드 결정성 확보가 핵심 이득).
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
