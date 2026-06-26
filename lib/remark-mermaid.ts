import { visit } from "unist-util-visit";

// mdast 노드의 최소 형태. mdxJsxFlowElement는 mdast-util-mdx-jsx가
// 제공하지만 transitive 의존성이라 직접 타입을 명시하지 않고 좁게 정의한다.
interface MdastNode {
  type: string;
  lang?: string | null;
  value?: string;
  children?: MdastNode[];
  [key: string]: unknown;
}

/**
 * ```mermaid 코드 펜스를 <Mermaid chart="..." /> JSX 노드로 변환한다.
 *
 * rehype(Shiki) 하이라이팅 단계 *전에* mermaid 블록을 빼내어, Shiki가
 * 다이어그램 소스를 일반 코드로 토큰화해 버리는 충돌을 원천 차단한다.
 * 변환 후 <Mermaid>는 mdxComponents.Mermaid 매핑으로 렌더된다.
 */
export function remarkMermaid() {
  return (tree: MdastNode) => {
    visit(
      tree as never,
      "code",
      (node: MdastNode, index: number | undefined, parent: MdastNode | undefined) => {
        if (node.lang !== "mermaid" || !parent || index == null) return;
        parent.children![index] = {
          type: "mdxJsxFlowElement",
          name: "Mermaid",
          attributes: [
            { type: "mdxJsxAttribute", name: "chart", value: node.value ?? "" },
          ],
          children: [],
        } as MdastNode;
      }
    );
  };
}
