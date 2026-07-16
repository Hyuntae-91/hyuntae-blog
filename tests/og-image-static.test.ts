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
