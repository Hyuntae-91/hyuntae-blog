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
  pre: ({ children, ...rest }) => {
    if (React.isValidElement(children)) {
      const codeProps = children.props as Record<string, unknown>;
      const className = (codeProps.className as string) ?? "";

      // Mermaid blocks
      if (className.includes("language-mermaid")) {
        const code = (codeProps.children as string) ?? "";
        return <Mermaid chart={code} />;
      }

      // Regular code blocks with copy button
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
