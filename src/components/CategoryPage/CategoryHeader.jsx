import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import ThemeScene from './ThemeScene'
import registry from '../../data/algorithmRegistry.json'

/* Accent + description text color per theme */
const THEME_STYLE = {
  water:    { accent: '#38bdf8', desc: 'rgba(224,242,254,.92)' },
  network:  { accent: '#60a5fa', desc: 'rgba(219,234,254,.92)' },
  forest:   { accent: '#4ade80', desc: 'rgba(220,252,231,.92)' },
  light:    { accent: '#fcd34d', desc: 'rgba(255,251,235,.95)' },
  compass:  { accent: '#fbbf24', desc: 'rgba(219,234,254,.90)' },
  puzzle:   { accent: '#a78bfa', desc: 'rgba(245,243,255,.90)' },
  chain:    { accent: '#94a3b8', desc: 'rgba(241,245,249,.90)' },
  books:    { accent: '#fb923c', desc: 'rgba(255,247,237,.92)' },
  cabinet:  { accent: '#4ade80', desc: 'rgba(220,252,231,.92)' },
  mountain: { accent: '#94a3b8', desc: 'rgba(241,245,249,.90)' },
  target:   { accent: '#f87171', desc: 'rgba(255,241,242,.92)' },
  blocks:   { accent: '#f59e0b', desc: 'rgba(255,247,237,.92)' },
  maze:     { accent: '#4ade80', desc: 'rgba(220,252,231,.92)' },
  circuit:  { accent: '#22d3ee', desc: 'rgba(236,254,255,.92)' },
}

export default function CategoryHeader({ category }) {
  const t = THEME_STYLE[category.theme] || THEME_STYLE.network

  const algoList = registry[category.id] || []
  const liveCount = algoList.filter(a => a.implemented).length

  return (
    <ThemeScene themeId={category.theme}>
      {/*
        70vh immersive hero — title is already in the banner above.
        Shows: description + stats + scroll indicator only.
      */}
      <div
        className="max-w-[1400px] mx-auto px-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: '70vh', paddingTop: '4rem', paddingBottom: '3.5rem' }}
      >
        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="font-light leading-relaxed mb-10 max-w-3xl"
          style={{
            fontSize: 'clamp(17px, 2.2vw, 23px)',
            color: t.desc,
            textShadow: '0 1px 4px rgba(0,0,0,.4)',
          }}
        >
          {category.description}
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-8 mb-12"
        >
          {[
            { value: category.count,   label: 'Total',    color: t.accent },
            { value: liveCount || '–', label: 'Live',     color: '#4ade80' },
            { value: 'Java · C · C++', label: 'Languages',color: 'rgba(255,255,255,.75)' },
          ].map((stat, i, arr) => (
            <div key={stat.label} className="flex items-center gap-8">
              <div className="text-center">
                <div className="font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs uppercase tracking-wider mt-0.5"
                  style={{ color: 'rgba(255,255,255,.38)' }}>
                  {stat.label}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-8" style={{ background: 'rgba(255,255,255,.12)' }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="text-xs tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,.3)' }}>
            Scroll to explore
          </span>
          <ChevronDown size={20}
            style={{ color: 'rgba(255,255,255,.35)', animation: 'bounce-down 1.6s ease-in-out infinite' }} />
        </motion.div>
      </div>
    </ThemeScene>
  )
}
