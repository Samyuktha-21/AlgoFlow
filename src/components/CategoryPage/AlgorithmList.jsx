import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const THEME_ACCENTS = {
  water:    { color:'#38bdf8', bg:'rgba(56,189,248,0.08)',  border:'rgba(56,189,248,0.25)' },
  network:  { color:'#60a5fa', bg:'rgba(96,165,250,0.08)',  border:'rgba(96,165,250,0.25)' },
  forest:   { color:'#4ade80', bg:'rgba(74,222,128,0.08)',  border:'rgba(74,222,128,0.25)' },
  light:    { color:'#fcd34d', bg:'rgba(252,211,77,0.08)',  border:'rgba(252,211,77,0.25)' },
  compass:  { color:'#fbbf24', bg:'rgba(251,191,36,0.08)',  border:'rgba(251,191,36,0.25)' },
  puzzle:   { color:'#a78bfa', bg:'rgba(167,139,250,0.08)', border:'rgba(167,139,250,0.25)' },
  chain:    { color:'#94a3b8', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.2)' },
  books:    { color:'#fb923c', bg:'rgba(251,146,60,0.08)',  border:'rgba(251,146,60,0.25)' },
  cabinet:  { color:'#4ade80', bg:'rgba(74,222,128,0.08)',  border:'rgba(74,222,128,0.25)' },
  mountain: { color:'#94a3b8', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.2)' },
  target:   { color:'#f87171', bg:'rgba(248,113,113,0.08)', border:'rgba(248,113,113,0.25)' },
  blocks:   { color:'#f59e0b', bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.25)' },
  maze:     { color:'#4ade80', bg:'rgba(74,222,128,0.08)',  border:'rgba(74,222,128,0.25)' },
  circuit:  { color:'#22d3ee', bg:'rgba(34,211,238,0.08)',  border:'rgba(34,211,238,0.25)' },
}

export default function AlgorithmList({ categoryId, algorithms, category }) {
  const { isDark } = useTheme()
  const acc = THEME_ACCENTS[category?.theme] || THEME_ACCENTS.network

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      {/* Section heading */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 rounded-full" style={{ background: acc.color }} />
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            All Algorithms
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {algorithms.filter(a => a.implemented).length} live · {algorithms.filter(a => !a.implemented).length} coming soon
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {algorithms.map((algo, i) => (
          <motion.div
            key={algo.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            {algo.implemented ? (
              <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.15 }}>
                <Link
                  to={`/algorithm/${categoryId}/${algo.id}`}
                  className="group flex items-center justify-between p-4 rounded-xl border transition-all"
                  style={{
                    background: acc.bg,
                    borderColor: acc.border,
                    boxShadow: 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${acc.color}30`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: acc.color, boxShadow: `0 0 6px ${acc.color}` }} />
                    <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {algo.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${acc.color}22`, color: acc.color }}>
                      ✨ Live
                    </span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 flex-shrink-0"
                      style={{ color: acc.color, opacity: 0.7 }} />
                  </div>
                </Link>
              </motion.div>
            ) : (
              <div className={`flex items-center justify-between p-4 rounded-xl border ${
                isDark
                  ? 'bg-gray-800/40 border-gray-700/40'
                  : 'bg-white/50 border-gray-200/70'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {algo.name}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-gray-700 text-gray-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  Soon
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
