import * as React from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * MermaidDiagram and CodeBlock are heavy client-only islands (mermaid ≈ 500KB
 * gzipped, shiki WASM grammars). Load them lazily so they only ship when the
 * markdown actually contains a fenced block. The rest of the renderer
 * (headings, lists, tables, paragraphs, links) stays server-rendered.
 *
 * NOTE: `ssr: false` is intentionally omitted — both islands are already
 * marked `"use client"` and self-handle SSR safety (mermaid renders inside
 * useEffect, shiki highlights in useEffect with a <pre> placeholder). This
 * keeps the renderer importable from RSC trees without violating Next 16's
 * rule that `ssr: false` only works inside Client Components.
 */
const MermaidDiagram = dynamic(
  () => import("./mermaid-diagram").then((m) => m.MermaidDiagram),
  { loading: () => <DiagramSkeleton /> },
);

const CodeBlock = dynamic(
  () => import("./code-block").then((m) => m.CodeBlock),
  { loading: () => <CodeBlockSkeleton /> },
);

function DiagramSkeleton() {
  return (
    <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-white/[0.06] bg-black/30 text-xs text-slate-500">
      Rendering diagram…
    </div>
  );
}

function CodeBlockSkeleton() {
  return (
    <div
      className="my-6 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0d0d12]"
      style={{ contain: "paint" }}
    >
      <div className="flex h-9 items-center justify-between border-b border-white/[0.05] bg-white/[0.015] px-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-500">
          code
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13.5px] leading-[1.7] text-slate-100">
        <code> </code>
      </pre>
    </div>
  );
}

/**
 * Convert "Some Heading: Title" → "some-heading-title". Stable across
 * renders so the on-page ToC's IntersectionObserver hooks work reliably.
 */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}\s-]+/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props.children);
  }
  return "";
}

type Props = {
  source: string;
  className?: string;
};

export function MarkdownRenderer({ source, className }: Props) {
  return (
    <div
      className={cn(
        // Phase 5 reading typography — 17px / 1.75 line-height for comfortable
        // long-form reading. Wrapping is handled by the parent <article>.
        "markdown-body text-[17px] leading-[1.75] text-slate-300",
        "[&>*+*]:mt-5 [&>h2+*]:mt-3 [&>h3+*]:mt-2",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const id = slugifyHeading(extractText(children));
            return (
              <h1
                id={id}
                className="mt-8 mb-4 scroll-mt-24 text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-slate-50"
              >
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = slugifyHeading(extractText(children));
            return (
              <h2
                id={id}
                className="mt-12 mb-4 scroll-mt-24 border-b border-white/[0.06] pb-2 text-[26px] font-semibold leading-[1.2] tracking-[-0.015em] text-slate-50"
              >
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = slugifyHeading(extractText(children));
            return (
              <h3
                id={id}
                className="mt-8 mb-2 scroll-mt-24 text-[20px] font-semibold tracking-[-0.01em] text-slate-100"
              >
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="mt-6 mb-2 text-[15px] font-semibold text-slate-200">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="mt-4 mb-2 text-sm font-semibold text-slate-200">
              {children}
            </h5>
          ),
          p: ({ children }) => (
            <p className="text-[17px] leading-[1.75] text-slate-300">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-50">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-100">{children}</em>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-violet-300 underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="ml-6 list-disc space-y-1.5 text-slate-200 marker:text-slate-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-6 list-decimal space-y-1.5 text-slate-200 marker:text-slate-500">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-violet-500/40 bg-violet-500/[0.04] py-2 pl-4 italic text-slate-300">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-white/[0.06]" />,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full border-collapse text-[14.5px] [&_tbody_tr:nth-child(odd)]:bg-white/[0.015]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="sticky top-0 bg-white/[0.04] backdrop-blur-sm">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-white/[0.08] px-3.5 py-2.5 text-left text-[13px] font-semibold uppercase tracking-wider text-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-white/[0.04] px-3.5 py-2.5 align-top text-slate-300">
              {children}
            </td>
          ),
          code: ({ className: codeClass, children, ...rest }) => {
            const match = /language-(\w+)/.exec(codeClass || "");
            const language = match?.[1];
            const text = String(children ?? "").replace(/\n$/, "");
            const isBlock =
              (rest as { node?: { position?: { start: { line: number; column: number }; end: { line: number; column: number } } } }).node
                ?.position
                ? text.includes("\n") || Boolean(language)
                : false;
            // react-markdown 10: code is always inline; pre wraps multi-line.
            // We detect block via parent <pre>. So treat anything with className as block-like fallback.
            if (!language && !text.includes("\n")) {
              return (
                <code className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[13px] text-cyan-200">
                  {children}
                </code>
              );
            }
            void isBlock;
            return (
              <code className={codeClass}>{children}</code>
            );
          },
          pre: ({ children }) => {
            const codeEl = React.Children.toArray(children).find(
              (c): c is React.ReactElement<{
                className?: string;
                children?: React.ReactNode;
              }> =>
                React.isValidElement(c) &&
                (c.type === "code" ||
                  Boolean((c.props as { node?: unknown }).node)),
            );
            const codeProps =
              (codeEl?.props as {
                className?: string;
                children?: React.ReactNode;
              }) || {};
            const className = codeProps.className || "";
            const match = /language-(\w+)/.exec(className);
            const language = (match?.[1] ?? "text").toLowerCase();
            const snippet = String(codeProps.children ?? "").replace(/\n$/, "");

            if (language === "mermaid") {
              return (
                <div className="my-6">
                  <MermaidDiagram source={snippet} />
                </div>
              );
            }

            return <CodeBlock code={snippet} language={language} />;
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
