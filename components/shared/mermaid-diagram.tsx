"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

let initialized = false;
let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;

async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => m.default);
  }
  const mermaid = await mermaidPromise;
  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      securityLevel: "strict",
      fontFamily:
        'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif',
      themeVariables: {
        background: "transparent",
        primaryColor: "rgba(139, 92, 246, 0.18)",
        primaryTextColor: "#f8fafc",
        primaryBorderColor: "rgba(139, 92, 246, 0.6)",
        lineColor: "rgba(148, 163, 184, 0.55)",
        secondaryColor: "rgba(6, 182, 212, 0.18)",
        secondaryBorderColor: "rgba(6, 182, 212, 0.55)",
        secondaryTextColor: "#f8fafc",
        tertiaryColor: "rgba(236, 72, 153, 0.18)",
        tertiaryBorderColor: "rgba(236, 72, 153, 0.55)",
        tertiaryTextColor: "#f8fafc",
        textColor: "#e2e8f0",
        labelTextColor: "#f8fafc",
        nodeBorder: "rgba(139, 92, 246, 0.6)",
        edgeLabelBackground: "rgba(15, 15, 26, 0.85)",
        clusterBkg: "rgba(255, 255, 255, 0.02)",
        clusterBorder: "rgba(255, 255, 255, 0.08)",
        actorBkg: "rgba(139, 92, 246, 0.18)",
        actorBorder: "rgba(139, 92, 246, 0.55)",
        actorTextColor: "#f8fafc",
        signalColor: "#cbd5e1",
        signalTextColor: "#f8fafc",
        labelBoxBkgColor: "rgba(15, 15, 26, 0.85)",
        labelBoxBorderColor: "rgba(255, 255, 255, 0.12)",
        noteBkgColor: "rgba(245, 158, 11, 0.12)",
        noteBorderColor: "rgba(245, 158, 11, 0.4)",
        noteTextColor: "#fef3c7",
      },
      flowchart: { curve: "basis", htmlLabels: true },
      sequence: { actorMargin: 60 },
    });
    initialized = true;
  }
  return mermaid;
}

type Props = {
  source: string;
  className?: string;
};

export function MermaidDiagram({ source, className }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [renderedSvg, setRenderedSvg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setRenderedSvg(null);

    const id = `mmd-${Math.random().toString(36).slice(2, 10)}`;

    loadMermaid()
      .then(async (mermaid) => {
        try {
          const cleaned = source.replace(/^```mermaid\n?|```$/g, "").trim();
          const { svg } = await mermaid.render(id, cleaned);
          if (!cancelled) setRenderedSvg(svg);
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Could not render diagram.",
            );
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Diagram engine failed to load.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  if (error) {
    return (
      <div
        className={cn(
          "rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200",
          className,
        )}
      >
        <p className="font-medium">Diagram could not render</p>
        <p className="mt-1 text-xs text-amber-200/70">{error}</p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.06] bg-black/40 p-3 font-mono text-xs text-slate-200">
          <code>{source}</code>
        </pre>
      </div>
    );
  }

  if (!renderedSvg) {
    return (
      <div
        className={cn(
          "flex min-h-[160px] items-center justify-center rounded-xl border border-white/[0.06] bg-black/30 text-xs text-slate-500",
          className,
        )}
      >
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "mermaid-frame overflow-x-auto rounded-xl border border-white/[0.06] bg-black/20 p-4",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: renderedSvg }}
    />
  );
}
