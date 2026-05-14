import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CARD_ANIMATIONS } from './CardAnimations'

const THEME_BORDER_COLORS = {
  compass:  'rgba(201,162,39,0.5)',
  water:    'rgba(56,189,248,0.5)',
  light:    'rgba(251,191,36,0.5)',
  puzzle:   'rgba(168,85,247,0.5)',
  chain:    'rgba(148,163,184,0.4)',
  books:    'rgba(217,119,6,0.5)',
  cabinet:  'rgba(74,222,128,0.5)',
  forest:   'rgba(34,197,94,0.5)',
  mountain: 'rgba(148,163,184,0.4)',
  network:  'rgba(96,165,250,0.6)',
  target:   'rgba(248,113,113,0.5)',
  blocks:   'rgba(245,158,11,0.5)',
  maze:     'rgba(74,222,128,0.5)',
  circuit:  'rgba(34,211,238,0.6)',
}

const THEME_TEXT_COLORS = {
  compass:  '#fbbf24', water:    '#38bdf8', light:    '#fcd34d',
  puzzle:   '#a78bfa', chain:    '#94a3b8', books:    '#fb923c',
  cabinet:  '#4ade80', forest:   '#22c55e', mountain: '#94a3b8',
  network:  '#60a5fa', target:   '#f87171', blocks:   '#f59e0b',
  maze:     '#4ade80', circuit:  '#22d3ee',
}

export default function CategoryCard({ category, index }) {
  const AnimComp = CARD_ANIMATIONS[category.theme]
  const borderColor = THEME_BORDER_COLORS[category.theme] || 'rgba(255,255,255,0.15)'
  const accentColor = THEME_TEXT_COLORS[category.theme] || '#60a5fa'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ scale: 1.06, y: -8 }}
      className={`card-glow-${category.theme} cursor-pointer`}
      style={{ transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
    >
      <Link
        to={`/category/${category.id}`}
        className="glass-card flex flex-col h-full overflow-hidden group"
        style={{ minHeight: 280 }}
        aria-label={`${category.name} — ${category.count} algorithms`}
      >
        {/* Theme animation preview */}
        <div className="h-24 mx-3 mt-3 rounded-xl overflow-hidden flex-shrink-0">
          {AnimComp ? <AnimComp /> : (
            <div className="w-full h-full rounded-xl"
              style={{ background: `linear-gradient(135deg, ${borderColor}, rgba(0,0,0,0.5))` }} />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{category.name}</h3>
              <span className="text-xs font-semibold mt-0.5 block" style={{ color: accentColor }}>
                {category.count} algorithms
              </span>
            </div>
            {/* Accent dot cluster instead of emoji */}
            <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
              {[0,1,2].map(i => (
                <div key={i} className="rounded-full"
                  style={{ width: 5, height: 5, background: accentColor, opacity: 0.5 + i * 0.2 }} />
              ))}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-gray-400 flex-1 line-clamp-2">
            {category.description}
          </p>

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1 flex-wrap">
              {category.algorithms.slice(0, 2).map(id => (
                <span key={id} className="text-xs px-1.5 py-0.5 rounded"
                  style={{ background:'rgba(255,255,255,0.07)', color:'#94a3b8' }}>
                  {id.replace(/([A-Z])/g,' $1').trim().split(' ').slice(0,2).join(' ')}
                </span>
              ))}
            </div>
            <ArrowRight size={15} className="text-gray-600 group-hover:text-white transition-colors flex-shrink-0"
              style={{ color: accentColor, opacity: 0.6 }} />
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-0.5 w-full opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)` }} />
      </Link>
    </motion.div>
  )
}
