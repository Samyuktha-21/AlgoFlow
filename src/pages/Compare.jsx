import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Play, Pause, SkipBack, SkipForward, RotateCcw, GitCompare } from 'lucide-react'
import Seo from '../components/Seo'
import { VISUALIZER_MAP } from '../components/Visualizer/visualizerMap'
import { buildPool, loadEntry } from '../game/pool'
import { runSteps } from '../game/runSteps'
import { getDefaultInput } from '../game/defaultInput'
import { classifySteps, opKindLabel } from '../game/classifyStep'
import {
  AXES, availableAxes, buildAlignment, partnersFor, isComparableRun,
} from '../game/compareRuns'

/*
 * Two algorithms, one input, side by side — Item 1 of docs/NEXT_FEATURES.md.
 *
 * The alignment decision lives in src/game/compareRuns.js and is the reason
 * this page has a transport at all: the two runs are NOT played on a shared
 * step clock (bubble sort emits 71 steps to heap sort's 41 on the same input,
 * so step i means nothing across the divide). The transport walks *frames*,
 * where frame k is the k-th qualifying operation on each side.
 *
 * Rendering goes through VISUALIZER_MAP directly, the same way ChallengeCard
 * does, rather than through VisualizerCanvas — that component reads its step
 * from VisualizationContext, and this page has two independent runs to show.
 * VISUALIZER_MAP is the dispatcher; VisualizerCanvas is a context-bound
 * wrapper around it. One dispatcher is preserved.
 */

const MONO = "'IBM Plex Mono', monospace"
const TICK_MS = 700

function Panel({ entry, step, kind, side, dimmed }) {
  const Viz = VISUALIZER_MAP[entry.type] || VISUALIZER_MAP.array
  return (
    <div style={{
      background: 'var(--page-surface)', border: '1px solid var(--page-border)',
      borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      opacity: dimmed ? 0.6 : 1, transition: 'opacity 0.2s',
    }}>
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid var(--page-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--chrome-text-muted)' }}>{side}</div>
          <div style={{ fontWeight: 700, color: 'var(--chrome-text)', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.name}
          </div>
        </div>
        {kind && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap',
            background: 'var(--page-surface-2)', border: '1px solid var(--page-border)', color: 'var(--chrome-text-muted)',
          }}>{opKindLabel(kind)}</span>
        )}
      </div>

      <div style={{ background: 'rgba(0,0,0,0.28)', minHeight: 300, padding: 8 }}>
        <Suspense fallback={<div style={{ minHeight: 284 }} />}>
          <Viz step={step} themeId={entry.themeId} metadata={entry.metadata} />
        </Suspense>
      </div>

      <div style={{
        padding: '10px 14px', fontSize: 13, lineHeight: 1.5, minHeight: 58,
        color: 'var(--chrome-text-muted)', borderTop: '1px solid var(--page-border)',
      }}>
        {dimmed
          ? <em>Finished — holding its final state.</em>
          : (step?.description || '')}
      </div>
    </div>
  )
}

function Select({ label, value, onChange, options, disabled }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, flex: '1 1 200px' }}>
      <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--chrome-text-muted)' }}>{label}</span>
      <select
        value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '9px 11px', borderRadius: 9, fontSize: 14, fontWeight: 600, width: '100%',
          background: 'var(--page-surface-2)', border: '1px solid var(--page-border)',
          color: 'var(--chrome-text)', cursor: disabled ? 'default' : 'pointer',
        }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

