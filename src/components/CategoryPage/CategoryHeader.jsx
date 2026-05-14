import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import ThemeScene from './ThemeScene'
import registry from '../../data/algorithmRegistry.json'

/* Colors per new visual theme identity */
const THEME_STYLE = {
  water:    { accent: '#f97316', title: '#ffffff',  desc: 'rgba(254,215,170,.92)' },  // fire
  network:  { accent: '#60a5fa', title: '#ffffff',  desc: 'rgba(219,234,254,.92)' },  // galaxy
  forest:   { accent: '#4ade80', title: '#ffffff',  desc: 'rgba(220,252,231,.92)' },  // forest
  light:    { accent: '#93c5fd', title: '#ffffff',  desc: 'rgba(219,234,254,.95)' },  // storm
  compass:  { accent: '#38bdf8', title: '#ffffff',  desc: 'rgba(224,242,254,.92)' },  // ocean
  puzzle:   { accent: '#f472b6', title: '#fde7f3',  desc: 'rgba(252,231,243,.90)' },  // butterflies
  chain:    { accent: '#fda4af', title: '#fff1f2',  desc: 'rgba(255,228,230,.92)' },  // blossoms
  books:    { accent: '#7dd3fc', title: '#ffffff',  desc: 'rgba(224,242,254,.92)' },  // clouds
  cabinet:  { accent: '#4ade80', title: '#ffffff',  desc: 'rgba(220,252,231,.92)' },  // tropical
  mountain: { accent: '#f97316', title: '#ffffff',  desc: 'rgba(254,215,170,.92)' },  // volcano
  target:   { accent: '#4ade80', title: '#ffffff',  desc: 'rgba(220,252,231,.90)' },  // aurora
  blocks:   { accent: '#67e8f9', title: '#e0f7fa',  desc: 'rgba(224,247,250,.90)' },  // crystal
  maze:     { accent: '#fcd34d', title: '#fef9c3',  desc: 'rgba(254,249,195,.88)' },  // fireflies
  circuit:  { accent: '#a78bfa', title: '#f3e8ff',  desc: 'rgba(243,232,255,.90)' },  // plasma
}

export default function CategoryHeader({ category }) {
  const t = THEME_STYLE[category.theme] || THEME_STYLE.network

  const algoList = registry[category.id] || []
  const liveCount = algoList.filter(a => a.implemented).length

  return (
    <ThemeScene themeId={category.theme}>
      <div
        className="max-w-[1400px] mx-auto px-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '4rem' }}
      >
        {/* Category name — no underline, no border */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-black tracking-tight leading-none mb-6"
          style={{
            fontSize: 'clamp(42px, 6vw, 72px)',
            color: t.title,
            textShadow: '0 4px 24px rgba(0,0,0,.5)',
          }}
        >
          {category.name}
          <span style={{ color: t.accent }}> Algorithms</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="font-light leading-relaxed mb-12 max-w-3xl"
          style={{
            fontSize: 'clamp(17px, 2.2vw, 22px)',
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
          className="flex items-center gap-10 mb-14"
        >
          {[
            { value: category.count,   label: 'Total',     color: t.accent },
            { value: liveCount || '–', label: 'Live',      color: '#4ade80' },
            { value: 'Java · C · C++', label: 'Languages', color: 'rgba(255,255,255,.75)' },
          ].map((stat, i, arr) => (
            <div key={stat.label} className="flex items-center gap-10">
              <div className="text-center">
                <div className="font-black text-3xl" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs uppercase tracking-widest mt-1"
                  style={{ color: 'rgba(255,255,255,.38)' }}>
                  {stat.label}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-10" style={{ background: 'rgba(255,255,255,.1)' }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,.28)' }}>
            Scroll to explore
          </span>
          <ChevronDown size={22}
            style={{ color: 'rgba(255,255,255,.32)', animation: 'bounce-down 1.6s ease-in-out infinite' }} />
        </motion.div>
      </div>
    </ThemeScene>
  )
}
