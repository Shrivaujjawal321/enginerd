/*
 * Pyodide Python runner — Web Worker.
 *
 * Runs user-submitted Python entirely in the browser via Pyodide (CPython
 * compiled to WebAssembly). No backend, no Piston. Loaded lazily from the
 * jsDelivr CDN on first use and cached for the page's lifetime.
 *
 * Protocol (postMessage):
 *   in : { id, code, fnName, tests: [{ args, label }] }
 *   out: { id, kind: "ok", cases: [{ index, label, actual, actualOk, stdout, error, durationMs }] }
 *      | { id, kind: "compile-error", message }
 *      | { kind: "loaded" }   // emitted once, after Pyodide finishes loading
 *
 * The worker computes `actual` per test (JSON-normalised); the main thread
 * owns the deep-equality comparison against `expected`, so JS and Python
 * share one source of truth for pass/fail.
 */

const PYODIDE_VERSION = "v0.27.2";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

let pyodidePromise = null;

function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      // eslint-disable-next-line no-undef
      importScripts(PYODIDE_BASE + "pyodide.js");
      // eslint-disable-next-line no-undef
      const py = await loadPyodide({ indexURL: PYODIDE_BASE });
      self.postMessage({ kind: "loaded" });
      return py;
    })();
  }
  return pyodidePromise;
}

// Python harness. Reads three injected globals (__user_code, __fn_name,
// __tests_json), runs each test, and returns a JSON string of the results.
const HARNESS = `
import json, sys, io, time, traceback

def __enginerd_run():
    tests = json.loads(__tests_json)
    ns = {}
    try:
        exec(__user_code, ns)
    except Exception:
        return json.dumps({"kind": "compile-error", "message": traceback.format_exc()})

    fn = ns.get(__fn_name)
    if not callable(fn):
        return json.dumps({
            "kind": "compile-error",
            "message": "Function '%s' is not defined. Keep the function definition intact." % __fn_name,
        })

    def _normalise(o):
        # Tuples/sets -> lists so JSON shape matches the expected output.
        if isinstance(o, (list, tuple)):
            return [_normalise(x) for x in o]
        if isinstance(o, set):
            return [_normalise(x) for x in o]
        if isinstance(o, dict):
            return {str(k): _normalise(v) for k, v in o.items()}
        return o

    cases = []
    for i, t in enumerate(tests):
        args = t.get("args", [])
        label = t.get("label") or ("Case %d" % (i + 1))
        buf = io.StringIO()
        old = sys.stdout
        sys.stdout = buf
        err = None
        actual = None
        ok = False
        start = time.time()
        try:
            actual = fn(*args)
            ok = True
        except Exception:
            err = traceback.format_exc()
        finally:
            sys.stdout = old
        dur = (time.time() - start) * 1000.0

        actual_ser = None
        if ok:
            try:
                actual_ser = json.loads(json.dumps(_normalise(actual)))
            except Exception:
                ok = False
                err = "Result is not JSON-serialisable: %r" % (actual,)

        cases.append({
            "index": i,
            "label": label,
            "actual": actual_ser,
            "actualOk": ok,
            "stdout": buf.getvalue(),
            "error": err,
            "durationMs": round(dur, 2),
        })
    return json.dumps({"kind": "ok", "cases": cases})

__enginerd_run()
`;

self.onmessage = async (e) => {
  const { id, code, fnName, tests } = e.data || {};
  let py;
  try {
    py = await getPyodide();
  } catch (err) {
    self.postMessage({
      id,
      kind: "compile-error",
      message: "Python runtime failed to load. Check your connection and retry. " + String((err && err.message) || err),
    });
    return;
  }

  try {
    py.globals.set("__user_code", code);
    py.globals.set("__fn_name", fnName);
    py.globals.set("__tests_json", JSON.stringify(tests));
    const outJson = py.runPython(HARNESS);
    const parsed = JSON.parse(outJson);
    self.postMessage({ id, ...parsed });
  } catch (err) {
    self.postMessage({
      id,
      kind: "compile-error",
      message: String((err && err.message) || err),
    });
  } finally {
    try {
      py.globals.delete("__user_code");
      py.globals.delete("__fn_name");
      py.globals.delete("__tests_json");
    } catch (_) {
      /* noop */
    }
  }
};
