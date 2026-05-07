import "server-only";

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * Server-side code execution — Python, Java, C++, Go, TypeScript, etc.
 *
 * Strategy: wrap the user's code with a tiny stdin/stdout harness, ship it
 * to Piston, pipe each test's args as a JSON line on stdin, parse the
 * stdout (also JSON) back into a value, deep-equal compare to expected.
 *
 * Why Piston: open-source, supports 50+ languages, has both a public API
 * (free, ~5 req/sec) and a self-hostable Docker image (no rate limit).
 * Same API for both — flip PISTON_URL to switch.
 */

export type SupportedLang =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "c"
  | "go"
  | "rust";

const PISTON_LANG: Record<SupportedLang, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  // Piston ships C++ via the `gcc` runtime; the API accepts "c++" as the
  // runtime identifier. File extension picks the toolchain (.c vs .cpp).
  cpp: "c++",
  c: "c",
  go: "go",
  rust: "rust",
};

const PISTON_VERSION: Record<SupportedLang, string> = {
  javascript: "*",
  typescript: "*",
  python: "*",
  java: "*",
  cpp: "*",
  c: "*",
  go: "*",
  rust: "*",
};

/** Map a Piston filename per language so the engine picks the right toolchain. */
const PISTON_FILENAME: Record<SupportedLang, string> = {
  javascript: "main.js",
  typescript: "main.ts",
  python: "main.py",
  java: "Main.java",
  cpp: "main.cpp",
  c: "main.c",
  go: "main.go",
  rust: "main.rs",
};

export type ExecutionTest = {
  args: unknown[];
  expected: unknown;
  label?: string;
};

export type ExecutionCaseResult = {
  index: number;
  label: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  stdout: string;
  stderr: string;
  error?: string;
  durationMs: number;
};

export type ExecutionOutcome =
  | { kind: "ok"; cases: ExecutionCaseResult[]; language: SupportedLang }
  | { kind: "compile-error"; message: string; language: SupportedLang }
  | { kind: "unsupported-language"; language: string }
  | { kind: "runner-error"; message: string };

/* ---------- Per-language harness templates ----------------------------- */

/**
 * Each harness wraps user code so that the program:
 *   1. Reads ALL of stdin as one JSON array — `[args, args, ...]` (one entry per test).
 *   2. For each test entry, calls `<fnName>(...args)`.
 *   3. Prints one JSON line per test on stdout.
 *
 * Errors caught per-test are emitted as `{"__err": "msg"}` so the server can
 * mark that single case as failed without aborting the whole batch.
 *
 * This is much faster than 1-Piston-call-per-test (Piston cold-start =
 * ~1s for Python, ~3s for Java) — we batch every test into a single execution.
 */

/**
 * camelCase → snake_case. Python starter code in EngiNerd uses snake_case
 * (PEP 8) even when the canonical fnName is camelCase — so the harness has
 * to try both forms before giving up.
 */
function camelToSnake(s: string): string {
  return s.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}

function pythonHarness(userCode: string, fnName: string): string {
  const snakeName = camelToSnake(fnName);
  // We resolve the target callable inside the user's namespace at runtime,
  // trying camelCase → snake_case → any callable starting with the prefix.
  return `${userCode}

# ---- auto-grader harness — do not modify -----------------------------
import sys, json
_locals = {**globals()}
_target = _locals.get(${JSON.stringify(fnName)}) or _locals.get(${JSON.stringify(snakeName)})
if _target is None:
    print(json.dumps({"__err": "Function ${fnName} (or ${snakeName}) is not defined."}))
    sys.exit(0)

try:
    _all_args = json.loads(sys.stdin.read())
except Exception as _e:
    print(json.dumps({"__err": "stdin parse: " + str(_e)}))
    sys.exit(0)

for _args in _all_args:
    try:
        _r = _target(*_args)
        print(json.dumps(_r, default=str))
    except Exception as _e:
        print(json.dumps({"__err": str(_e)}))
`;
}

function javascriptHarness(userCode: string, fnName: string): string {
  return `${userCode}

// ---- auto-grader harness — do not modify ----------------------------
const _data = require("fs").readFileSync(0, "utf8");
let _all;
try { _all = JSON.parse(_data); } catch (e) {
  console.log(JSON.stringify({ __err: "stdin parse: " + e.message }));
  process.exit(0);
}
for (const _args of _all) {
  try {
    const _r = ${fnName}.apply(null, _args);
    console.log(JSON.stringify(_r ?? null));
  } catch (e) {
    console.log(JSON.stringify({ __err: e.message || String(e) }));
  }
}
`;
}

