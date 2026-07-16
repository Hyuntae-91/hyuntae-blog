import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// OG 이미지 라우트가 generateStaticParams 없이 매 요청마다 Satori 렌더링을
// 도는 것을 막는다(프로덕션 실측: 동일 URL 2연속 호출도 x-vercel-cache MISS).
// 정적 파라미터가 있어야 빌드 타임에 생성되고 CDN 캐시가 걸린다.
const ogImageRoutes = [
  "app/[locale]/opengraph-image.tsx",
  "app/[locale]/blog/[slug]/opengraph-image.tsx",
];

for (const path of ogImageRoutes) {
  test(`${path} exports generateStaticParams`, () => {
    const source = readFileSync(path, "utf8");
    assert.match(source, /export\s+(async\s+)?function\s+generateStaticParams/);
  });

  // dynamicParams가 기본값(true)이면 존재하지 않는 slug/locale로 OG URL을
  // 무한 생성해 온디맨드 Satori 렌더로 CPU를 계속 태울 수 있다.
  // 미지 params는 렌더 없이 404로 떨어져야 한다.
  test(`${path} exports dynamicParams = false to block unknown params`, () => {
    const source = readFileSync(path, "utf8");
    assert.match(source, /export\s+const\s+dynamicParams\s*=\s*false/);
  });

  // satori는 fonts: []를 받으면 "No fonts are loaded"를 던져 500이 된다(실측).
  // 폰트 로드 실패 시 fonts 키 자체를 생략해야 @vercel/og 기본 폰트로 폴백된다.
  test(`${path} omits the fonts key instead of passing an empty array`, () => {
    const source = readFileSync(path, "utf8");
    // "? [...] : []" 형태의 빈 배열 폴백(크래시 경로)이 코드에 없어야 한다.
    assert.doesNotMatch(source, /\]\s*:\s*\[\]/);
    assert.match(source, /\.\.\.\(fontData\s*\?\s*\{\s*fonts:/);
  });
}

test("lib/og-font.ts does not fetch fonts from an external URL", () => {
  const source = readFileSync("lib/og-font.ts", "utf8");
  assert.doesNotMatch(source, /fetch\(/);
  assert.doesNotMatch(source, /https?:\/\//);
});

test("lib/og-font.ts loads fonts from the local filesystem", () => {
  const source = readFileSync("lib/og-font.ts", "utf8");
  assert.match(source, /readFile/);
  assert.match(source, /node:fs\/promises/);
});
