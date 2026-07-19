import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

/* ─── State → visual style ─────────────────────── */
function getState(idx, { comparing, swapping, sorted, pivot, current }) {
  if (sorted?.includes(idx))    return 'sorted'
  if (swapping?.includes(idx))  return 'swapping'
  if (comparing?.includes(idx)) return 'comparing'
  if (pivot === idx)            return 'pivot'
  if (current === idx)          return 'current'
  return 'default'
}


/* ─── Snow / Icicle column (water=snow theme) ───── */
const SNOW_STYLES = {
  default:   { bg:'linear-gradient(180deg,#e0f2fe,#7dd3fc,#0284c7)',  glow:'0 0 12px rgba(125,211,252,.5)' },
  comparing: { bg:'linear-gradient(180deg,#fef3c7,#fbbf24,#d97706)',  glow:'0 0 22px rgba(251,191,36,.8)' },
  swapping:  { bg:'linear-gradient(180deg,#fce7f3,#f472b6,#be185d)',  glow:'0 0 22px rgba(244,114,182,.8)' },
  sorted:    { bg:'linear-gradient(180deg,#dcfce7,#86efac,#16a34a)',  glow:'0 0 14px rgba(134,239,172,.6)' },
  pivot:     { bg:'linear-gradient(180deg,#ede9fe,#a78bfa,#7c3aed)',  glow:'0 0 18px rgba(167,139,250,.7)' },
  current:   { bg:'linear-gradient(180deg,#dbeafe,#60a5fa,#2563eb)',  glow:'0 0 16px rgba(96,165,250,.6)' },
}
function SnowBar({ val, height, barW, state, showLabel, idx, showIdx }) {
  const s = SNOW_STYLES[state] || SNOW_STYLES.default
  const fs = barW >= 46 ? 24 : barW >= 34 ? 20 : barW >= 22 ? 15 : 11
  return (
    <div className="flex flex-col items-center" style={{ gap: 3 }}>
      {showLabel && (
        <span className="font-mono font-bold select-none"
          style={{ color: state === 'default' ? '#0369a1' : '#0f172a', fontSize: fs,
            textShadow: '0 1px 3px rgba(255,255,255,.6)' }}>
          {val}
        </span>
      )}
      <motion.div
        animate={{ height }}
        transition={{ duration: 0.28, type: 'spring', stiffness: 300, damping: 25 }}
        className="relative flex-shrink-0"
        style={{ width: barW, borderRadius: '6px 6px 2px 2px', background: s.bg, boxShadow: s.glow }}
      >
        {/* Icicle tip */}
        <div className="absolute" style={{
          top: -10, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: `${Math.max(4, barW * 0.18)}px solid transparent`,
          borderRight: `${Math.max(4, barW * 0.18)}px solid transparent`,
          borderBottom: '10px solid rgba(255,255,255,0.75)',
        }} />
        {/* Sheen */}
        <div className="absolute top-0 left-0 bottom-0"
          style={{ width:'28%', background:'linear-gradient(90deg,rgba(255,255,255,.3),rgba(255,255,255,.04))', borderRadius:'inherit' }} />
      </motion.div>
      {showIdx && (
        <span className="font-mono select-none"
          style={{ color: '#0369a1', fontSize: barW >= 40 ? 12 : 10 }}>
          {idx}
        </span>
      )}
    </div>
  )
}

/* ─── Generic (dark) bar styles ─────────────────── */
const DARK = {
  default:   { bg: '#374151', border: '#4B5563' },
  comparing: { bg: '#F59E0B', border: '#D97706' },
  swapping:  { bg: '#EF4444', border: '#DC2626' },
  sorted:    { bg: '#10B981', border: '#059669' },
  pivot:     { bg: '#8B5CF6', border: '#7C3AED' },
  current:   { bg: '#3B82F6', border: '#2563EB' },
}
const LIGHT = {
  default:   { bg: '#E5E7EB', border: '#D1D5DB' },
  comparing: { bg: '#FCD34D', border: '#F59E0B' },
  swapping:  { bg: '#F87171', border: '#EF4444' },
  sorted:    { bg: '#34D399', border: '#10B981' },
  pivot:     { bg: '#A78BFA', border: '#8B5CF6' },
  current:   { bg: '#60A5FA', border: '#3B82F6' },
}

