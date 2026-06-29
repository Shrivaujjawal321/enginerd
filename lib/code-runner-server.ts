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

/**
 * C harness — stdlib only (stdio.h, stdlib.h, string.h).
 *
 * Protocol: stdin = JSON array of test cases, each test case = array of args.
 * stdout: one JSON-encoded result per line (or {"__err":"..."} on error).
 *
 * User function signature:
 *   char* ${fnName}(int argc, char* argv[])
 * where argv[i] is a null-terminated JSON string for the i-th argument, and
 * the function returns a null-terminated JSON string (static or heap-alloc'd).
 *
 * Embeds a minimal balanced-token JSON extractor — no external libraries.
 */
function cHarness(userCode: string, fnName: string): string {
  // String.raw prevents TS from eating the backslashes in the C source.
  // ${userCode} and ${fnName} are still interpolated normally.
  return String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* ---- Begin user code ---- */
${userCode}
/* ---- End user code ---- */

/* ---- Auto-grader harness — do not modify ---- */
static void skip_ws(const char *s, int *p) {
  while (s[*p]==' '||s[*p]=='\n'||s[*p]=='\r'||s[*p]=='\t') (*p)++;
}

/* Extract one balanced JSON value from s[*p], return malloc'd copy.
   Advances *p past the value. */
static char *extract_val(const char *s, int *p, int len) {
  skip_ws(s, p);
  if (*p >= len) return NULL;
  int start = *p;
  char c = s[*p];
  if (c == '"') {
    (*p)++;
    while (*p < len && s[*p] != '"') {
      if (s[*p] == '\\') (*p)++;
      (*p)++;
    }
    if (*p < len) (*p)++;
  } else if (c == '[' || c == '{') {
    char close = (c == '[') ? ']' : '}';
    int depth = 1; (*p)++;
    while (*p < len && depth > 0) {
      char ch = s[*p];
      if (ch == '"') { (*p)++; while (*p < len && s[*p] != '"') { if (s[*p] == '\\') (*p)++; (*p)++; } if (*p < len) (*p)++; continue; }
      if (ch == '[' || ch == '{') depth++;
      else if (ch == ']' || ch == '}') depth--;
      (*p)++;
    }
  } else {
    while (*p < len && s[*p] != ',' && s[*p] != ']' && s[*p] != '}' &&
           s[*p] != ' ' && s[*p] != '\n' && s[*p] != '\r' && s[*p] != '\t') (*p)++;
  }
  int vlen = *p - start;
  char *out = (char *)malloc(vlen + 1);
  if (!out) return NULL;
  memcpy(out, s + start, vlen);
  out[vlen] = '\0';
  return out;
}

/* Parse a JSON array at s[*p] into argv[]. Returns count; free each argv[i]
   and argv itself after use. Returns -1 on parse error. */
static int parse_arr(const char *s, int *p, int len, char ***argv_out) {
  skip_ws(s, p);
  if (*p >= len || s[*p] != '[') return -1;
  (*p)++;
  *argv_out = (char **)malloc(64 * sizeof(char *));
  int n = 0;
  skip_ws(s, p);
  if (*p < len && s[*p] == ']') { (*p)++; return 0; }
  while (*p < len) {
    char *v = extract_val(s, p, len);
    if (!v) break;
    (*argv_out)[n++] = v;
    skip_ws(s, p);
    if (*p < len && s[*p] == ',') { (*p)++; skip_ws(s, p); continue; }
    if (*p < len && s[*p] == ']') { (*p)++; break; }
    break;
  }
  return n;
}

int main(void) {
  size_t cap = 65536, sz = 0;
  char *buf = (char *)malloc(cap);
  if (!buf) return 1;
  int ch;
  while ((ch = fgetc(stdin)) != EOF) {
    if (sz + 1 >= cap) { cap *= 2; buf = (char *)realloc(buf, cap); if (!buf) return 1; }
    buf[sz++] = (char)ch;
  }
  buf[sz] = '\0';

  int pos = 0, slen = (int)sz;
  skip_ws(buf, &pos);
  if (pos >= slen || buf[pos] != '[') {
    fprintf(stderr, "harness: expected outer JSON array\n");
    free(buf); return 1;
  }
  pos++; skip_ws(buf, &pos);
  if (pos < slen && buf[pos] == ']') { free(buf); return 0; }

  while (pos < slen) {
    char **argv = NULL;
    int argc = parse_arr(buf, &pos, slen, &argv);
    if (argc < 0) { printf("{\"__err\":\"harness: failed to parse test args\"}\n"); break; }
    char *result = ${fnName}(argc, argv);
    printf("%s\n", result ? result : "null");
    for (int i = 0; i < argc; i++) free(argv[i]);
    free(argv);
    skip_ws(buf, &pos);
    if (pos < slen && buf[pos] == ',') { pos++; skip_ws(buf, &pos); continue; }
    if (pos < slen && buf[pos] == ']') break;
    break;
  }
  free(buf);
  return 0;
}
`;
}

/**
 * Rust harness — stdlib only (no external crates, no Cargo.toml needed).
 *
 * Defines a `Val` enum (Null, Bool, Num, Str, Arr) + a compact recursive-
 * descent JSON parser + a Display impl that serialises back to JSON.
 *
 * User function signature:
 *   fn ${fnName}(args: Vec<Val>) -> Val
 * where args[0..] are the parsed JSON arguments for each test case.
 */
function rustHarness(userCode: string, fnName: string): string {
  // String.raw: backslashes in the Rust source are preserved as-is.
  // ${userCode} and ${fnName} are still interpolated.
  return String.raw`use std::io::{self, Read};
use std::fmt;

// ---- Auto-grader harness — do not modify ----------------------------------------
/// Minimal JSON value type. Covers all DSA test-case shapes.
/// Display serialises back to compact JSON so results print cleanly.
#[derive(Debug, Clone)]
pub enum Val { Null, Bool(bool), Num(f64), Str(String), Arr(Vec<Val>) }

impl fmt::Display for Val {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Val::Null    => write!(f, "null"),
            Val::Bool(b) => write!(f, "{b}"),
            Val::Num(n)  => if n.fract() == 0.0 && n.abs() < 1e15 {
                write!(f, "{}", *n as i64)
            } else {
                write!(f, "{n}")
            },
            Val::Str(s) => {
                write!(f, "\"")?;
                for c in s.chars() {
                    match c {
                        '"'  => write!(f, "\\\"")?,
                        '\\' => write!(f, "\\\\")?,
                        '\n' => write!(f, "\\n")?,
                        '\r' => write!(f, "\\r")?,
                        c    => write!(f, "{c}")?,
                    }
                }
                write!(f, "\"")
            },
            Val::Arr(a) => {
                write!(f, "[")?;
                for (i, v) in a.iter().enumerate() {
                    if i > 0 { write!(f, ",")?; }
                    write!(f, "{v}")?;
                }
                write!(f, "]")
            },
        }
    }
}

