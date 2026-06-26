import { Mermaid } from "./mermaid";
import { CodeBlock } from "./code-block";
import type { MDXComponents } from "mdx/types";
import React from "react";

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as Record<string, unknown>;
    return extractText(props.children as React.ReactNode);
  }
  return "";
}

export const mdxComponents: MDXComponents = {
  // mermaid는 remark 단계(remarkMermaid)에서 <Mermaid>로 미리 분리되므로
  // 여기서는 Shiki가 토큰화한 일반 코드블록만 다룬다. children(=code 엘리먼트)을
  // 텍스트로 펼쳐 복사 버튼용 raw 코드를 만든다.
  pre: ({ children, ...rest }) => {
    if (React.isValidElement(children)) {
      const codeProps = children.props as Record<string, unknown>;
      const code = extractText(codeProps.children as React.ReactNode);
      return (
        <CodeBlock code={code} {...rest}>
          {children}
        </CodeBlock>
      );
    }

    return <pre {...rest}>{children}</pre>;
  },
  Mermaid,
};
