import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function SearchVisualizer({ step }) {
  const { isDark } = useTheme()

  if (!step) {
    return (
      <div className="flex items-center justify-center h-48">
        <p style={{ color:'rgba(251,191,36,.4)', fontSize:14 }}>
          Enter a sorted array and target, then click Visualize
        </p>
      </div>
    )
  }

  const { array, low, high, mid, found, eliminated = [], target, description } = step
  const cellSize = Math.max(36, Math.min(60, Math.floor(540 / array.length) - 7))

  const getState = (idx) => {
    if (found >= 0 && idx === found)              return 'found'
    if (found === -2 || eliminated?.includes(idx)) return 'eliminated'
    if (idx === mid)                               return 'mid'
    if (idx === low)                               return 'low'
    if (idx === high)                              return 'high'
    if (low >= 0 && idx >= low && idx <= high)     return 'active'
    return 'default'
  }

  /* ── Spotlight-themed cell styles ── */
  const LIGHT_STYLE = {
    found:      { bg:'rgba(251,191,36,1)',    border:'rgba(255,255,255,.9)',  text:'#78350f', shadow:'0 0 40px rgba(251,191,36,1),0 0 80px rgba(251,191,36,.5)',  label:'FOUND',  anim:'found-glow 1s ease-in-out infinite' },
    eliminated: { bg:'rgba(15,23,42,.5)',     border:'rgba(30,41,59,.6)',     text:'rgba(100,116,139,.5)', shadow:'none', label:'', anim:'' },
    mid:        { bg:'rgba(253,230,138,.95)', border:'rgba(251,191,36,.9)',   text:'#78350f', shadow:'0 0 30px rgba(251,191,36,.9),0 0 60px rgba(251,191,36,.4)', label:'MID',    anim:'' },
    low:        { bg:'rgba(147,197,253,.9)',  border:'rgba(59,130,246,.8)',   text:'#1e3a8a', shadow:'0 0 20px rgba(96,165,250,.7)', label:'LOW',    anim:'' },
    high:       { bg:'rgba(252,165,165,.9)',  border:'rgba(239,68,68,.8)',    text:'#7f1d1d', shadow:'0 0 20px rgba(239,68,68,.6)',  label:'HIGH',   anim:'' },
    active:     { bg:'rgba(30,58,95,.7)',     border:'rgba(96,165,250,.5)',   text:'rgba(186,230,253,.9)', shadow:'0 0 10px rgba(96,165,250,.3)', label:'', anim:'' },
    default:    { bg:'rgba(15,23,42,.6)',     border:'rgba(30,41,59,.5)',     text:'rgba(71,85,105,.8)',   shadow:'none', label:'', anim:'' },
  }

  /* Spotlight position: centered on mid or found element */
  const spotlightIdx = found >= 0 ? found : mid >= 0 ? mid : -1
  const spotlightX = spotlightIdx >= 0
    ? `calc(${((spotlightIdx + 0.5) / array.length) * 100}%)`
    : '50%'

  return (
    <div className="w-full">
      {/* Spotlight beam following current element */}
      {spotlightIdx >= 0 && (
        <div className="relative w-full overflow-hidden" style={{ height: 30, pointerEvents: 'none' }}>
          <div className="absolute top-0" style={{
            left: spotlightX,
            transform: 'translateX(-50%)',
            width: cellSize * 2.5,
            height: 30,
            background: found >= 0
              ? 'linear-gradient(180deg,rgba(251,191,36,.4) 0%,rgba(251,191,36,.1) 100%)'
              : 'linear-gradient(180deg,rgba(255,255,255,.2) 0%,rgba(255,255,255,.05) 100%)',
            filter: 'blur(8px)',
            borderRadius: '0 0 40% 40%',
            transition: 'left 0.3s ease',
          }} />
        </div>
      )}

      {/* Target display */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold"
          style={{ background:'rgba(15,23,42,.7)', border:'1px solid rgba(96,165,250,.3)',
            color:'rgba(186,230,253,.9)', fontSize:13 }}>
          Searching for:
          <span className="px-2 py-0.5 rounded font-bold font-mono"
            style={{ background:'rgba(251,191,36,.2)', color:'#fbbf24', border:'1px solid rgba(251,191,36,.5)' }}>
            {target}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4 px-4 py-2.5 rounded-lg font-medium text-center min-h-[2.5rem] flex items-center justify-center"
        style={{ background:'rgba(15,23,42,.5)', backdropFilter:'blur(6px)',
          border:'1px solid rgba(96,165,250,.2)', color:'rgba(186,230,253,.9)', fontSize: 15 }}>
        {description || '—'}
      </div>

      {/* Array cells */}
      <div className="flex items-center justify-center flex-wrap gap-1.5 py-3 px-4">
        {array.map((val, idx) => {
          const state = getState(idx)
          const s = LIGHT_STYLE[state]
          const isKey = state === 'found' || state === 'mid'

          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              {/* Index */}
              <span style={{ color:'rgba(71,85,105,.6)', fontSize:10, fontFamily:'monospace' }}>
                {idx}
              </span>

              {/* Cell */}
              <motion.div
                animate={{ backgroundColor: s.bg, borderColor: s.border, scale: isKey ? 1.12 : 1 }}
                transition={{ duration: 0.22 }}
                className="rounded-xl flex items-center justify-center font-mono font-bold relative"
                style={{
                  width: cellSize, height: cellSize,
                  border: `2px solid ${s.border}`,
                  boxShadow: s.shadow,
                  color: s.text,
                  fontSize: cellSize >= 54 ? 20 : cellSize >= 44 ? 17 : 13,
                  animation: s.anim || undefined,
                  transition: 'box-shadow 0.2s',
                }}
              >
                {val}
                {/* State badge */}
                {s.label && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                      style={state === 'found'
                        ? { background:'rgba(251,191,36,.3)', color:'#fbbf24', border:'1px solid rgba(251,191,36,.5)' }
                        : state === 'mid'
                          ? { background:'rgba(253,230,138,.2)', color:'#fbbf24', border:'1px solid rgba(253,230,138,.4)' }
                          : state === 'low'
                            ? { background:'rgba(59,130,246,.2)', color:'#93c5fd', border:'1px solid rgba(59,130,246,.4)' }
                            : { background:'rgba(239,68,68,.2)',   color:'#fca5a5', border:'1px solid rgba(239,68,68,.4)' }
                      }>
                      {s.label}
                    </span>
                  </div>
                )}

                {/* Lens flare on found */}
                {state === 'found' && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute top-1 left-1 w-3 h-3 rounded-full"
                      style={{ background:'rgba(255,255,255,0.5)', filter:'blur(3px)' }} />
                  </div>
                )}
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Search range indicator */}
      {low >= 0 && high >= 0 && found === -1 && (
        <div className="mt-2 text-center font-mono" style={{ color:'rgba(96,165,250,.6)', fontSize:12 }}>
          Search range: [{low} … {high}]{mid >= 0 ? `  ·  mid = ${mid}` : ''}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-3 px-4">
        {[
          { label:'Dark',    bg:'rgba(15,23,42,.6)', b:'rgba(30,41,59,.5)' },
          { label:'Active',  bg:'rgba(30,58,95,.7)', b:'rgba(96,165,250,.5)' },
          { label:'Low/High',bg:'rgba(147,197,253,.9)',b:'rgba(59,130,246,.8)' },
          { label:'Mid',     bg:'rgba(253,230,138,.95)',b:'rgba(251,191,36,.9)' },
          { label:'Found',   bg:'rgba(251,191,36,1)', b:'rgba(255,255,255,.9)' },
        ].map(it=>(
          <div key={it.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background:it.bg, border:`1px solid ${it.b}` }} />
            <span style={{ fontSize:11, color:'rgba(96,165,250,.5)' }}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
