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
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/50 opacity-0 transition-all hover:bg-white/10 hover:text-white/80 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre {...rest}>{children}</pre>
    </div>
  );
}
