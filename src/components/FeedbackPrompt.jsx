import { useCallback, useEffect, useRef, useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase/config'

const DISPLAY = "'General Sans', 'Inter', sans-serif"
const MONO = "'IBM Plex Mono', monospace"
const ACCENT = '#f5811f'

const DONE_KEY = 'af-feedback-submitted'
const SNOOZE_KEY = 'af-feedback-snooze'
const SNOOZE_DAYS = 7
const MIN_TIME_ON_SITE_MS = 30_000

function storageGet(k) { try { return localStorage.getItem(k) } catch { return null } }
function storageSet(k, v) { try { localStorage.setItem(k, v) } catch { /* storage unavailable */ } }

function shouldAsk() {
  if (storageGet(DONE_KEY)) return false
  const snooze = Number(storageGet(SNOOZE_KEY) || 0)
  return !snooze || Date.now() - snooze > SNOOZE_DAYS * 24 * 60 * 60 * 1000
}

function YesNo({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {[['yes', 'Yes'], ['no', 'No']].map(([v, label]) => (
        <button key={v} type="button" onClick={() => onChange(v)}
          style={{
            flex: 1, padding: '0.5rem 0', borderRadius: 8, cursor: 'pointer',
            fontFamily: DISPLAY, fontSize: '0.85rem', fontWeight: 600,
            border: `1px solid ${value === v ? ACCENT : 'rgba(255,255,255,0.15)'}`,
            background: value === v ? 'rgba(245,129,31,0.15)' : 'transparent',
            color: value === v ? '#fdba74' : '#a3a3a3',
            transition: 'all 0.15s ease',
          }}>
          {label}
        </button>
      ))}
    </div>
  )
}

export default function FeedbackPrompt() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverStar, setHoverStar] = useState(0)
  const [foundIt, setFoundIt] = useState(null)
  const [satisfied, setSatisfied] = useState(null)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  /* Stamped on mount rather than during render — reading the clock while
     rendering is not a pure operation. */
  const mountedAt = useRef(0)
  const triggeredRef = useRef(false)

  const dismiss = useCallback(() => {
    storageSet(SNOOZE_KEY, String(Date.now()))
    setOpen(false)
  }, [])

  /* Exit intent: cursor leaves through the top of the viewport (heading for
     the close button / tab bar). Asks once, after ≥30s on the site. */
  useEffect(() => {
    mountedAt.current = Date.now()
    if (!firebaseEnabled || !shouldAsk()) return
    const onMouseOut = e => {
      if (triggeredRef.current) return
      if (e.relatedTarget) return
      if (e.clientY > 0) return
      if (Date.now() - mountedAt.current < MIN_TIME_ON_SITE_MS) return
      triggeredRef.current = true
      setOpen(true)
    }
    document.addEventListener('mouseout', onMouseOut)
    return () => document.removeEventListener('mouseout', onMouseOut)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismiss])

  const submit = async () => {
    if (!rating || sending) return
    setSending(true)
    try {
      await addDoc(collection(db, 'feedback'), {
        rating,
        foundIt: foundIt === 'yes',
        satisfied: satisfied === 'yes',
        comment: comment.trim().slice(0, 500),
        page: window.location.pathname,
        createdAt: serverTimestamp(),
      })
      storageSet(DONE_KEY, '1')
      setSent(true)
      setTimeout(() => setOpen(false), 1800)
    } catch (e) {
      console.warn('Feedback submit failed:', e.message)
      storageSet(SNOOZE_KEY, String(Date.now()))
      setOpen(false)
    }
    setSending(false)
  }

  if (!open) return null

  return (
    <div onClick={dismiss} role="dialog" aria-modal="true" aria-label="Rate AlgoFlow"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        animation: 'af-fb-fade 0.25s ease-out',
      }}>
      <style>{`
        @keyframes af-fb-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes af-fb-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400, background: '#161616',
          border: '1px solid rgba(245,129,31,0.25)', borderRadius: 16,
          padding: '1.5rem', animation: 'af-fb-rise 0.3s ease-out',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧡</div>
            <div style={{ fontFamily: DISPLAY, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Thank you!
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: '0.85rem', color: '#a3a3a3', marginTop: 4 }}>
              Your feedback helps AlgoFlow get better.
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontFamily: DISPLAY, fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Before you go… ✨
              </h3>
              <button type="button" onClick={dismiss} aria-label="Close"
                style={{ background: 'none', border: 'none', color: '#6b6b6b', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1 }}>
                ✕
              </button>
            </div>
            <p style={{ fontFamily: DISPLAY, fontSize: '0.85rem', color: '#a3a3a3', margin: '0.4rem 0 1.1rem' }}>
              30 seconds of your time makes AlgoFlow better for every learner.
            </p>

            {/* rating */}
            <div style={{ fontFamily: DISPLAY, fontSize: '0.82rem', fontWeight: 600, color: '#d4d4d4', marginBottom: '0.4rem' }}>
              How would you rate AlgoFlow?
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.1rem' }} onMouseLeave={() => setHoverStar(0)}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHoverStar(s)}
                  aria-label={`${s} star${s > 1 ? 's' : ''}`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                    fontSize: '1.7rem', lineHeight: 1,
                    color: s <= (hoverStar || rating) ? ACCENT : 'rgba(255,255,255,0.18)',
                    transform: s <= hoverStar ? 'scale(1.15)' : 'scale(1)',
                    transition: 'color 0.12s ease, transform 0.12s ease',
                  }}>
                  ★
                </button>
              ))}
            </div>

            <div style={{ fontFamily: DISPLAY, fontSize: '0.82rem', fontWeight: 600, color: '#d4d4d4', marginBottom: '0.4rem' }}>
              Did you find what you were looking for?
            </div>
            <div style={{ marginBottom: '1.1rem' }}>
              <YesNo value={foundIt} onChange={setFoundIt} />
            </div>

            <div style={{ fontFamily: DISPLAY, fontSize: '0.82rem', fontWeight: 600, color: '#d4d4d4', marginBottom: '0.4rem' }}>
              Are you satisfied with the experience?
            </div>
            <div style={{ marginBottom: '1.1rem' }}>
              <YesNo value={satisfied} onChange={setSatisfied} />
            </div>

            <textarea
              value={comment} onChange={e => setComment(e.target.value)} maxLength={500}
              placeholder="Anything we should improve? (optional)"
              rows={2}
              style={{
                width: '100%', resize: 'none', borderRadius: 8, padding: '0.6rem 0.75rem',
                fontFamily: DISPLAY, fontSize: '0.83rem', color: '#f1f5f9',
                background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.12)',
                outline: 'none', marginBottom: '1.1rem', boxSizing: 'border-box',
              }}
            />

            <button type="button" onClick={submit} disabled={!rating || sending}
              style={{
                width: '100%', padding: '0.7rem 0', borderRadius: 10, border: 'none',
                fontFamily: MONO, fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.04em',
                cursor: rating ? 'pointer' : 'not-allowed',
                background: rating ? `linear-gradient(135deg, #ffb347, ${ACCENT})` : 'rgba(255,255,255,0.08)',
                color: rating ? '#1a1a1a' : '#6b6b6b',
                transition: 'all 0.2s ease',
              }}>
              {sending ? 'Sending…' : 'Send feedback'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