function typescriptHarness(userCode: string, fnName: string): string {
  return `${userCode}

// ---- auto-grader harness — do not modify ----------------------------
import * as fs from "fs";
const _data: string = fs.readFileSync(0, "utf8");
let _all: unknown[];
try { _all = JSON.parse(_data); } catch (e) {
  console.log(JSON.stringify({ __err: "stdin parse: " + (e as Error).message }));
  process.exit(0);
}
for (const _args of _all as unknown[][]) {
  try {
    const _r = (${fnName} as (...a: unknown[]) => unknown).apply(null, _args);
    console.log(JSON.stringify(_r ?? null));
  } catch (e) {
    console.log(JSON.stringify({ __err: (e as Error).message || String(e) }));
  }
}
`;
}

function goHarness(userCode: string, fnName: string): string {
  // Go is harder: no `apply`. We require the user's function to accept
  // `[]interface{}` and we deserialize args generically. A real solution
  // would generate per-problem Go wrappers; for now we accept that Go
  // problems must be authored with a fixed signature.
  return `${userCode}

// ---- auto-grader harness — do not modify ----------------------------
package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
)

func mainEntry() {
	reader := bufio.NewReader(os.Stdin)
	data, _ := bufio.NewReader(reader).ReadString(byte(0))
	var allArgs [][]interface{}
	if err := json.Unmarshal([]byte(data), &allArgs); err != nil {
		fmt.Println(map[string]string{"__err": "stdin parse: " + err.Error()})
		return
	}
	for _, args := range allArgs {
		out, err := callUserFn(${fnName}, args)
		if err != nil {
			b, _ := json.Marshal(map[string]string{"__err": err.Error()})
			fmt.Println(string(b))
			continue
		}
		b, _ := json.Marshal(out)
		fmt.Println(string(b))
	}
}

// init-time entry — Piston runs main()
func init() { mainEntry() }
`;
}

