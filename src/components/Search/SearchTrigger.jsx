import { Search } from 'lucide-react'
import { openSearch } from './searchOpener'

/* Hero variant — large, full-width */
export function SearchTriggerHero() {
  return (
    <button
      onClick={openSearch}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', maxWidth: 560, padding: '15px 22px',
        background: 'rgba(255,255,255,0.07)',
        border: '1.5px solid rgba(255,255,255,0.16)',
        borderRadius: 16, cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
        boxShadow: '0 0 32px rgba(99,102,241,0.15)',
        transition: 'all 0.25s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.11)'
        e.currentTarget.style.border = '1.5px solid rgba(99,102,241,0.55)'
        e.currentTarget.style.boxShadow = '0 0 44px rgba(99,102,241,0.38)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.16)'
        e.currentTarget.style.boxShadow = '0 0 32px rgba(99,102,241,0.15)'
      }}
    >
      <Search size={20} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 17, color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit' }}>
        Search 124 algorithms… (e.g. "Merge Sort", "BFS", "Dijkstra")
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        {['⌘', 'K'].map(k => (
          <kbd key={k} style={{
            padding: '3px 7px', background: 'rgba(255,255,255,0.09)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
            fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit',
          }}>{k}</kbd>
        ))}
      </div>
    </button>
  )
}

/* Header variant — compact */
export function SearchTriggerHeader() {
  return (
    <button
      onClick={openSearch}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 14px',
        background: 'rgba(255,255,255,0.09)',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 10, cursor: 'pointer',
        color: 'rgba(255,255,255,0.7)', fontSize: 13,
        fontFamily: 'inherit', transition: 'all 0.18s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.14)'
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.4)'
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.22)'
        e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
      }}
    >
      <Search size={14} />
      <span>Search…</span>
      <kbd style={{
        padding: '1px 6px', background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4,
        fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'inherit',
      }}>⌘K</kbd>
    </button>
  )
}