struct Jp<'a> { s: &'a [u8], i: usize }
impl<'a> Jp<'a> {
    fn ws(&mut self) {
        while self.i < self.s.len() && matches!(self.s[self.i], b' '|b'\n'|b'\r'|b'\t') {
            self.i += 1;
        }
    }
    fn val(&mut self) -> Option<Val> {
        self.ws();
        if self.i >= self.s.len() { return None; }
        match self.s[self.i] {
            b'n' => { self.i += 4; Some(Val::Null) }
            b't' => { self.i += 4; Some(Val::Bool(true)) }
            b'f' => { self.i += 5; Some(Val::Bool(false)) }
            b'"' => {
                self.i += 1;
                let mut r = String::new();
                while self.i < self.s.len() && self.s[self.i] != b'"' {
                    if self.s[self.i] == b'\\' {
                        self.i += 1;
                        if self.i < self.s.len() {
                            match self.s[self.i] {
                                b'n'  => r.push('\n'),
                                b't'  => r.push('\t'),
                                b'r'  => r.push('\r'),
                                b'"'  => r.push('"'),
                                b'\\' => r.push('\\'),
                                c     => r.push(c as char),
                            }
                            self.i += 1;
                        }
                    } else {
                        r.push(self.s[self.i] as char);
                        self.i += 1;
                    }
                }
                if self.i < self.s.len() { self.i += 1; } // skip closing "
                Some(Val::Str(r))
            }
            b'[' => {
                self.i += 1; self.ws();
                let mut a: Vec<Val> = Vec::new();
                if self.i < self.s.len() && self.s[self.i] == b']' {
                    self.i += 1; return Some(Val::Arr(a));
                }
                loop {
                    match self.val() { Some(v) => a.push(v), None => break }
                    self.ws();
                    if self.i < self.s.len() && self.s[self.i] == b',' { self.i += 1; continue; }
                    if self.i < self.s.len() && self.s[self.i] == b']' { self.i += 1; break; }
                    break;
                }
                Some(Val::Arr(a))
            }
            _ => {
                let st = self.i;
                while self.i < self.s.len()
                    && !matches!(self.s[self.i], b','|b']'|b'}'|b' '|b'\n'|b'\r'|b'\t')
                {
                    self.i += 1;
                }
                let tok = std::str::from_utf8(&self.s[st..self.i]).unwrap_or("0");
                tok.parse::<f64>().ok().map(Val::Num)
            }
        }
    }
}
// ---- End harness preamble --------------------------------------------------------