function javaHarness(userCode: string, fnName: string): string {
  // Java has no JSON in stdlib, and Piston ships no Maven. So we embed a
  // minimal hand-written JSON parser/serializer (handles numbers, strings,
  // booleans, null, arrays, nested arrays, objects) — enough for our test
  // shapes. ~120 LOC, zero dependencies.
  return `import java.util.*;
import java.io.*;

public class Main {
  ${userCode}

  public static void main(String[] args) throws Exception {
    StringBuilder buf = new StringBuilder();
    int c;
    while ((c = System.in.read()) != -1) buf.append((char) c);
    String stdin = buf.toString();
    Object parsed = JSON.parse(stdin);
    @SuppressWarnings("unchecked")
    List<Object> allArgs = (List<Object>) parsed;
    Main impl = new Main();
    for (Object aRaw : allArgs) {
      @SuppressWarnings("unchecked")
      List<Object> argList = (List<Object>) aRaw;
      try {
        Object r = impl.${fnName}(argList.toArray());
        System.out.println(JSON.stringify(r));
      } catch (Exception e) {
        Map<String, Object> err = new LinkedHashMap<>();
        err.put("__err", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
        System.out.println(JSON.stringify(err));
      }
    }
  }

  // ---- minimal JSON parser/serializer, stdlib-only --------------------
  static class JSON {
    static int p; static String s;
    static Object parse(String x) { s = x; p = 0; ws(); return val(); }
    static void ws() { while (p < s.length() && Character.isWhitespace(s.charAt(p))) p++; }
    static Object val() {
      ws();
      if (p >= s.length()) throw new RuntimeException("unexpected EOF");
      char c = s.charAt(p);
      if (c == '{') return obj();
      if (c == '[') return arr();
      if (c == '"') return str();
      if (c == 't' || c == 'f') return bool();
      if (c == 'n') return nul();
      return num();
    }
    static Map<String,Object> obj() {
      Map<String,Object> m = new LinkedHashMap<>(); p++; ws();
      if (p < s.length() && s.charAt(p) == '}') { p++; return m; }
      while (true) {
        ws(); String k = str(); ws();
        if (s.charAt(p) != ':') throw new RuntimeException(": expected"); p++;
        m.put(k, val()); ws();
        if (s.charAt(p) == ',') { p++; continue; }
        if (s.charAt(p) == '}') { p++; return m; }
        throw new RuntimeException(", or } expected");
      }
    }
    static List<Object> arr() {
      List<Object> a = new ArrayList<>(); p++; ws();
      if (p < s.length() && s.charAt(p) == ']') { p++; return a; }
      while (true) {
        a.add(val()); ws();
        if (s.charAt(p) == ',') { p++; continue; }
        if (s.charAt(p) == ']') { p++; return a; }
        throw new RuntimeException(", or ] expected");
      }
    }
    static String str() {
      if (s.charAt(p) != '"') throw new RuntimeException("\\" expected"); p++;
      StringBuilder b = new StringBuilder();
      while (p < s.length() && s.charAt(p) != '"') {
        char c = s.charAt(p++);
        if (c == '\\\\' && p < s.length()) {
          char e = s.charAt(p++);
          if (e == 'n') b.append('\\n');
          else if (e == 't') b.append('\\t');
          else if (e == 'r') b.append('\\r');
          else if (e == 'u') { b.append((char)Integer.parseInt(s.substring(p,p+4),16)); p+=4; }
          else b.append(e);
        } else b.append(c);
      }
      p++; return b.toString();
    }
    static Boolean bool() {
      if (s.startsWith("true", p)) { p += 4; return Boolean.TRUE; }
      if (s.startsWith("false", p)) { p += 5; return Boolean.FALSE; }
      throw new RuntimeException("bool expected");
    }
    static Object nul() { if (s.startsWith("null", p)) { p += 4; return null; } throw new RuntimeException("null expected"); }
    static Number num() {
      int start = p;
      if (s.charAt(p) == '-') p++;
      while (p < s.length() && (Character.isDigit(s.charAt(p)) || ".eE+-".indexOf(s.charAt(p)) >= 0)) p++;
      String t = s.substring(start, p);
      if (t.contains(".") || t.contains("e") || t.contains("E")) return Double.parseDouble(t);
      try { return Long.parseLong(t); } catch (Exception e) { return Double.parseDouble(t); }
    }
    static String stringify(Object v) {
      if (v == null) return "null";
      if (v instanceof Boolean) return v.toString();
      if (v instanceof Number) {
        double d = ((Number)v).doubleValue();
        if (d == Math.floor(d) && !Double.isInfinite(d)) return String.valueOf((long)d);
        return v.toString();
      }
      if (v instanceof String) return "\\"" + esc((String)v) + "\\"";
      if (v instanceof Map) {
        StringBuilder b = new StringBuilder("{"); boolean first = true;
        for (Map.Entry<?,?> e : ((Map<?,?>)v).entrySet()) {
          if (!first) b.append(','); first = false;
          b.append("\\"").append(esc(e.getKey().toString())).append("\\":").append(stringify(e.getValue()));
        }
        return b.append('}').toString();
      }
      if (v instanceof Iterable) {
        StringBuilder b = new StringBuilder("["); boolean first = true;
        for (Object x : (Iterable<?>)v) { if (!first) b.append(','); first = false; b.append(stringify(x)); }
        return b.append(']').toString();
      }
      if (v.getClass().isArray()) {
        StringBuilder b = new StringBuilder("[");
        int n = java.lang.reflect.Array.getLength(v);
        for (int i = 0; i < n; i++) { if (i > 0) b.append(','); b.append(stringify(java.lang.reflect.Array.get(v, i))); }
        return b.append(']').toString();
      }
      return "\\"" + esc(v.toString()) + "\\"";
    }
    static String esc(String t) {
      StringBuilder b = new StringBuilder();
      for (int i = 0; i < t.length(); i++) {
        char c = t.charAt(i);
        if (c == '"') b.append("\\\\\\"");
        else if (c == '\\\\') b.append("\\\\\\\\");
        else if (c == '\\n') b.append("\\\\n");
        else if (c == '\\r') b.append("\\\\r");
        else if (c == '\\t') b.append("\\\\t");
        else b.append(c);
      }
      return b.toString();
    }
  }
}
`;
}

function cppHarness(userCode: string, fnName: string): string {
  // C++ via nlohmann::json — most Piston C++ images include it.
  return `#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
using json = nlohmann::json;
using namespace std;

${userCode}

int main() {
  string stdin_data((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());
  json all_args = json::parse(stdin_data);
  for (auto& args : all_args) {
    try {
      json r = ${fnName}(args);
      cout << r.dump() << "\\n";
    } catch (const exception& e) {
      cout << json{{"__err", e.what()}}.dump() << "\\n";
    }
  }
  return 0;
}
`;
}

function buildHarness(
  language: SupportedLang,
  userCode: string,
  fnName: string,
): string {
  switch (language) {
    case "python":
      return pythonHarness(userCode, fnName);
    case "javascript":
      return javascriptHarness(userCode, fnName);
    case "typescript":
      return typescriptHarness(userCode, fnName);
    case "java":
      return javaHarness(userCode, fnName);
    case "cpp":
      return cppHarness(userCode, fnName);
    case "go":
      return goHarness(userCode, fnName);
    default:
      // Unsupported languages bypass the harness — caller will reject.
      return userCode;
  }
}

