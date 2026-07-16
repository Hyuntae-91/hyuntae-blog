import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// 방문(봇 포함)마다 MDX+Shiki 풀 재컴파일을 트리거하던 60초 ISR을 24시간
// 안전밸브로 늘렸는지 회귀 검증한다. 조회수는 클라이언트가 /api/views/[slug]를
// 직접 fetch하므로(view-counter.tsx) ISR 주기와 무관하고, 본문은 배포 시에만
// 바뀐다 — 60초 주기는 Vercel Fluid Active CPU를 방문당 태우던 원인이었다.
const DAY_IN_SECONDS = 86400;

const targets = [
  "app/[locale]/blog/[slug]/page.tsx",
  "app/[locale]/life/[category]/[slug]/page.tsx",
  "app/[locale]/life/page.tsx",
];

for (const path of targets) {
  test(`${path} does not use a 60-second ISR revalidate`, () => {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, /revalidate\s*=\s*60\b/);
  });

  test(`${path} declares the ${DAY_IN_SECONDS}s safety-valve revalidate`, () => {
    const source = readFileSync(path, "utf8");
    assert.match(
      source,
      new RegExp(`revalidate\\s*=\\s*${DAY_IN_SECONDS}\\b`)
    );
  });
}
