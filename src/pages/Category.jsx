import { useParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import categories from '../data/categories.json'
import registry from '../data/algorithmRegistry.json'
import CategoryHeader from '../components/CategoryPage/CategoryHeader'
import AlgorithmList from '../components/CategoryPage/AlgorithmList'
import { useTheme } from '../context/ThemeContext'

/* Theme-coloured gradients for the name banner */
const BANNER_BG = {
  water:    'linear-gradient(135deg,#0c4a6e 0%,#0369a1 60%,#0ea5e9 100%)',
  network:  'linear-gradient(135deg,#000000 0%,#0f1729 60%,#1e3a5f 100%)',
  forest:   'linear-gradient(135deg,#052e16 0%,#14532d 60%,#166534 100%)',
  light:    'linear-gradient(135deg,#020617 0%,#0f172a 60%,#1e293b 100%)',
  compass:  'linear-gradient(135deg,#0c1445 0%,#1e3a5f 100%)',
  puzzle:   'linear-gradient(135deg,#1a0533 0%,#2e1065 60%,#4c1d95 100%)',
  chain:    'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%)',
  books:    'linear-gradient(135deg,#1c0a00 0%,#292524 60%,#44403c 100%)',
  cabinet:  'linear-gradient(135deg,#052e16 0%,#14532d 60%,#166534 100%)',
  mountain: 'linear-gradient(135deg,#0c1a2e 0%,#1e3a5f 60%,#334155 100%)',
  target:   'linear-gradient(135deg,#1c0404 0%,#450a0a 60%,#991b1b 100%)',
  blocks:   'linear-gradient(135deg,#1c0a00 0%,#431407 60%,#78350f 100%)',
  maze:     'linear-gradient(135deg,#040f06 0%,#052e16 60%,#14532d 100%)',
  circuit:  'linear-gradient(135deg,#000000 0%,#030712 60%,#0f1629 100%)',
}

/* Accent text color for the category name */
const BANNER_ACCENT = {
  water:    '#bae6fd', network:  '#60a5fa', forest:   '#86efac',
  light:    '#fde68a', compass:  '#fbbf24', puzzle:   '#c084fc',
  chain:    '#e2e8f0', books:    '#fde68a', cabinet:  '#86efac',
  mountain: '#bae6fd', target:   '#fca5a5', blocks:   '#fed7aa',
  maze:     '#86efac', circuit:  '#67e8f9',
}

/* Bottom accent border color */
const BANNER_BORDER = {
  water:    '#0ea5e9', network:  '#3b82f6', forest:   '#22c55e',
  light:    '#f59e0b', compass:  '#d97706', puzzle:   '#8b5cf6',
  chain:    '#64748b', books:    '#d97706', cabinet:  '#22c55e',
  mountain: '#64748b', target:   '#ef4444', blocks:   '#f97316',
  maze:     '#22c55e', circuit:  '#22d3ee',
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

  const bannerBg     = BANNER_BG[category.theme]     || BANNER_BG.network
  const bannerAccent = BANNER_ACCENT[category.theme]  || '#60a5fa'
  const bannerBorder = BANNER_BORDER[category.theme]  || '#3b82f6'

  return (
    <div>
      {/* ── Breadcrumb (normal flow, not absolute) ── */}
      <div style={{ background: bannerBg, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-2 text-sm">
          <Link to="/" className="text-white/55 hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={13} className="text-white/25" />
          <span className="font-semibold" style={{ color: bannerAccent }}>
            {category.name}
          </span>
        </div>
      </div>

      {/* ── Category name banner ── */}
      <div
        style={{
          background: bannerBg,
          borderBottom: `3px solid ${bannerBorder}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-10 text-center">
          <h1
            className="font-bold tracking-wide leading-tight"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              color: '#ffffff',
              textShadow: '0 4px 16px rgba(0,0,0,.45)',
              letterSpacing: '0.5px',
            }}
          >
            {category.name}
            <span style={{ color: bannerAccent }}> Algorithms</span>
          </h1>
        </div>
      </div>

      {/* ── Themed hero (description + scroll indicator only) ── */}
      <CategoryHeader category={category} />

      {/* ── Algorithm list ── */}
      <div className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
        <AlgorithmList categoryId={categoryId} algorithms={algorithms} category={category} />
      </div>
    </div>
  )
}
