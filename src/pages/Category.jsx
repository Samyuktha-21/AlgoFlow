import { useParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import categories from '../data/categories.json'
import registry from '../data/algorithmRegistry.json'
import CategoryHeader from '../components/CategoryPage/CategoryHeader'
import AlgorithmList from '../components/CategoryPage/AlgorithmList'
import { useTheme } from '../context/ThemeContext'

/* Breadcrumb background per theme (now matching new visual identities) */
const CRUMB_BG = {
  water:    'linear-gradient(135deg,#1a0500 0%,#2d0a00 100%)',  // fire: dark red
  network:  'linear-gradient(135deg,#000000 0%,#0f1729 100%)',  // galaxy: keep
  forest:   'linear-gradient(135deg,#052e16 0%,#14532d 100%)',  // forest: keep
  light:    'linear-gradient(135deg,#0a0f1e 0%,#1a2540 100%)',  // storm: dark navy
  compass:  'linear-gradient(135deg,#0c2244 0%,#0a3261 100%)',  // ocean: deep blue
  puzzle:   'linear-gradient(135deg,#2d1060 0%,#3b1578 100%)',  // butterflies: purple
  chain:    'linear-gradient(135deg,#4a1025 0%,#6d1c40 100%)',  // blossoms: dark rose
  books:    'linear-gradient(135deg,#1e3a5f 0%,#1b4881 100%)',  // clouds: sky blue
  cabinet:  'linear-gradient(135deg,#052e16 0%,#0a4a25 100%)',  // tropical: deep green
  mountain: 'linear-gradient(135deg,#1c0a00 0%,#2d1000 100%)', // volcano: dark volcanic
  target:   'linear-gradient(135deg,#020617 0%,#0a1628 100%)', // aurora: deep dark
  blocks:   'linear-gradient(135deg,#0a1628 0%,#142860 100%)', // crystal: icy blue
  maze:     'linear-gradient(135deg,#020c04 0%,#061a0a 100%)', // fireflies: deep dark green
  circuit:  'linear-gradient(135deg,#000000 0%,#070b1a 100%)', // plasma: deep black
}

const CRUMB_ACCENT = {
  water:    '#f97316', network:  '#60a5fa', forest:   '#86efac',
  light:    '#93c5fd', compass:  '#38bdf8', puzzle:   '#f472b6',
  chain:    '#fda4af', books:    '#7dd3fc', cabinet:  '#4ade80',
  mountain: '#f97316', target:   '#4ade80', blocks:   '#67e8f9',
  maze:     '#fcd34d', circuit:  '#a78bfa',
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

  const crumbBg     = CRUMB_BG[category.theme]     || CRUMB_BG.network
  const crumbAccent = CRUMB_ACCENT[category.theme]  || '#60a5fa'

  return (
    <div>
      {/* ── Breadcrumb only (no separate title banner) ── */}
      <div style={{ background: crumbBg, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-2 text-sm">
          <Link to="/" className="text-white/55 hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={13} className="text-white/25" />
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
