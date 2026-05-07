"use client";

import * as React from "react";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { cn } from "@/lib/utils";

export type CodeEditorLanguage =
  | "javascript"
  | "python"
  | "java"
  | "cpp"
  | "go"
  | "rust";

type CodeEditorProps = {
  value: string;
  onChange: (v: string) => void;
  language: CodeEditorLanguage;
  className?: string;
};

/**
 * Returns the CodeMirror language extension for the requested editor language.
 *
 * Per-language packs are dynamically imported so a visitor who picks Python
 * doesn't pay for the C++ / Go / Rust / Java / JS bundles up-front. Saves
 * ~80-120KB gz from the practice route's first paint. Each pack is ~15-30KB
 * gz (Java is the heaviest). The dynamic import is awaited inside the
 * editor mount effect; until it resolves we render with no language pack
 * (the editor is fully usable as plain text in those few hundred ms).
 */
async function languageExtension(
  language: CodeEditorLanguage,
): Promise<Extension> {
  switch (language) {
    case "javascript": {
      const m = await import("@codemirror/lang-javascript");
      return m.javascript({ jsx: false, typescript: false });
    }
    case "python": {
      const m = await import("@codemirror/lang-python");
      return m.python();
    }
    case "java": {
      const m = await import("@codemirror/lang-java");
      return m.java();
    }
    case "cpp": {
      const m = await import("@codemirror/lang-cpp");
      return m.cpp();
    }
    case "go": {
      const m = await import("@codemirror/lang-go");
      return m.go();
    }
    case "rust": {
      const m = await import("@codemirror/lang-rust");
      return m.rust();
    }
    default: {
      // Exhaustiveness check — TypeScript will complain if a case is missed.
      const _exhaustive: never = language;
      void _exhaustive;
      return [];
    }
  }
}

/**
 * CodeMirror 6 editor used by the DSA practice workspace.
 *
 * - Re-creates the EditorView when the language changes (cheaper than
 *   reconfiguring a Compartment for our use case and matches the spec).
 * - Forwards document edits to `onChange` via an `updateListener`.
 * - Uses a ref-guarded internal flag so external `value` updates (e.g. when
 *   the user switches language and the parent resets `code`) don't fight the
 *   editor's own typing.
 */
export function CodeEditor({
  value,
  onChange,
  language,
  className,
}: CodeEditorProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const viewRef = React.useRef<EditorView | null>(null);
  // Latest onChange — read inside CodeMirror's update listener so we never
  // capture a stale closure while the EditorView lives across renders.
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Track the value we last pushed *out* via onChange so we can ignore the
  // round-trip when the parent echoes it back as a new `value` prop.
  const lastEmittedRef = React.useRef(value);

  // Compartment lets us swap the language extension without recreating the
  // EditorView — keeps undo history + cursor position across language picks.
  const langCompartmentRef = React.useRef(new Compartment());

  // Mount the editor ONCE. Language is hot-swapped via the Compartment
  // when it changes (effect below).
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;
      const next = update.state.doc.toString();
      lastEmittedRef.current = next;
      onChangeRef.current(next);
    });

    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      indentUnit.of("  "),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      keymap.of([
        indentWithTab,
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
      ]),
      // Language extension starts empty; the lazy-loaded pack is reconfigured
      // into it once dynamic import resolves.
      langCompartmentRef.current.of([]),
      oneDark,
      EditorView.lineWrapping,
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "13px",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
        ".cm-scroller": {
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          lineHeight: "1.55",
          overflow: "auto",
        },
        ".cm-content": { padding: "12px 0" },
        ".cm-gutters": {
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        },
        "&.cm-focused": { outline: "none" },
      }),
      updateListener,
    ];

    const state = EditorState.create({ doc: value, extensions });
    const view = new EditorView({ state, parent: host });
    viewRef.current = view;
    lastEmittedRef.current = value;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Mount-only — value/language sync is handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hot-swap the language extension when `language` changes. Dynamic import
  // means there's a brief moment where the editor renders without a
  // language pack — fully usable as plain text in that window.
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ext = await languageExtension(language);
      if (cancelled) return;
      const view = viewRef.current;
      if (!view) return;
      view.dispatch({
        effects: langCompartmentRef.current.reconfigure(ext),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  // Sync external `value` changes (e.g. parent reset on language switch) into
  // the editor — but skip when the change is just our own emission echoing
  // back, otherwise the cursor would jump to the end on every keystroke.
  React.useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (value === lastEmittedRef.current) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
    lastEmittedRef.current = value;
  }, [value]);

  return (
    <div
      ref={hostRef}
      aria-label="Code editor"
      className={cn(
        "block w-full overflow-hidden bg-black/40 text-slate-100",
        // Mobile-friendly height that grows on desktop.
        "h-72 sm:h-80",
        className,
      )}
    />
  );
}