/* ---------- Piston client --------------------------------------------- */

type PistonResponse = {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
    output?: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
  };
};

/** Execute user code against a list of tests via Piston. */
export async function runOnPiston(args: {
  language: SupportedLang;
  code: string;
  fnName: string;
  tests: ExecutionTest[];
}): Promise<ExecutionOutcome> {
  if (!(args.language in PISTON_LANG)) {
    return { kind: "unsupported-language", language: args.language };
  }
  if (args.tests.length === 0) {
    return { kind: "ok", cases: [], language: args.language };
  }

  const harnessed = buildHarness(args.language, args.code, args.fnName);
  const stdin = JSON.stringify(args.tests.map((t) => t.args));

  const body = {
    language: PISTON_LANG[args.language],
    version: PISTON_VERSION[args.language],
    files: [{ name: PISTON_FILENAME[args.language], content: harnessed }],
    stdin,
    args: [],
    // Default Piston install caps at 3000ms — can be overridden in
    // self-hosted config but stay safely under for the public default.
    compile_timeout: 10_000,
    run_timeout: 3_000,
    compile_memory_limit: -1,
    run_memory_limit: -1,
  };

  const url = `${env.PISTON_URL.replace(/\/$/, "")}/execute`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), env.PISTON_TIMEOUT_MS);

  const startedAt = Date.now();
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    logger.error("piston.fetch.failed", {
      language: args.language,
      err: err instanceof Error ? err.message : String(err),
    });
    return {
      kind: "runner-error",
      message: "Code runner is unreachable. Try again in a moment.",
    };
  }
  clearTimeout(timer);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.warn("piston.non200", {
      status: res.status,
      body: text.slice(0, 200),
    });
    return {
      kind: "runner-error",
      message: `Runner returned HTTP ${res.status}.`,
    };
  }

  const data = (await res.json()) as PistonResponse;

  // ---- Compile step (Java, C++, Rust) ----
  if (data.compile && data.compile.code !== 0) {
    return {
      kind: "compile-error",
      language: args.language,
      message: (data.compile.stderr || data.compile.stdout || "").slice(0, 4000),
    };
  }

  // ---- Run step ----
  const stdout = data.run.stdout ?? "";
  const stderr = data.run.stderr ?? "";

  if (data.run.signal === "SIGKILL") {
    return {
      kind: "compile-error",
      language: args.language,
      message: "Execution killed (memory or time limit).",
    };
  }

  // Each line is one test's JSON output. Some compilers emit warnings to
  // stdout — we only consume the LAST N lines = #tests.
  const lines = stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const wanted = args.tests.length;
  const dataLines = lines.slice(Math.max(0, lines.length - wanted));

  // If we got zero output at all → likely a runtime crash. Surface stderr.
  if (dataLines.length === 0 && stderr) {
    return {
      kind: "compile-error",
      language: args.language,
      message: stderr.slice(0, 4000),
    };
  }

  const totalMs = Date.now() - startedAt;
  const perCaseMs = Math.round(totalMs / Math.max(1, args.tests.length));

  const cases: ExecutionCaseResult[] = args.tests.map((t, i) => {
    const raw = dataLines[i];
    let actual: unknown = null;
    let error: string | undefined;
    if (raw == null) {
      error = "no output for this case (program may have crashed early)";
    } else {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (
          parsed &&
          typeof parsed === "object" &&
          "__err" in (parsed as Record<string, unknown>)
        ) {
          error = String((parsed as Record<string, unknown>).__err);
        } else {
          actual = parsed;
        }
      } catch (err) {
        error = `non-JSON output: ${raw.slice(0, 100)}`;
      }
    }
    const passed = error == null && deepEqual(actual, t.expected);
    return {
      index: i,
      label: t.label ?? `Case ${i + 1}`,
      passed,
      expected: t.expected,
      actual,
      stdout: "",
      stderr: i === 0 ? stderr.slice(0, 500) : "",
      error,
      durationMs: perCaseMs,
    };
  });

  return { kind: "ok", cases, language: args.language };
}

/* ---------- Deep equality (same impl as in-browser runner) ------------ */

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    const aKeys = Object.keys(ao);
    const bKeys = Object.keys(bo);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) if (!deepEqual(ao[k], bo[k])) return false;
    return true;
  }
  return false;
}

export function isSupportedServerLang(lang: string): lang is SupportedLang {
  return lang in PISTON_LANG;
}
