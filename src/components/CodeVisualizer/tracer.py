"""Code Visualizer tracer.

Runs the user's program under sys.settrace and records one snapshot per
executed line / call / return: the active line, the call stack with each
frame's variables, and every reachable object (lists, dicts, class instances)
in a shared heap so the UI can draw arrays, trees, linked lists and graphs.
"""
import sys
import json
import io
import collections

MAX_STEPS = 1500
MAX_ITEMS = 60          # elements kept per list / dict / set
MAX_STR = 60
USER_FILE = "<your code>"


class _StepLimit(BaseException):
    pass


def _run(code):
    steps = []
    calls = []          # recursion tree: {id, parent, name, args, start, end, ret}
    call_stack = []     # ids into `calls` for the frames currently open
    out = io.StringIO()
    obj_ids = {}        # id(obj) -> small stable number
    keep_alive = []     # stop CPython reusing ids of freed objects mid-run

    def ref_id(o):
        k = id(o)
        if k not in obj_ids:
            obj_ids[k] = len(obj_ids) + 1
            keep_alive.append(o)
        return obj_ids[k]

    def short(s):
        return s if len(s) <= MAX_STR else s[:MAX_STR - 1] + "…"

    def encode(v, heap):
        """Primitive -> {"p": value}; container/object -> {"ref": n} + heap entry."""
        if v is None or isinstance(v, (bool, int, float)):
            if isinstance(v, float) and (v != v or v in (float("inf"), float("-inf"))):
                return {"p": repr(v)}
            return {"p": v}
        if isinstance(v, str):
            return {"p": short(v), "str": True}
        if callable(v) or isinstance(v, type) or type(v).__name__ == "module":
            return None
        n = ref_id(v)
        if n in heap:
            return {"ref": n}
        heap[n] = None  # reserve before recursing (handles cycles)
        if isinstance(v, (list, tuple, collections.deque)):
            kind = "tuple" if isinstance(v, tuple) else ("deque" if isinstance(v, collections.deque) else "list")
            items = list(v)
            heap[n] = {"kind": kind, "items": [encode(x, heap) for x in items[:MAX_ITEMS]], "len": len(items)}
        elif isinstance(v, dict):
            entries = list(v.items())[:MAX_ITEMS]
            heap[n] = {"kind": "dict",
                       "entries": [[encode(k, heap), encode(x, heap)] for k, x in entries],
                       "len": len(v)}
        elif isinstance(v, (set, frozenset)):
            items = list(v)[:MAX_ITEMS]
            try:
                items.sort()
            except Exception:
                pass
            heap[n] = {"kind": "set", "items": [encode(x, heap) for x in items], "len": len(v)}
        elif hasattr(v, "__dict__"):
            fields = {}
            for k, x in vars(v).items():
                if not k.startswith("__"):
                    e = encode(x, heap)
                    if e is not None:
                        fields[k] = e
            heap[n] = {"kind": "obj", "cls": type(v).__name__, "fields": fields}
        else:
            heap[n] = {"kind": "other", "text": short(repr(v))}
        return {"ref": n}

    def frame_vars(frame, heap, is_global):
        result = {}
        src = frame.f_globals if is_global else frame.f_locals
        for k, x in list(src.items()):
            if k.startswith("__"):
                continue
            e = encode(x, heap)
            if e is not None:
                result[k] = e
        return result

    def snapshot(frame, event, line, extra=None):
        if len(steps) >= MAX_STEPS:
            raise _StepLimit()
        heap = {}
        frames = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == USER_FILE:
                is_global = f.f_code.co_name == "<module>"
                frames.append({
                    "name": "Global" if is_global else f.f_code.co_name,
                    "line": f.f_lineno,
                    "vars": frame_vars(f, heap, is_global),
                })
            f = f.f_back
        frames.reverse()  # bottom (Global) first, top of stack last
        step = {
            "event": event,
            "line": line,
            "frames": frames,
            "heap": heap,
            "out": len(out.getvalue()),
            "call": call_stack[-1] if call_stack else None,
        }
        if extra:
            step.update(extra)
        steps.append(step)

    def fmt_args(frame):
        code = frame.f_code
        names = code.co_varnames[:code.co_argcount]
        parts = []
        for nm in names:
            x = frame.f_locals.get(nm)
            if nm == "self":
                continue
            if x is None or isinstance(x, (bool, int, float)):
                parts.append(repr(x))
            elif isinstance(x, str):
                parts.append(repr(short(x)))
            elif isinstance(x, (list, tuple)):
                parts.append("[…]" if len(x) > 4 else repr(list(x)))
            elif hasattr(x, "val"):
                parts.append(str(getattr(x, "val")))
            elif hasattr(x, "data"):
                parts.append(str(getattr(x, "data")))
            else:
                parts.append(type(x).__name__)
        return short(", ".join(parts))

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != USER_FILE:
            return None
        name = frame.f_code.co_name
        if name.startswith("<") and name != "<module>":
            return tracer  # list comprehensions / lambdas: run but don't record calls
        if name != "<module>" and not frame.f_code.co_flags & 0x1:
            return None    # class body (not CO_OPTIMIZED): just defines methods
        if event == "call":
            if name != "<module>":
                cid = len(calls)
                calls.append({"id": cid, "parent": call_stack[-1] if call_stack else None,
                              "name": name, "args": fmt_args(frame),
                              "hidden": name.startswith("__") and name.endswith("__"),
                              "start": len(steps), "end": None, "ret": None})
                call_stack.append(cid)
                snapshot(frame, "call", frame.f_lineno, {"msg": f"Call {name}({calls[cid]['args']})"})
            return tracer
        if event == "line":
            snapshot(frame, "line", frame.f_lineno)
        elif event == "return":
            if name == "<module>" and arg is None:
                # final picture, after the last line has taken effect
                snapshot(frame, "done", frame.f_lineno, {"msg": "Program finished"})
            if name != "<module>":
                ret = encode(arg, {}) if arg is None or isinstance(arg, (bool, int, float, str)) else None
                ret_text = repr(arg) if ret is not None else type(arg).__name__
                snapshot(frame, "return", frame.f_lineno,
                         {"msg": f"{name} returns {short(ret_text)}"})
                if call_stack:
                    cid = call_stack.pop()
                    calls[cid]["end"] = len(steps) - 1
                    calls[cid]["ret"] = short(ret_text)
        elif event == "exception":
            pass
        return tracer

    def no_input(*_a, **_k):
        raise RuntimeError("input() is not supported here: hard-code your test values instead")

    error = None
    truncated = False
    try:
        compiled = compile(code, USER_FILE, "exec")
    except SyntaxError as e:
        return json.dumps({"ok": False, "error": f"SyntaxError: {e.msg}", "errorLine": e.lineno,
                           "steps": [], "calls": [], "stdout": ""})

    user_globals = {"__name__": "__main__", "__builtins__": __builtins__, "input": no_input}
    old_stdout = sys.stdout
    old_limit = sys.getrecursionlimit()
    sys.stdout = out
    sys.setrecursionlimit(400)
    try:
        sys.settrace(tracer)
        exec(compiled, user_globals)
    except _StepLimit:
        truncated = True
    except BaseException as e:  # noqa: BLE001 - surface any user error in the UI
        tb = e.__traceback__
        line = None
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == USER_FILE:
                line = tb.tb_lineno
            tb = tb.tb_next
        error = {"text": f"{type(e).__name__}: {e}", "line": line}
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout
        sys.setrecursionlimit(old_limit)

    if error:
        # an uncaught error also fires the module "return" event — not a real finish
        if steps and steps[-1]["event"] == "done":
            steps.pop()
        if steps:
            steps[-1]["error"] = error["text"]
        else:
            steps.append({"event": "error", "line": error["line"], "frames": [], "heap": {},
                          "out": len(out.getvalue()), "call": None, "error": error["text"]})
    return json.dumps({
        "ok": error is None,
        "error": error["text"] if error else None,
        "errorLine": error["line"] if error else None,
        "truncated": truncated,
        "maxSteps": MAX_STEPS,
        "steps": steps,
        "calls": calls,
        "stdout": out.getvalue(),
    })
