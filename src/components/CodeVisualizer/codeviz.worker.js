/* Runs the user's Python inside Pyodide (loaded from the CDN on first use)
   and returns the execution trace produced by tracer.py. Lives in a worker so
   a heavy or endless program can never freeze the page — the UI terminates
   the worker on timeout.

   Messages out: 'ready' after warmup; 'status' ('packages' while downloading
   imported packages such as numpy, then 'running'); 'result' with the trace;
   'idle' once the program has actually stopped (after a truncated trace the
   program can keep going untraced — see tracer.py); 'fatal' on engine errors. */
import tracerSource from './tracer.py?raw'

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.mjs'

let pyodidePromise = null

function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = import(/* @vite-ignore */ PYODIDE_URL)
      .then(({ loadPyodide }) => loadPyodide())
      .then(py => {
        py.runPython(tracerSource)
        return py
      })
  }
  return pyodidePromise
}

self.onmessage = async (e) => {
  const { type, code } = e.data
  try {
    const py = await getPyodide()
    if (type === 'warmup') {
      self.postMessage({ type: 'ready' })
      return
    }

    try {
      await py.loadPackagesFromImports(code, {
        messageCallback: (text) => self.postMessage({ type: 'status', phase: 'packages', text }),
        errorCallback: () => {},
      })
    } catch {
      // unparsable code or a failed download: the run below reports the real error
    }
    self.postMessage({ type: 'status', phase: 'running' })

    let emitted = false
    const emit = (json) => {
      emitted = true
      self.postMessage({ type: 'result', trace: JSON.parse(json) })
    }
    py.globals.set('__codeviz_src', code)
    py.globals.set('__codeviz_emit', emit)
    const json = py.runPython('_run(__codeviz_src, __codeviz_emit)')
    if (!emitted) self.postMessage({ type: 'result', trace: JSON.parse(json) })
    self.postMessage({ type: 'idle' })
  } catch (err) {
    self.postMessage({ type: 'fatal', error: String(err?.message || err) })
  }
}