/* ─── Water column component ────────────────────── */
function GenericBar({ val, height, barW, state, isDark, showLabel, idx, showIdx }) {
  const palette = isDark ? DARK : LIGHT
  const c = palette[state] || palette.default
  const fs = barW >= 46 ? 22 : barW >= 34 ? 18 : barW >= 22 ? 14 : 10

  return (
    <motion.div className="flex flex-col items-center" style={{ gap: 3 }}>
      {showLabel && (
        <span className={`font-mono font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          style={{ fontSize: fs }}>
          {val}
        </span>
      )}
      <motion.div
        animate={{ height, backgroundColor: c.bg }}
        transition={{ duration: 0.24 }}
        className="rounded-t-md flex-shrink-0 flex items-end justify-center"
        style={{ width: barW, border: `2px solid ${c.border}`,
          boxShadow: state !== 'default' ? `0 0 10px ${c.bg}99` : 'none',
          minHeight: 14 }}
      />
      {showIdx && (
        <span className={`font-mono ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
          style={{ fontSize: Math.max(9, fs * 0.6) }}>
          {idx}
        </span>
      )}
    </motion.div>
  )
}

/* ─── Description overlay ────────────────────────── */
function Desc({ text, isWater, isDark }) {
  return (
    <div className="mb-3 px-4 py-2.5 rounded-lg font-medium text-center min-h-[2.5rem] flex items-center justify-center"
      style={isWater ? {
        background: 'rgba(3,105,161,.35)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(125,211,252,.25)',
        color: 'rgba(224,242,254,.92)',
        textShadow: '0 1px 3px rgba(0,0,0,.4)',
        fontSize: 15,
      } : { background: isDark ? 'rgba(31,41,55,.6)' : 'rgba(255,255,255,.7)', color: isDark ? '#d1d5db' : '#374151', fontSize: 15 }}>
      {text || '—'}
    </div>
  )
}

/* ─── Main export ────────────────────────────────── */
export default function SortVisualizer({ step, themeId }) {
  const { isDark } = useTheme()
  const isSnow  = themeId === 'water'   // water theme is now snow/blizzard

  if (!step) {
    return (
      <div className="flex items-center justify-center h-48">
        <p style={{ color: isSnow ? '#0369a1' : isDark ? '#6b7280' : '#9ca3af', fontSize: 14 }}>
          Enter an array and click Visualize to start
        </p>
      </div>
    )
  }

  const { array, comparing = [], swapping = [], sorted = [], pivot = null, current = null, description } = step
  const maxVal = Math.max(...array, 1)
  const barW = Math.max(18, Math.min(56, Math.floor(560 / array.length) - 4))
  const maxH = 220

  const showLabel = array.length <= 25
  const showIdx   = array.length <= 30

  return (
    <div className="w-full">
      <Desc text={description} isWater={isSnow} isDark={isDark} />

      {/* Bars */}
      <div className="flex items-end justify-center gap-1 py-3 px-4"
        style={{ minHeight: maxH + 60 }}>
        {array.map((val, idx) => {
          const state = getState(idx, { comparing, swapping, sorted, pivot, current })
          const height = Math.max(10, Math.floor((val / maxVal) * maxH))

          return isSnow
            ? <SnowBar key={idx} val={val} height={height} barW={barW} state={state}
                showLabel={showLabel} idx={idx} showIdx={showIdx} />
            : <GenericBar key={idx} val={val} height={height} barW={barW} state={state}
                isDark={isDark} showLabel={showLabel} idx={idx} showIdx={showIdx} />
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-1 px-4">
        {isSnow ? [
          { label: 'Unsorted',  bg: SNOW_STYLES.default.bg },
          { label: 'Comparing', bg: SNOW_STYLES.comparing.bg },
          { label: 'Swapping',  bg: SNOW_STYLES.swapping.bg },
          { label: 'Sorted',    bg: SNOW_STYLES.sorted.bg },
        ].map(({ label, bg }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: bg }} />
            <span style={{ fontSize: 11, color: '#0369a1' }}>{label}</span>
          </div>
        )) : [
          { label: 'Default',   bg: '#E5E7EB', b: '#D1D5DB' },
          { label: 'Comparing', bg: '#FCD34D', b: '#F59E0B' },
          { label: 'Swapping',  bg: '#F87171', b: '#EF4444' },
          { label: 'Sorted',    bg: '#34D399', b: '#10B981' },
        ].map(it => (
          <div key={it.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: it.bg, border: `1px solid ${it.b}` }} />
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
