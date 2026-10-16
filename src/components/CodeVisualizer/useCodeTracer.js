import { useCallback, useEffect, useRef, useState } from 'react'

const RUN_TIMEOUT_MS = 10_000

function spawn() {
  return new Worker(new URL('./codeviz.worker.js', import.meta.url), { type: 'module' })
}

/* Owns the Pyodide worker. status: 'loading' (first Pyodide download),
   'ready', 'running'. run(code) resolves with the trace or rejects with a
   readable message; an endless program is killed after RUN_TIMEOUT_MS and the
   worker is respawned so the next run still works. */
export default function useCodeTracer() {
  const workerRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)

  const startWorker = useCallback(() => {
    workerRef.current?.terminate()
    const w = spawn()
    workerRef.current = w
    w.onmessage = (e) => {
      if (e.data.type === 'ready') setStatus('ready')
      if (e.data.type === 'fatal') setLoadError(e.data.error)
    }
    w.onerror = (e) => setLoadError(e.message || 'Could not start the Python engine')
    w.postMessage({ type: 'warmup' })
  }, [])

  const boot = useCallback(() => {
    setStatus('loading')
    setLoadError(null)
    startWorker()
  }, [startWorker])

  useEffect(() => {
    startWorker()
    return () => workerRef.current?.terminate()
  }, [startWorker])

  const run = useCallback((code) => new Promise((resolve, reject) => {
    const w = workerRef.current
    if (!w) { reject(new Error('Python engine not started')); return }
    setStatus('running')
    const timer = setTimeout(() => {
      reject(new Error(`Stopped after ${RUN_TIMEOUT_MS / 1000}s — the program took too long (infinite loop?).`))
      boot()
    }, RUN_TIMEOUT_MS)
    w.onmessage = (e) => {
      if (e.data.type === 'ready') return
      clearTimeout(timer)
      setStatus('ready')
      if (e.data.type === 'result') resolve(e.data.trace)
      else reject(new Error(e.data.error))
    }
    w.postMessage({ type: 'run', code })
  }), [boot])

  return { status, loadError, run, retry: boot }
}