// ---- Begin user code ----
${userCode}
// ---- End user code ----

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let bytes = input.trim().as_bytes();
    let mut p = Jp { s: bytes, i: 0 };
    p.ws();
    if p.i >= p.s.len() || p.s[p.i] != b'[' {
        println!("{}", r#"{"__err":"expected outer array"}"#);
        return;
    }
    p.i += 1; p.ws();
    if p.i < p.s.len() && p.s[p.i] == b']' { return; }
    loop {
        // Parse one test-case (inner array) as a Val::Arr.
        let args = match p.val() {
            Some(Val::Arr(a)) => a,
            Some(_) => { println!("{}", r#"{"__err":"test case must be an array"}"#); break; }
            None    => break,
        };
        let result = ${fnName}(args);
        println!("{result}");
        p.ws();
        if p.i < p.s.len() && p.s[p.i] == b',' { p.i += 1; p.ws(); continue; }
        if p.i < p.s.len() && p.s[p.i] == b']' { break; }
        break;
    }
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
    case "c":
      return cHarness(userCode, fnName);
    case "go":
      return goHarness(userCode, fnName);
    case "rust":
      return rustHarness(userCode, fnName);
    default:
      // Exhaustive — all SupportedLang values are handled above.
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
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error("piston.fetch.failed", {
      language: args.language,
      err: errMsg,
    });
    // Distinguish "configured a self-host URL but nothing's listening" from a
    // generic outage — that's by far the most common dev failure mode.
    const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(env.PISTON_URL);
    if (isLocal) {
      return {
        kind: "runner-error",
        message: `Self-hosted Piston isn't running at ${env.PISTON_URL}. Start it: \`docker run -d --name piston -p 2000:2000 ghcr.io/engineer-man/piston\`, then install the language: \`curl -X POST http://localhost:2000/api/v2/packages -H "Content-Type: application/json" -d '{"language":"${args.language}","version":"*"}'\`.`,
      };
    }
    return {
      kind: "runner-error",
      message:
        "Code runner is unreachable. Try again in a moment, or self-host Piston (see .env.example).",
    };
  }
  clearTimeout(timer);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.warn("piston.non200", {
      status: res.status,
      body: text.slice(0, 200),
    });
    // The public Piston API at emkc.org went whitelist-only on 2026-02-15
    // and rejects unauthenticated calls with HTTP 401. Surface that as an
    // actionable message instead of a bare status code.
    if (res.status === 401 && /piston/i.test(text)) {
      return {
        kind: "runner-error",
        message:
          "Server-side runner unavailable: the public Piston API became whitelist-only on 2026-02-15. Self-host: `docker run -d -p 2000:2000 ghcr.io/engineer-man/piston`, then set PISTON_URL=http://localhost:2000/api/v2 in .env.local. JavaScript still runs locally in your browser.",
      };
    }
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
      } catch {
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
