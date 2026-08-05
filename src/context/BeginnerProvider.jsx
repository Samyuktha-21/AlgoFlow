import { useState, useEffect } from 'react'
import { BeginnerContext, useBeginner } from './BeginnerContext'

export function BeginnerProvider({ children }) {
  // Default: beginner = true. Persist in localStorage.
  const [beginner, setBeginner] = useState(() => {
    try {
      const saved = localStorage.getItem('algoflow-beginner-mode')
      return saved !== null ? saved === 'true' : true   // default ON
    } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem('algoflow-beginner-mode', String(beginner)) } catch { /* storage unavailable */ }
  }, [beginner])

  return (
    <BeginnerContext.Provider value={{ beginner, setBeginner }}>
      {children}
    </BeginnerContext.Provider>
  )
}

/* Compact toggle for Header navbar — single source of truth */
export function BeginnerToggleCompact() {
  const { beginner, setBeginner } = useBeginner()
  return (
    <button
      type="button"
      onClick={() => setBeginner(b => !b)}
      title={
        beginner
          ? 'Beginner mode: plain-English explanations. Click to switch to Advanced mode.'
          : 'Advanced mode: CS terminology. Click to switch to Beginner mode.'
      }
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '7px 14px',
        background: beginner
          ? 'linear-gradient(135deg,#10b981,#059669)'
          : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
        border: 'none', borderRadius: 24, cursor: 'pointer',
        transition: 'all 0.25s', userSelect: 'none',
        boxShadow: beginner ? '0 0 18px rgba(16,185,129,0.55)' : '0 0 18px rgba(79,70,229,0.5)',
      }}
    >
      <span style={{ fontSize: 15 }}>{beginner ? '🧒' : '🎓'}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap' }}>
        {beginner ? 'Beginner' : 'Advanced'}
      </span>
      <div style={{
        width: 28, height: 16,
        background: beginner ? '#34d399' : '#475569',
        borderRadius: 8, position: 'relative', transition: 'background 0.25s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: beginner ? 14 : 2,
          width: 12, height: 12,
          background: '#fff', borderRadius: '50%', transition: 'left 0.25s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </button>
  )
}

/* Banner toggle — kept for backward compatibility but no longer placed on algorithm page */
export function BeginnerToggleBanner() {
  const { beginner, setBeginner } = useBeginner()
  return (
    <div
      onClick={() => setBeginner(b => !b)}
      title={
        beginner
          ? 'Beginner mode: plain-English explanations. Click for Advanced mode.'
          : 'Advanced mode: CS terminology. Click for Beginner mode.'
      }
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '8px 18px',
        background: beginner ? 'rgba(52,211,153,0.14)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${beginner ? 'rgba(52,211,153,0.42)' : 'rgba(255,255,255,0.16)'}`,
        borderRadius: 28, cursor: 'pointer', transition: 'all 0.3s', userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 18 }}>{beginner ? '🧒' : '🎓'}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: beginner ? '#34d399' : 'rgba(255,255,255,0.7)' }}>
        {beginner ? '🧒 Beginner Mode' : '🎓 Advanced Mode'}
      </span>
      <div style={{
        width: 36, height: 20,
        background: beginner ? '#34d399' : '#475569',
        borderRadius: 10, position: 'relative', transition: 'background 0.3s',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: beginner ? 19 : 3,
          width: 14, height: 14,
          background: '#fff', borderRadius: '50%', transition: 'left 0.3s ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  )
}
