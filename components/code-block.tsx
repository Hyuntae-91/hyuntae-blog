"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  children,
  code,
  ...rest
}: React.ComponentProps<"pre"> & { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-zinc-500/20 bg-zinc-500/10 text-zinc-500 opacity-0 transition-all hover:bg-zinc-500/20 hover:text-zinc-800 group-hover:opacity-100 dark:text-zinc-400 dark:hover:text-zinc-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre {...rest}>{children}</pre>
    </div>
  );
}
