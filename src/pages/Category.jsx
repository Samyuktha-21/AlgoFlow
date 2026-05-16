import { useParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import categories from '../data/categories.json'
import registry from '../data/algorithmRegistry.json'
import CategoryHeader from '../components/CategoryPage/CategoryHeader'
import AlgorithmList from '../components/CategoryPage/AlgorithmList'
import { useTheme } from '../context/ThemeContext'

/* Breadcrumb background per theme */
const CRUMB_BG = {
  water:    'linear-gradient(135deg,#bae6fd 0%,#7dd3fc 100%)',  // snow: light sky blue
  network:  'linear-gradient(135deg,#000000 0%,#0f1729 100%)',
  forest:   'linear-gradient(135deg,#052e16 0%,#14532d 100%)',
  light:    'linear-gradient(135deg,#0a0f1e 0%,#1a2540 100%)',
  compass:  'linear-gradient(135deg,#0c2244 0%,#0a3261 100%)',
  puzzle:   'linear-gradient(135deg,#f3e8ff 0%,#e9d5ff 100%)',  // butterflies: light purple
  chain:    'linear-gradient(135deg,#fce7f3 0%,#fbcfe8 100%)',  // blossoms: light pink
  books:    'linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)',  // clouds: very light blue
  cabinet:  'linear-gradient(135deg,#052e16 0%,#0a4a25 100%)',
  mountain: 'linear-gradient(135deg,#1c0a00 0%,#2d1000 100%)',
  target:   'linear-gradient(135deg,#020617 0%,#0a1628 100%)',
  blocks:   'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',  // highway: dark city
  maze:     'linear-gradient(135deg,#4a0020 0%,#7f1d4a 100%)',  // hearts: deep rose
  circuit:  'linear-gradient(135deg,#000000 0%,#070b1a 100%)',
}

/* Breadcrumb accent text — dark for light backgrounds, light for dark */
const CRUMB_ACCENT = {
  water:    '#0c4a6e', network:  '#60a5fa', forest:   '#86efac',
  light:    '#93c5fd', compass:  '#38bdf8', puzzle:   '#6d28d9',
  chain:    '#be185d', books:    '#1e40af', cabinet:  '#4ade80',
  mountain: '#f97316', target:   '#4ade80', blocks:   '#fbbf24',
  maze:     '#f9a8d4', circuit:  '#a78bfa',
}

/* Text color for "Home" breadcrumb link */
const CRUMB_HOME = {
  water: '#0369a1', puzzle: '#5b21b6', chain: '#9f1239', books: '#1e3a5f',
}

export default function Category() {
  const { categoryId } = useParams()
  const { isDark } = useTheme()

  const category = categories.find(c => c.id === categoryId)
  const algorithms = registry[categoryId] || []

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Category not found
        </h2>
        <Link to="/" className="text-blue-500 hover:underline">Back to Home</Link>
      </div>
    )
  }

  const LIGHT_THEMES = new Set(['water', 'puzzle', 'chain', 'books'])
  const isLight      = LIGHT_THEMES.has(category.theme)
  const crumbBg      = CRUMB_BG[category.theme]    || CRUMB_BG.network
  const crumbAccent  = CRUMB_ACCENT[category.theme] || '#60a5fa'
  const crumbHome    = isLight
    ? (CRUMB_HOME[category.theme] || '#334155')
    : 'rgba(255,255,255,.55)'
  const crumbDivider = isLight ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.25)'
  const crumbBorder  = isLight ? '1px solid rgba(0,0,0,.1)' : '1px solid rgba(255,255,255,.08)'

  return (
    <div>
      {/* ── Breadcrumb only (no separate title banner) ── */}
      <div style={{ background: crumbBg, borderBottom: crumbBorder }}>
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-2 text-sm">
          <Link to="/"
            style={{ color: crumbHome }}
            className="hover:opacity-80 transition-opacity">
            Home
          </Link>
          <ChevronRight size={13} style={{ color: crumbDivider }} />
          <span className="font-semibold" style={{ color: crumbAccent }}>
            {category.name}
          </span>
        </div>
      </div>

      {/* ── Full-viewport themed hero (title + description + stats) ── */}
      <CategoryHeader category={category} />

      {/* ── Algorithm list (visible only after scrolling) ── */}
      <div className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
        <AlgorithmList categoryId={categoryId} algorithms={algorithms} category={category} />
      </div>
    </div>
  )
}
