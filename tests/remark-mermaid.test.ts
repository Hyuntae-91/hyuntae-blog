import test from "node:test";
import assert from "node:assert/strict";
import { remarkMermaid } from "../lib/remark-mermaid.ts";

function makeTree(children: unknown[]) {
  return { type: "root", children } as never;
}

test("mermaid 코드블록을 Mermaid JSX 노드로 변환한다", () => {
  const tree = makeTree([
    { type: "code", lang: "mermaid", value: "graph TD; A-->B;" },
  ]);
  remarkMermaid()(tree);

  const node = (tree as { children: Record<string, unknown>[] }).children[0];
  assert.equal(node.type, "mdxJsxFlowElement");
  assert.equal(node.name, "Mermaid");
  const attrs = node.attributes as { name: string; value: string }[];
  assert.equal(attrs[0].name, "chart");
  assert.equal(attrs[0].value, "graph TD; A-->B;");
});

test("mermaid가 아닌 코드블록은 그대로 둔다", () => {
  const tree = makeTree([{ type: "code", lang: "java", value: "int x = 1;" }]);
  remarkMermaid()(tree);

  const node = (tree as { children: Record<string, unknown>[] }).children[0];
  assert.equal(node.type, "code");
  assert.equal(node.lang, "java");
});

test("lang이 없는 코드블록도 그대로 둔다", () => {
  const tree = makeTree([{ type: "code", lang: null, value: "plain" }]);
  remarkMermaid()(tree);

  const node = (tree as { children: Record<string, unknown>[] }).children[0];
  assert.equal(node.type, "code");
});
