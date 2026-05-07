"use client";

/**
 * FormatMindmap — folds a subject's H1/H2/H3 hierarchy into a Mermaid mindmap.
 *
 * Why this matters: visual learners get the shape of a subject at a glance —
 * what the major branches are, how deep each goes — before committing to
 * read 1500 lines of prose. The same MermaidDiagram client island that
 * already renders in-content `mermaid` fences powers this view, so we ship
 * no new WASM.
 */

import * as React from "react";
import dynamic from "next/dynamic";
import { Network } from "lucide-react";

import { GlassCard } from "@/components/shared/glass-card";
import {
  parseMindmap,
  mindmapToMermaid,
  type MindmapNode,
} from "@/lib/format-parsers";

// Lazy-load the same mermaid renderer used by MarkdownRenderer — first paint
// of the mindmap warms the same WASM cache the user would hit on a Read view
// containing a `mermaid` fence.
const MermaidDiagram = dynamic(
  () => import("@/components/shared/mermaid-diagram").then((m) => m.MermaidDiagram),
  {
    loading: () => (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-white/[0.06] bg-black/30 text-xs text-slate-400">
        Drawing mindmap…
      </div>
    ),
  },
);

type Props = {
  source: string;
  fallbackTitle: string;
};

function totalNodes(node: MindmapNode): number {
  return 1 + node.children.reduce((sum, c) => sum + totalNodes(c), 0);
}

export function FormatMindmap({ source, fallbackTitle }: Props) {
  const tree = React.useMemo(
    () => parseMindmap(source, fallbackTitle),
    [source, fallbackTitle],
  );
  const mermaidSource = React.useMemo(() => mindmapToMermaid(tree), [tree]);
  const nodeCount = React.useMemo(() => totalNodes(tree), [tree]);

  if (tree.children.length === 0) {
    return (
      <GlassCard className="p-6 text-sm text-slate-300">
        A mindmap needs <code>## Sections</code> in the source. This subject
        only has the title — switch to <strong>Read</strong>.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-violet-200">
          <Network className="h-3 w-3" />
          Mindmap · {nodeCount} nodes · {tree.children.length} branches
        </p>
        <p className="hidden text-xs text-slate-400 sm:block">
          Pinch / scroll to zoom — branches are the H2s in this subject.
        </p>
      </header>
      <GlassCard className="overflow-x-auto p-4 sm:p-6">
        <MermaidDiagram source={mermaidSource} />
      </GlassCard>
    </div>
  );
}
