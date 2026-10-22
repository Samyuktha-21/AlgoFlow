import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight as Next, Sparkles, Loader2, RotateCcw } from 'lucide-react'
import Seo from '../components/Seo'
import CodeEditor from '../components/CodeVisualizer/CodeEditor'
import CallStackPanel from '../components/CodeVisualizer/CallStackPanel'
import RecursionTreePanel from '../components/CodeVisualizer/RecursionTreePanel'
import StructureView from '../components/CodeVisualizer/StructureViews'
import useCodeTracer from '../components/CodeVisualizer/useCodeTracer'
import { analyzeStep, hasRecursion } from '../components/CodeVisualizer/analyze'
import { EXAMPLES } from '../components/CodeVisualizer/examples'

const STORAGE_KEY = 'algoflow:codeviz:code'
const SPEEDS = [{ label: '0.5×', ms: 1200 }, { label: '1×', ms: 650 }, { label: '2×', ms: 300 }, { label: '4×', ms: 120 }]

const panel = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 14 }
const panelTitle = { fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10 }

/* Paste-your-own-code visualizer: runs Python in the browser (Pyodide in a
   worker), records every line/call/return, then plays it back as call-stack
   movement, a recursion tree and auto-detected data structures. */
export default function CodeVisualizer() {
  const [code, setCode] = useState(() => localStorage.getItem(STORAGE_KEY) || EXAMPLES[0].code)
  const [trace, setTrace] = useState(null)
  const [runError, setRunError] = useState(null)
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [isWide, setIsWide] = useState(true)
  const { status, loadError, run, retry } = useCodeTracer()

  useEffect(() => { localStorage.setItem(STORAGE_KEY, code) }, [code])

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 1000)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  const steps = useMemo(() => trace?.steps || [], [trace])
  const last = Math.max(0, steps.length - 1)
  const step = steps[idx]

  useEffect(() => {
    if (!playing || idx >= last) return
    const t = setTimeout(() => {
      setIdx(Math.min(idx + 1, last))
      if (idx + 1 >= last) setPlaying(false)
    }, SPEEDS[speed].ms)
    return () => clearTimeout(t)
  }, [playing, idx, last, speed])

  // ← / → step through, space plays — ignored while typing in the editor
  useEffect(() => {
    if (!trace) return
    const onKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
      if (e.key === 'ArrowRight') { setPlaying(false); setIdx(i => Math.min(i + 1, last)) }
      else if (e.key === 'ArrowLeft') { setPlaying(false); setIdx(i => Math.max(i - 1, 0)) }
      else if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [trace, last])

  const views = useMemo(() => analyzeStep(step, steps[idx - 1]), [step, steps, idx])
  const showTree = trace && hasRecursion(trace.calls)

  const visualise = async () => {
    setRunError(null)
    setPlaying(false)
    try {
      const t = await run(code)
      if (t.steps.length === 0 && t.error) { setTrace(null); setRunError({ text: t.error, line: t.errorLine }); return }
      setTrace(t)
      setIdx(0)
      setPlaying(true)
    } catch (err) {
      setTrace(null)
      setRunError({ text: err.message })
    }
  }

  const onCodeChange = (c) => {
    setCode(c)
    if (trace) { setTrace(null); setPlaying(false) }
    if (runError) setRunError(null)
  }

  const codeLines = code.split('\n')
  const description = !step ? '' :
    step.error ? step.error :
    step.msg ? step.msg :
    `Line ${step.line}: ${(codeLines[step.line - 1] || '').trim()}`

  const errorLine = runError?.line || (step?.error && trace?.errorLine) || null
  const stdout = trace ? trace.stdout.slice(0, step?.out ?? 0) : ''
  const busy = status === 'running' || status === 'installing'
  const loading = status === 'loading' && !loadError

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <Seo
        title="Code Visualizer"
        description="Paste your own Python code and watch it run step by step: call stack, recursion tree, arrays, trees, linked lists, graphs and DP tables drawn automatically."
      />
      <div className="max-w-[1500px] mx-auto px-5 py-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 18, color: 'var(--chrome-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--chrome-text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: 'var(--chrome-text)' }}>Code Visualizer</span>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--chrome-text)', marginBottom: 6 }}>🧪 Code Visualizer</h1>
        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, maxWidth: 760, marginBottom: 22 }}>
          Paste any Python program and press <b>Visualise</b>. It runs right in your browser and shows every step —
          the call stack growing and shrinking, the recursion tree, and your arrays, trees, linked lists, graphs and
          DP tables, detected automatically.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isWide ? 'minmax(380px, 5fr) 7fr' : '1fr', gap: 16, alignItems: 'start' }}>
          {/* ── Left: editor ── */}
          <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 10, position: isWide ? 'sticky' : 'static', top: 80 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ ...panelTitle, marginBottom: 0 }}>Python</span>
              <select
                value=""
                onChange={e => { const ex = EXAMPLES.find(x => x.id === e.target.value); if (ex) onCodeChange(ex.code) }}
                style={{ marginLeft: 'auto', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '6px 8px', fontSize: 13 }}
              >
                <option value="" disabled>Load an example…</option>
                {EXAMPLES.map(ex => <option key={ex.id} value={ex.id}>{ex.label}</option>)}
              </select>
            </div>

            <CodeEditor
              value={code}
              onChange={onCodeChange}
              activeLine={step && !step.error ? step.line : null}
              errorLine={errorLine}
              height={isWide ? 460 : 340}
            />

            <button
              onClick={visualise}
              disabled={busy || loading || !!loadError || !code.trim()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 16px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 15,
                cursor: busy || loading ? 'wait' : 'pointer',
                background: busy || loading || loadError ? '#334155' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: 'white',
              }}
            >
              {busy || loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Loading Python engine…' : status === 'installing' ? 'Installing packages…' : busy ? 'Running…' : 'Visualise'}
            </button>

            {loadError && (
              <div style={{ fontSize: 13, color: '#fda4af', display: 'flex', gap: 8, alignItems: 'center' }}>
                Couldn't load the Python engine (check your internet connection).
                <button onClick={retry} style={{ color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: 4, alignItems: 'center' }}>
                  <RotateCcw size={14} /> Retry
                </button>
              </div>
            )}
            {runError && (
              <div style={{ fontSize: 13, color: '#fda4af', fontFamily: 'ui-monospace, monospace', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 8, padding: '8px 10px' }}>
                {runError.text}{runError.line ? ` (line ${runError.line})` : ''}
              </div>
            )}

            <div>
              <div style={panelTitle}>Output</div>
              <pre style={{ margin: 0, minHeight: 48, maxHeight: 140, overflow: 'auto', background: '#0b1220', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 10px', color: '#a7f3d0', fontSize: 12.5, fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap' }}>
                {stdout || <span style={{ color: '#475569' }}>print() output appears here</span>}
              </pre>
            </div>
          </div>

          {/* ── Right: visualisation ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            {!trace ? (
              <div style={{ ...panel, minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10, color: '#94a3b8' }}>
                <Sparkles size={34} color="#38bdf8" />
                <div style={{ fontSize: 17, fontWeight: 700, color: '#e2e8f0' }}>Your visualisation will appear here</div>
                <div style={{ fontSize: 13, maxWidth: 420, lineHeight: 1.6 }}>
                  Write or paste Python on the left (or load an example) and press <b>Visualise</b>. Use plain
                  values in your code — <code>input()</code> isn't available.
                </div>
              </div>
            ) : (
              <>
                {/* step description + playback */}
                <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: step?.error ? '#fda4af' : '#e2e8f0', minHeight: 20 }}>
                    {description}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CtrlBtn onClick={() => { setPlaying(false); setIdx(0) }} title="First step"><SkipBack size={16} /></CtrlBtn>
                    <CtrlBtn onClick={() => { setPlaying(false); setIdx(i => Math.max(i - 1, 0)) }} title="Previous step (←)"><ChevronLeft size={18} /></CtrlBtn>
                    <CtrlBtn
                      primary
                      onClick={() => { if (idx >= last) setIdx(0); setPlaying(p => !p) }}
                      title="Play / pause (space)"
                    >
                      {playing ? <Pause size={18} /> : <Play size={18} />}
                    </CtrlBtn>
                    <CtrlBtn onClick={() => { setPlaying(false); setIdx(i => Math.min(i + 1, last)) }} title="Next step (→)"><Next size={18} /></CtrlBtn>
                    <CtrlBtn onClick={() => { setPlaying(false); setIdx(last) }} title="Last step"><SkipForward size={16} /></CtrlBtn>
                    <input
                      type="range" min={0} max={last} value={idx}
                      onChange={e => { setPlaying(false); setIdx(Number(e.target.value)) }}
                      style={{ flex: 1, accentColor: '#38bdf8' }}
                      aria-label="Step"
                    />
                    <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 78, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {idx + 1} / {steps.length}
                    </span>
                    <select
                      value={speed}
                      onChange={e => setSpeed(Number(e.target.value))}
                      style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '4px 6px', fontSize: 12 }}
                      aria-label="Speed"
                    >
                      {SPEEDS.map((s, i) => <option key={s.label} value={i}>{s.label}</option>)}
                    </select>
                  </div>
                  {trace.truncated && (
                    <div style={{ fontSize: 12, color: '#f59e0b' }}>
                      Stopped after {trace.maxSteps} steps — try a smaller input (or check for an infinite loop).
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isWide ? '260px 1fr' : '1fr', gap: 12, alignItems: 'start' }}>
                  <div style={panel}>
                    <div style={panelTitle}>Call stack</div>
                    <CallStackPanel step={step} />
                  </div>
                  <div style={{ ...panel, minWidth: 0 }}>
                    <div style={panelTitle}>Data structures</div>
                    {views.length === 0 ? (
                      <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                        No lists, trees or other structures in scope at this step — plain variables are in the call stack.
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {views.map(v => <StructureView key={v.key} view={v} />)}
                      </div>
                    )}
                  </div>
                </div>

                {showTree && (
                  <div style={panel}>
                    <div style={panelTitle}>Recursion tree</div>
                    <RecursionTreePanel calls={trace.calls} stepIndex={idx} activeCall={step?.call} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CtrlBtn({ children, onClick, title, primary }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: primary ? 38 : 32, height: primary ? 38 : 32, borderRadius: 999, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: primary ? '#0ea5e9' : '#1e293b', color: 'white',
      }}
    >
      {children}
    </button>
  )
}
