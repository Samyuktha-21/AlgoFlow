import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import ThemeScene from './ThemeScene'
import registry from '../../data/algorithmRegistry.json'

/*
  light: true  = light/white background → needs dark text
  light: false = dark background → needs white text
*/
const THEME_STYLE = {
  // ── LIGHT BACKGROUNDS → dark text ─────────────────────────
  water: {                            // Sorting: Snow/Blizzard (sky blue)
    light: true,
    accent: '#0c4a6e',
    title:  '#0c4a6e',
    accent2: '#0e7490',               // "Algorithms" word
    desc:   '#0e7490',
    statLabel: 'rgba(0,0,0,.38)',
    divider:   'rgba(0,0,0,.1)',
    scroll:    'rgba(0,0,0,.3)',
    shadow:    '0 2px 8px rgba(255,255,255,.8), 0 1px 3px rgba(0,0,0,.15)',
    descShadow:'0 1px 4px rgba(255,255,255,.6)',
  },
  puzzle: {                           // Array & String: Butterflies (light purple)
    light: true,
    accent: '#7c3aed',
    title:  '#3b0764',
    accent2: '#7c3aed',
    desc:   '#4c1d95',
    statLabel: 'rgba(0,0,0,.38)',
    divider:   'rgba(0,0,0,.1)',
    scroll:    'rgba(0,0,0,.3)',
    shadow:    '0 2px 8px rgba(255,255,255,.7), 0 1px 3px rgba(0,0,0,.15)',
    descShadow:'0 1px 4px rgba(255,255,255,.5)',
  },
  chain: {                            // Linked List: Cherry Blossoms (light pink)
    light: true,
    accent: '#be185d',
    title:  '#500724',
    accent2: '#be185d',
    desc:   '#881337',
    statLabel: 'rgba(0,0,0,.38)',
    divider:   'rgba(0,0,0,.1)',
    scroll:    'rgba(0,0,0,.3)',
    shadow:    '0 2px 8px rgba(255,255,255,.7), 0 1px 3px rgba(0,0,0,.15)',
    descShadow:'0 1px 4px rgba(255,255,255,.5)',
  },
  books: {                            // Stack & Queue: Clouds (sky blue)
    light: true,
    accent: '#1e3a5f',
    title:  '#1e3a5f',
    accent2: '#1e40af',
    desc:   '#1e40af',
    statLabel: 'rgba(0,0,0,.38)',
    divider:   'rgba(0,0,0,.1)',
    scroll:    'rgba(0,0,0,.3)',
    shadow:    '0 2px 8px rgba(255,255,255,.8), 0 1px 3px rgba(0,0,0,.15)',
    descShadow:'0 1px 4px rgba(255,255,255,.6)',
  },

  // ── DARK BACKGROUNDS → white text ─────────────────────────
  network:  { light: false, accent: '#60a5fa',  title: '#ffffff', accent2: '#60a5fa',  desc: 'rgba(219,234,254,.92)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
  forest:   { light: false, accent: '#4ade80',  title: '#ffffff', accent2: '#4ade80',  desc: 'rgba(220,252,231,.92)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
  light:    { light: false, accent: '#93c5fd',  title: '#ffffff', accent2: '#93c5fd',  desc: 'rgba(219,234,254,.95)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
  compass:  { light: false, accent: '#38bdf8',  title: '#ffffff', accent2: '#38bdf8',  desc: 'rgba(224,242,254,.92)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
  cabinet:  { light: false, accent: '#4ade80',  title: '#ffffff', accent2: '#4ade80',  desc: 'rgba(220,252,231,.92)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
  mountain: { light: false, accent: '#f97316',  title: '#ffffff', accent2: '#f97316',  desc: 'rgba(254,215,170,.92)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
  target:   { light: false, accent: '#4ade80',  title: '#ffffff', accent2: '#4ade80',  desc: 'rgba(220,252,231,.90)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
  blocks:   { light: false, accent: '#fbbf24',  title: '#ffffff', accent2: '#fbbf24',  desc: 'rgba(255,248,220,.90)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
  maze:     { light: false, accent: '#f9a8d4',  title: '#fff0f7', accent2: '#f9a8d4',  desc: 'rgba(255,228,240,.90)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
  circuit:  { light: false, accent: '#a78bfa',  title: '#f3e8ff', accent2: '#a78bfa',  desc: 'rgba(243,232,255,.90)', statLabel:'rgba(255,255,255,.38)', divider:'rgba(255,255,255,.1)', scroll:'rgba(255,255,255,.28)', shadow:'0 4px 24px rgba(0,0,0,.5)', descShadow:'0 1px 4px rgba(0,0,0,.4)' },
}

const FALLBACK = THEME_STYLE.network

export default function CategoryHeader({ category }) {
  const t = THEME_STYLE[category.theme] || FALLBACK

  const algoList = registry[category.id] || []
  const liveCount = algoList.filter(a => a.implemented).length

  return (
    <ThemeScene themeId={category.theme}>
      <div
        className="max-w-[1400px] mx-auto px-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '4rem' }}
      >
        {/* Category name */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-black tracking-tight leading-none mb-6"
          style={{
            fontSize: 'clamp(42px, 6vw, 72px)',
            color: t.title,
            textShadow: t.shadow,
          }}
        >
          {category.name}
          <span style={{ color: t.accent2 }}> Algorithms</span>
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
            textShadow: t.descShadow,
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
            { value: liveCount || '–', label: 'Live',      color: t.light ? '#059669' : '#4ade80' },
            { value: 'Java · C · C++', label: 'Languages', color: t.light ? t.desc : 'rgba(255,255,255,.75)' },
          ].map((stat, i, arr) => (
            <div key={stat.label} className="flex items-center gap-10">
              <div className="text-center">
                <div className="font-black text-3xl" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs uppercase tracking-widest mt-1"
                  style={{ color: t.statLabel, fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-10" style={{ background: t.divider }} />
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
          <span className="text-xs tracking-widest uppercase font-semibold"
            style={{ color: t.scroll }}>
            Scroll to explore
          </span>
          <ChevronDown size={22}
            style={{ color: t.scroll, animation: 'bounce-down 1.6s ease-in-out infinite' }} />
        </motion.div>
      </div>
    </ThemeScene>
  )
}
