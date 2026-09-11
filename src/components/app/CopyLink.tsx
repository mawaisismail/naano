"use client";

import { useState } from "react";

export function CopyLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/r/${code}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard can be blocked; the link is visible either way
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy tracked link"
      className="group flex items-center gap-2 rounded-lg border border-line bg-surface/60 px-3 py-1.5 font-mono text-xs text-muted transition hover:border-brand hover:text-brand"
    >
      /r/{code}
      <span className="text-[10px] font-sans font-semibold uppercase tracking-wide">
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
}
