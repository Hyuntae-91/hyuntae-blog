import test from "node:test";
import assert from "node:assert/strict";
import { extractToc } from "../lib/toc.ts";

test("h2/h3를 추출하고 depth를 기록한다", () => {
  const md = "## 개요\n본문 단락\n### 세부 설계\n## 결과";
  const toc = extractToc(md);
  assert.equal(toc.length, 3);
  assert.deepEqual(
    toc.map((t) => t.depth),
    [2, 3, 2]
  );
  assert.deepEqual(
    toc.map((t) => t.text),
    ["개요", "세부 설계", "결과"]
  );
});

test("h1은 목차에서 제외한다", () => {
  const md = "# 글 제목\n## 본문 섹션";
  const toc = extractToc(md);
  assert.equal(toc.length, 1);
  assert.equal(toc[0].text, "본문 섹션");
});

test("코드 펜스 내부의 ##는 무시한다", () => {
  const md = "## 진짜 제목\n```bash\n## 주석처럼 보이는 줄\n```\n## 진짜 제목 2";
  const toc = extractToc(md);
  assert.equal(toc.length, 2);
  assert.deepEqual(
    toc.map((t) => t.text),
    ["진짜 제목", "진짜 제목 2"]
  );
});

test("heading의 인라인 마크다운을 제거한다", () => {
  const md = "## `OpenSearch` **성능** 튜닝\n### [링크](https://x.com) 참고";
  const toc = extractToc(md);
  assert.equal(toc[0].text, "OpenSearch 성능 튜닝");
  assert.equal(toc[1].text, "링크 참고");
});

test("같은 제목은 고유한 id를 받는다 (github-slugger 일관)", () => {
  const md = "## 설정\n## 설정";
  const toc = extractToc(md);
  assert.notEqual(toc[0].id, toc[1].id);
  assert.equal(toc[0].id, "설정");
  assert.equal(toc[1].id, "설정-1");
});
