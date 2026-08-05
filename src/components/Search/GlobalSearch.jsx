import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { searchIndex, categoryMeta } from '../../data/searchIndex'
import { Search, X } from 'lucide-react'

const POPULAR_IDS = [
  'bubbleSort', 'binarySearch', 'bfs', 'quickSort',
  'dijkstra', 'twoSum', 'nQueens', 'coinChangeDP',
]
const POPULAR = POPULAR_IDS.map(id => searchIndex.find(a => a.id === id)).filter(Boolean)

/* Mounted only while open (see App.jsx), so "reset on open" is just mount
   state and needs no effect. */
export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('')
  /* The highlighted row is stored with the query it belongs to, so typing
     re-homes the selection to the top by derivation rather than a setState. */
  const [pick, setPick] = useState({ query: '', index: 0 })
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const fuse = useMemo(() => new Fuse(searchIndex, {
    keys: [{ name: 'name', weight: 2 }, { name: 'categoryLabel', weight: 1 }],
    threshold: 0.38, minMatchCharLength: 1, includeScore: true,
  }), [])

  const results = useMemo(() => {
    if (!query.trim()) return POPULAR
    return fuse.search(query).slice(0, 10).map(r => r.item)
  }, [query, fuse])

  const selected = pick.query === query ? pick.index : 0
  const setSelected = next =>
    setPick(p => ({ query, index: typeof next === 'function' ? next(p.query === query ? p.index : 0) : next }))

  /* Focus the field once the modal is on screen */
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [])

  /* Escape closes. Ctrl+K is owned by App so the two don't fight over it. */
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const goTo = item => {
    navigate(item.path)
    onClose?.()
    setQuery('')
  }

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) goTo(results[selected])
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '14vh',
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, width: '90%', maxWidth: 600,
        background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 28px 80px rgba(0,0,0,0.65)',
        animation: 'searchIn 0.14s ease',
      }}>
        {/* Input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '15px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Search size={20} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search 124 algorithms…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#f1f5f9', fontSize: 17, fontFamily: 'inherit',
              caretColor: '#6366f1',
            }}
            autoComplete="off" spellCheck={false}
          />
          {query && (
            <button onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2 }}>
              <X size={15} />
            </button>
          )}
          <button onClick={onClose}
            style={{
              padding: '3px 9px', background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
              fontSize: 11, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
            }}>ESC</button>
        </div>

        {/* Section label */}
        <div style={{
          padding: '9px 20px 4px', fontSize: 11, fontWeight: 700,
          color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {query ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 'Popular'}
        </div>

        {/* Results */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#475569', fontSize: 15 }}>
              No algorithms found for "<strong style={{ color: '#94a3b8' }}>{query}</strong>"
            </div>
          ) : results.map((item, i) => {
            const meta = categoryMeta[item.category] || {}
            const active = i === selected
            return (
              <button
                key={item.id}
                onClick={() => goTo(item)}
                onMouseEnter={() => setSelected(i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '11px 20px', border: 'none',
                  borderLeft: `3px solid ${active ? '#6366f1' : 'transparent'}`,
                  background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', transition: 'all 0.1s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: `${meta.color || '#475569'}18`,
                  border: `1px solid ${meta.color || '#475569'}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {meta.icon || '📊'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ color: meta.color || '#94a3b8', fontSize: 12, marginTop: 2 }}>
                    {meta.label || item.category}
                  </div>
                </div>
                {active && <span style={{ color: '#6366f1', fontSize: 14, flexShrink: 0 }}>↵</span>}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '9px 20px', borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', gap: 18, color: '#334155', fontSize: 11,
        }}>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>ESC close</span>
        </div>
      </div>

      <style>{`@keyframes searchIn{from{opacity:0;transform:translateX(-50%)translateY(-8px)}to{opacity:1;transform:translateX(-50%)translateY(0)}}`}</style>
    </>
  )
}