const btn = (enabled) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '9px 14px', borderRadius: 9, fontSize: 14, fontWeight: 700,
  background: 'var(--page-surface-2)', border: '1px solid var(--page-border)',
  color: 'var(--chrome-text)', cursor: enabled ? 'pointer' : 'default',
  opacity: enabled ? 1 : 0.45,
})

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const [left, setLeft] = useState(null)     // loaded entry + steps + kinds
  const [right, setRight] = useState(null)
  const [axis, setAxis] = useState(params.get('axis') || 'operation')
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')

  /* The pool, filtered to what can actually be paired: an algorithm with no
     steps, or one shipping its own input seed, cannot receive the same input
     as its partner. buildPool is synchronous and pure, so this is a memo and
     not an effect. (Whether a run has any *comparable* state needs the steps
     themselves, so that check happens after loading, below.) */
  const pool = useMemo(
    () => buildPool(null).filter(p => p.hasSteps && !p.presetInput),
    [])

  const leftKey  = params.get('a') || ''
  const rightKey = params.get('b') || ''

  const keyOf = (p) => `${p.categoryId}/${p.algorithmId}`
  const find  = useCallback((key) => pool.find(p => keyOf(p) === key) || null, [pool])

  /* Left choices: everything pairable at all. Right choices: same type as
     left, which is what guarantees byte-identical input from getDefaultInput. */
  const leftOptions = useMemo(() => {
    const seen = pool.filter(p => partnersFor(pool, p).length > 0)
    return [{ value: '', label: 'Choose an algorithm…' },
      ...seen.map(p => ({ value: keyOf(p), label: `${p.name}  ·  ${p.type}` }))]
  }, [pool])

  const rightOptions = useMemo(() => {
    const l = find(leftKey)
    if (!l) return [{ value: '', label: 'Choose the left side first' }]
    return [{ value: '', label: 'Compare against…' },
      ...partnersFor(pool, l).map(p => ({ value: keyOf(p), label: p.name }))]
  }, [pool, leftKey, find])

  /* Load and run both sides whenever the pair changes. */
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const l = find(leftKey), r = find(rightKey)
      if (!l || !r) {
        if (!cancelled) { setLeft(null); setRight(null); setError('') }
        return
      }
      const [le, re] = await Promise.all([loadEntry(l), loadEntry(r)])
      /* Both sides get the same input explicitly, rather than trusting that
         two same-type algorithms happen to agree on the default. */
      const input = getDefaultInput(le.type, le.metadata?.inputType, le.metadata?.inputSpec)
      const ls = runSteps(le, input)
      const rs = runSteps(re, input)
      if (cancelled) return
      if (!ls?.length || !rs?.length) {
        setLeft(null); setRight(null)
        setError('One of these algorithms could not run on the shared input.')
        return
      }
      const lk = classifySteps(ls), rk = classifySteps(rs)
      if (!isComparableRun(ls, lk) || !isComparableRun(rs, rk)) {
        setLeft(null); setRight(null)
        setError('One of these runs never changes its visible state, so there is nothing to line up.')
        return
      }
      setError('')
      setLeft({ ...le, steps: ls, kinds: lk, input })
      setRight({ ...re, steps: rs, kinds: rk, input })
      setFrame(0); setPlaying(false)
    })()

    return () => { cancelled = true }
  }, [leftKey, rightKey, find])

  const axes = useMemo(
    () => (left && right ? availableAxes(left.steps, right.steps, left.kinds, right.kinds) : ['operation']),
    [left, right])

  /* An axis that stopped being available when the pair changed falls back. */
  const activeAxis = axes.includes(axis) ? axis : axes[0] || 'operation'

  const alignment = useMemo(
    () => (left && right
      ? buildAlignment(left.steps, right.steps, activeAxis, { kindsA: left.kinds, kindsB: right.kinds })
      : null),
    [left, right, activeAxis])

  const total = alignment?.frames.length || 0
  const at = Math.min(frame, Math.max(total - 1, 0))
  const current = alignment?.frames[at] || null

  /* Transport. */
  useEffect(() => {
    if (!playing || !total) return
    const id = setInterval(() => {
      setFrame(f => {
        if (f + 1 >= total) { setPlaying(false); return f }
        return f + 1
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [playing, total])

  const setPair = (a, b) => {
    const next = new URLSearchParams(params)
    if (a !== undefined) { a ? next.set('a', a) : next.delete('a'); next.delete('b') }
    if (b !== undefined) { b ? next.set('b', b) : next.delete('b') }
    setParams(next, { replace: true })
  }

  const chooseAxis = (id) => {
    setAxis(id); setFrame(0); setPlaying(false)
    const next = new URLSearchParams(params); next.set('axis', id); setParams(next, { replace: true })
  }

  const leftStep  = left  && current ? left.steps[current.a ?? left.steps.length - 1] : null
  const rightStep = right && current ? right.steps[current.b ?? right.steps.length - 1] : null
  const leftKind  = left  && current?.a !== null && current ? left.kinds[current.a] : null
  const rightKind = right && current?.b !== null && current ? right.kinds[current.b] : null

  const divergedHere = !!current?.diverged
  const divergeAt = alignment?.divergeAt ?? null

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <Seo
        title="Compare two algorithms"
        description="Run two algorithms on the same input side by side and see exactly where they start to differ."
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <GitCompare size={22} style={{ color: 'var(--chrome-text)' }} />
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--chrome-text)', margin: 0 }}>Compare</h1>
      </div>
      <p style={{ color: 'var(--chrome-text-muted)', fontSize: 14, margin: '0 0 1.25rem', maxWidth: 720, lineHeight: 1.6 }}>
        Two algorithms, the same input, stepped together. They are lined up by <em>operation</em>,
        not by step number — one algorithm emitting more steps than another does not mean it is
        further along.
      </p>

      {/* pickers */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', marginBottom: 16,
        background: 'var(--page-surface)', border: '1px solid var(--page-border)',
        borderRadius: 14, padding: '14px 16px',
      }}>
        <Select label="Left" value={leftKey} options={leftOptions} onChange={v => setPair(v, '')} />
        <Select label="Right" value={rightKey} options={rightOptions} disabled={!leftKey}
          onChange={v => setPair(undefined, v)} />
      </div>

      {error && (
        <div style={{
          padding: '12px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14,
          background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--chrome-text)',
        }}>{error}</div>
      )}

      {!left && !error && (
        <div style={{
          padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--chrome-text-muted)',
          background: 'var(--page-surface)', border: '1px dashed var(--page-border)', borderRadius: 14,
        }}>
          Pick two algorithms of the same kind to see them run against each other.
        </div>
      )}

      {left && right && alignment && (
        <>
          {/* shared input + axis */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 14,
            background: 'var(--page-surface)', border: '1px solid var(--page-border)',
            borderRadius: 14, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 13, color: 'var(--chrome-text-muted)' }}>
              Shared input:{' '}
              <span style={{ fontFamily: MONO, color: 'var(--chrome-text)' }}>
                {left.input.input || '(the algorithm’s own board)'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
              {axes.map(id => (
                <button key={id} type="button" onClick={() => chooseAxis(id)} title={AXES[id].hint}
                  style={{
                    ...btn(true),
                    padding: '7px 12px', fontSize: 13,
                    background: id === activeAxis ? 'rgba(245,129,31,0.16)' : 'var(--page-surface-2)',
                    border: id === activeAxis ? '1px solid rgba(245,129,31,0.55)' : '1px solid var(--page-border)',
                  }}>
                  {AXES[id].label}
                </button>
              ))}
            </div>
          </div>

          {/* the two runs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            <Panel entry={left}  step={leftStep}  kind={leftKind}  side="Left"  dimmed={current?.a === null} />
            <Panel entry={right} step={rightStep} kind={rightKind} side="Right" dimmed={current?.b === null} />
          </div>

          {/* divergence */}
          <div style={{
            marginTop: 14, padding: '12px 14px', borderRadius: 10, fontSize: 14, lineHeight: 1.6,
            background: divergedHere ? 'rgba(245,129,31,0.12)' : 'var(--page-surface)',
            border: divergedHere ? '1px solid rgba(245,129,31,0.5)' : '1px solid var(--page-border)',
            color: 'var(--chrome-text)',
          }}>
            {current?.field === null ? (
              <>These two have no directly comparable state, so only their operations are lined up.</>
            ) : alignment.fieldStatic ? (
              <>Neither of these changes its <code style={{ fontFamily: MONO }}>{alignment.comparedField}</code>,
                {' '}so there is no divergence to find — the difference between them is how much work they do:{' '}
                <strong>{alignment.counts.a}</strong> vs <strong>{alignment.counts.b}</strong>{' '}
                {AXES[activeAxis].label.replace('Each ', '').toLowerCase()}s.</>
            ) : divergedHere ? (
              <><strong>They differ here.</strong> After {at + 1}{' '}
                {AXES[activeAxis].label.replace('Each ', '').toLowerCase()}
                {at === 0 ? '' : 's'}, the two <code style={{ fontFamily: MONO }}>{current.field}</code> states are not the same.
                {divergeAt !== null && divergeAt !== at && <> First divergence was at frame {divergeAt + 1}.</>}
              </>
            ) : divergeAt === null ? (
              <>Identical so far, and they never diverge on this input — same work, different order.</>
            ) : (
              <>Matching here. They first diverge at frame {divergeAt + 1} of {total}.</>
            )}
          </div>

          {/* transport */}
          <div style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            background: 'var(--page-surface)', border: '1px solid var(--page-border)',
            borderRadius: 14, padding: '12px 16px',
          }}>
            <button type="button" style={btn(at > 0)} disabled={at === 0}
              onClick={() => { setPlaying(false); setFrame(0) }} aria-label="Back to start">
              <RotateCcw size={15} />
            </button>
            <button type="button" style={btn(at > 0)} disabled={at === 0}
              onClick={() => { setPlaying(false); setFrame(f => Math.max(0, f - 1)) }} aria-label="Previous frame">
              <SkipBack size={15} />
            </button>
            <button type="button" style={{ ...btn(total > 1), minWidth: 104 }} disabled={total <= 1}
              onClick={() => setPlaying(p => !p)}>
              {playing ? <Pause size={15} /> : <Play size={15} />}{playing ? 'Pause' : 'Play'}
            </button>
            <button type="button" style={btn(at < total - 1)} disabled={at >= total - 1}
              onClick={() => { setPlaying(false); setFrame(f => Math.min(total - 1, f + 1)) }} aria-label="Next frame">
              <SkipForward size={15} />
            </button>
            {divergeAt !== null && (
              <button type="button" style={{ ...btn(true), fontSize: 13 }}
                onClick={() => { setPlaying(false); setFrame(divergeAt) }}>
                Jump to divergence
              </button>
            )}

            <input
              type="range" min={0} max={Math.max(total - 1, 0)} value={at}
              onChange={e => { setPlaying(false); setFrame(Number(e.target.value)) }}
              style={{ flex: '1 1 180px', accentColor: '#f5811f', minWidth: 140 }}
              aria-label="Frame" />

            <div style={{ fontFamily: MONO, fontSize: 13, color: 'var(--chrome-text-muted)', whiteSpace: 'nowrap' }}>
              {at + 1} / {total}
            </div>
          </div>

          {/* totals — the headline number for "which one does less work" */}
          <div style={{
            marginTop: 12, display: 'flex', gap: 20, flexWrap: 'wrap',
            fontSize: 13, color: 'var(--chrome-text-muted)',
          }}>
            <span>{left.name}: <strong style={{ color: 'var(--chrome-text)' }}>{alignment.counts.a}</strong>{' '}
              {AXES[activeAxis].label.replace('Each ', '').toLowerCase()}s, {left.steps.length} steps</span>
            <span>{right.name}: <strong style={{ color: 'var(--chrome-text)' }}>{alignment.counts.b}</strong>{' '}
              {AXES[activeAxis].label.replace('Each ', '').toLowerCase()}s, {right.steps.length} steps</span>
          </div>
        </>
      )}
    </div>
  )
}
