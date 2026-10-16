/* Runs the user's Python inside Pyodide (loaded from the CDN on first use)
   and returns the execution trace produced by tracer.py. Lives in a worker so
   a heavy or endless program can never freeze the page — the UI terminates
   the worker on timeout. */
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
    py.globals.set('__codeviz_src', code)
    const json = py.runPython('_run(__codeviz_src)')
    self.postMessage({ type: 'result', trace: JSON.parse(json) })
  } catch (err) {
    self.postMessage({ type: 'fatal', error: String(err?.message || err) })
  }
}
