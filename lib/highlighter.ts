/**
 * Lazy singleton Shiki highlighter — instantiated once per process and
 * reused across every code-block render. Loads only the languages we
 * actually use in EngiNerd content (SQL is the most common, then JS,
 * Python, TS, JSON, bash, DAX for Power BI, M for Power Query).
 */

import {
  type HighlighterCore,
  createHighlighterCore,
} from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

let cached: Promise<HighlighterCore> | null = null;

const LANGS = {
  sql: () => import("shiki/langs/sql.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  js: () => import("shiki/langs/javascript.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  ts: () => import("shiki/langs/typescript.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  py: () => import("shiki/langs/python.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  bash: () => import("shiki/langs/bash.mjs"),
  shell: () => import("shiki/langs/shellscript.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
  yml: () => import("shiki/langs/yaml.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  md: () => import("shiki/langs/markdown.mjs"),
  dax: () => import("shiki/langs/dax.mjs"),
  // Power Query M lang ID is "m" in shiki
  m: () => import("shiki/langs/powerquery.mjs"),
  powerquery: () => import("shiki/langs/powerquery.mjs"),
} as const;

export type SupportedLang = keyof typeof LANGS;

const INITIAL_LOAD: SupportedLang[] = [
  "sql",
  "javascript",
  "python",
  "typescript",
  "json",
  "bash",
];

async function buildHighlighter(): Promise<HighlighterCore> {
  const langs = await Promise.all(
    INITIAL_LOAD.map(async (id) => (await LANGS[id]()).default),
  );
  const dark = (await import("shiki/themes/one-dark-pro.mjs")).default;
  return createHighlighterCore({
    themes: [dark],
    langs,
    engine: createOnigurumaEngine(import("shiki/wasm")),
  });
}

export function getHighlighter(): Promise<HighlighterCore> {
  if (!cached) cached = buildHighlighter();
  return cached;
}

/** Lazy-load an additional language not in the initial bundle. */
export async function ensureLanguage(lang: string): Promise<boolean> {
  const id = lang.toLowerCase() as SupportedLang;
  if (!(id in LANGS)) return false;
  const hi = await getHighlighter();
  if (hi.getLoadedLanguages().includes(id)) return true;
  try {
    const mod = await LANGS[id]();
    await hi.loadLanguage(mod.default);
    return true;
  } catch (err) {
    console.error("[shiki] language load failed", id, err);
    return false;
  }
}

/** Convert source code to themed HTML. Returns null on unsupported language. */
export async function highlightToHtml(
  code: string,
  lang: string,
): Promise<string | null> {
  const ok = await ensureLanguage(lang);
  if (!ok) return null;
  const hi = await getHighlighter();
  return hi.codeToHtml(code, {
    lang: lang.toLowerCase(),
    theme: "one-dark-pro",
  });
}
