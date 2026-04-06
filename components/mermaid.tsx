"use client";

import { useEffect, useState } from "react";
import { Code, Image as ImageIcon } from "lucide-react";
import mermaid from "mermaid";
import { useTheme } from "@/components/theme-provider";

export function Mermaid({ chart }: { chart: string }) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [showSource, setShowSource] = useState(false);
  const trimmedChart = chart.trim();

  useEffect(() => {
    if (!trimmedChart) return;

    let cancelled = false;
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;

    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    });

    mermaid
      .render(id, trimmedChart)
      .then(({ svg: renderedSvg }) => {
        if (!cancelled) {
          setError("");
          setSvg(renderedSvg);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedTheme, trimmedChart]);

  if (!trimmedChart || error) return null;

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setShowSource(!showSource)}
        aria-label={showSource ? "Show diagram" : "Show source"}
        className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-xs text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100"
      >
        {showSource ? (
          <>
            <ImageIcon className="h-3.5 w-3.5" />
            Diagram
          </>
        ) : (
          <>
            <Code className="h-3.5 w-3.5" />
            Source
          </>
        )}
      </button>

      {showSource ? (
        <pre className="!m-0 overflow-x-auto rounded-lg border-0 bg-[#1e1e2e] p-5 text-sm leading-relaxed text-[#cdd6f4]">
          <code>{trimmedChart}</code>
        </pre>
      ) : (
        <div
          className="flex justify-center overflow-x-auto p-4 [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}
