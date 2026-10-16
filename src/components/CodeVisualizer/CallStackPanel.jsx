import { AnimatePresence, motion } from 'framer-motion'
import { describe } from './analyze'

/* Frames drawn top-of-stack first; each push/pop animates in/out so the
   stack "movement" of recursion is visible while stepping. */
export default function CallStackPanel({ step }) {
  const frames = step ? [...step.frames].reverse() : []
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <AnimatePresence initial={false}>
        {frames.map((fr, i) => {
          const isTop = i === 0
          const depth = frames.length - 1 - i
          const vars = Object.entries(fr.vars)
          return (
            <motion.div
              key={`${depth}-${fr.name}`}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              style={{
                borderRadius: 10,
                border: `2px solid ${isTop ? '#38bdf8' : '#334155'}`,
                background: isTop ? 'rgba(56,189,248,0.10)' : '#0b1220',
                padding: '8px 10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: vars.length ? 6 : 0 }}>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>
                  {fr.name === 'Global' ? 'Global frame' : `${fr.name}()`}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>line {fr.line}</span>
                {isTop && <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8' }}>ACTIVE</span>}
              </div>
              {vars.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 10, rowGap: 2, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                  {vars.map(([k, v]) => (
                    <div key={k} style={{ display: 'contents' }}>
                      <span style={{ color: '#a78bfa' }}>{k}</span>
                      <span style={{ color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{describe(v, step.heap)}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
      {frames.length === 0 && <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No frames yet</span>}
    </div>
  )
}
