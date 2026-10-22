import { useCallback, useEffect, useRef, useState } from 'react'

const RUN_TIMEOUT_MS = 10_000
const PACKAGE_TIMEOUT_MS = 90_000   // first numpy/pandas download can be slow
const IDLE_GRACE_MS = 2_000         // after a result, how long the program may keep running

function spawn() {
  return new Worker(new URL('./codeviz.worker.js', import.meta.url), { type: 'module' })
}

/* Owns the Pyodide worker. status: 'loading' (first Pyodide download),
   'ready', 'installing' (downloading packages the code imports), 'running'.
   run(code) resolves with the trace or rejects with a readable message; an
   endless program is killed after RUN_TIMEOUT_MS and the worker is respawned
   so the next run still works. A truncated trace arrives before the program
   has stopped (it may have swallowed the step limit with a bare `except:`),
   so if the worker doesn't report idle shortly after, it is respawned too. */
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
    let settled = false
    let timer = null
    const arm = (ms, message) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (!settled) { settled = true; reject(new Error(message)) }
        boot()
      }, ms)
    }
    arm(PACKAGE_TIMEOUT_MS, 'Stopped: downloading the packages your code imports took too long.')
    w.onmessage = (e) => {
      const { type } = e.data
      if (type === 'status') {
        if (e.data.phase === 'packages') setStatus('installing')
        else {
          setStatus('running')
          arm(RUN_TIMEOUT_MS, `Stopped after ${RUN_TIMEOUT_MS / 1000}s — the program took too long (infinite loop?).`)
        }
      } else if (type === 'result') {
        settled = true
        resolve(e.data.trace)
        arm(IDLE_GRACE_MS, '')
      } else if (type === 'idle') {
        clearTimeout(timer)
        setStatus('ready')
      } else if (type === 'fatal') {
        clearTimeout(timer)
        if (!settled) { settled = true; reject(new Error(e.data.error)) }
        boot()  // the engine may be left in a broken state
      }
    }
    w.postMessage({ type: 'run', code })
  }), [boot])

  return { status, loadError, run, retry: boot }
}
