import { motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import ParticleBackground from './ParticleBackground'
import { SearchTriggerHero } from '../Search/SearchTrigger'

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 30%, #1a1f4e 0%, #0A0E27 60%, #060810 100%)' }}>
      <ParticleBackground count={130} />

      {/* Radial accent glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'rgba(102,126,234,0.12)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: 'rgba(240,147,251,0.10)' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full blur-[80px]"
          style={{ background: 'rgba(56,189,248,0.08)' }} />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
            border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium"
        >
          <Sparkles size={14} className="text-purple-400" />
          124 Algorithms • 14 Themed Categories • Interview Hub
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-black mb-6 select-none"
          style={{
            fontSize: 'clamp(72px, 10vw, 112px)',
            lineHeight: 1.1,
            paddingBottom: '0.2em',
            overflow: 'visible',
            animation: 'hero-float 4s ease-in-out infinite',
            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 50%, #d946ef 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 28px rgba(90,103,216,0.4))',
          }}
        >
          AlgoFlow
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-2xl font-light mb-4"
          style={{ color: '#a0aec0', letterSpacing: '0.04em' }}
        >
          Where Logic Flows{' '}
          <span className="font-semibold" style={{ color: '#60a5fa' }}>Visually</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-base max-w-lg mx-auto leading-relaxed"
          style={{ color: '#64748b' }}
        >
          Master algorithms through beautiful step-by-step visualizations.
          Watch code execute in real-time with synchronized highlighting.
        </motion.p>

        {/* ── Hero search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55 }}
          style={{ margin: '28px auto 0', width: '100%', maxWidth: 560, display: 'flex', justifyContent: 'center' }}
        >
          <SearchTriggerHero />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6 mb-14"
        >
          {[
            { value: '124',  label: 'Algorithms'    },
            { value: '14',   label: 'Categories'    },
            { value: '4',    label: 'Languages'     },
            { value: '50+',  label: 'Interview Qs'  },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="gradient-text-gold font-black text-2xl">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-600 tracking-widest uppercase">Explore</span>
          <div style={{ animation: 'bounce-down 1.5s ease-in-out infinite' }}>
            <ChevronDown size={20} className="text-gray-600" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
