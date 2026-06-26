import GithubSlugger from "github-slugger";

export interface TocItem {
  depth: 2 | 3;
  text: string;
  id: string;
}

// heading 텍스트에서 인라인 마크다운을 제거해 표시용 텍스트로 정규화한다.
// rehype-slug도 렌더된 텍스트 노드 기반으로 slug를 만들므로, 같은 텍스트를
// github-slugger에 통과시키면 본문 heading id와 동일한 앵커가 나온다.
function stripInlineMarkdown(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // [text](url) -> text
    .replace(/[*_`~]/g, "") // 강조·코드·취소선 마커
    .trim();
}

/**
 * raw 마크다운에서 h2/h3 목차를 추출한다.
 * - 코드 펜스(```) 내부의 `##` 는 무시한다.
 * - h1(#)은 글 제목용이라 목차에서 제외한다.
 * - id는 github-slugger로 생성해 rehype-slug가 부여하는 heading id와 일치시킨다.
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inCodeBlock = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length as 2 | 3;
    const text = stripInlineMarkdown(match[2]);
    if (!text) continue;

    items.push({ depth, text, id: slugger.slug(text) });
  }

  return items;
}
