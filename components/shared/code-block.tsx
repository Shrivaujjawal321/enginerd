"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { highlightToHtml } from "@/lib/highlighter";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  language: string;
  /** Optional filename shown in the header — e.g. "lib/auth.ts". */
  filename?: string;
};

/**
 * Code block — Shiki-rendered, with a copy button, a language badge, and an
 * optional filename header. Lazily highlights on mount so the initial render
 * isn't blocked on the WASM grammar load.
 */
export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [html, setHtml] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    void highlightToHtml(code, language).then((out) => {
      if (!cancelled) setHtml(out);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can fail in iframes / insecure contexts — quietly noop.
    }
  };

  return (
    <div
      className="my-6 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0d12]"
      style={{ contain: "paint" }}
    >
      <div className="flex h-9 items-center justify-between border-b border-white/[0.05] bg-white/[0.015] px-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-500">
          {filename ?? language}
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
            copied
              ? "text-emerald-300"
              : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      {html ? (
        // shiki output is a self-contained <pre><code>... — already escaped.
        // The shiki theme's bg leaks through; override via CSS.
        <div
          className="shiki-host overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-4 font-mono text-[13.5px] leading-[1.7] text-slate-100">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
