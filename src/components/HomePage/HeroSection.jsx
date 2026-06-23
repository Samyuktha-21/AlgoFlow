import { Search, ChevronDown } from 'lucide-react'
import HeroAlgoCycle from './HeroAlgoCycle'
import { openSearch } from '../Search/SearchTrigger'

const DISPLAY = "'General Sans', 'Inter', sans-serif"
const MONO = "'IBM Plex Mono', monospace"

const STATS = [
  { value: '124', label: 'Algorithms'   },
  { value: '14',  label: 'Categories'   },
  { value: '3',   label: 'Languages'    },
  { value: '50+', label: 'Interview Qs' },
]

export default function HeroSection() {
  const scrollToCategories = () => {
    document.getElementById('category-grid')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section style={{ position: 'relative', background: '#0d0d0d', overflow: 'hidden' }}>
      {/* single ambient ember glow behind hero text */}
      <div className="hero2-glow" aria-hidden="true" style={{
        position: 'absolute', left: '8%', top: '32%', width: 600, height: 600, zIndex: 0,
        pointerEvents: 'none', filter: 'blur(40px)',
        background: 'radial-gradient(circle, rgba(245,129,31,0.12) 0%, transparent 70%)',
      }} />

      <div className="hero2-grid">
        {/* ── LEFT: text ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', color: '#ffffff', margin: '0 0 1.25rem' }}>
            Algorithms,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #ffb347, #f5811f, #ff5722)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>visualized.</span>
          </h1>

          <p style={{ fontFamily: DISPLAY, fontSize: '1.05rem', fontWeight: 400, color: '#a3a3a3', lineHeight: 1.6, maxWidth: 460, margin: '0 0 2rem' }}>
            Step through 124 algorithms and watch every comparison, swap, and traversal as it happens — with code synced in Java, C, and C++.
          </p>

          {/* search */}
          <div style={{ position: 'relative', maxWidth: 440, marginBottom: '2rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b6b6b', pointerEvents: 'none' }} />
            <input
              className="hero-search"
              readOnly onFocus={openSearch} onClick={openSearch}
              placeholder="search algorithms…" aria-label="Search algorithms"
              style={{
                width: '100%', borderRadius: 8,
                padding: '0.8rem 1rem 0.8rem 2.75rem', fontFamily: MONO, fontSize: '0.88rem', color: '#fff',
                cursor: 'pointer',
              }}
            />
            <kbd style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontFamily: MONO, fontSize: '0.7rem', color: '#6b6b6b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '1px 5px', pointerEvents: 'none' }}>⌘K</kbd>
          </div>

          {/* stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {i > 0 && <span style={{ width: 1, height: '1.6rem', background: 'rgba(255,255,255,0.12)' }} />}
                <div className="stat-block">
                  <div style={{ fontFamily: MONO, fontSize: '1.5rem', fontWeight: 700, color: '#ff9433', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: DISPLAY, fontSize: '0.72rem', color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* scroll-down indicator */}
          <div
            className="scroll-indicator"
            onClick={scrollToCategories}
            style={{
              marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: MONO, fontSize: '0.78rem', letterSpacing: '0.05em', textTransform: 'uppercase',
            }}
          >
            Explore categories
            <ChevronDown size={14} />
          </div>
        </div>

        {/* ── RIGHT: live algorithm cycle ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <HeroAlgoCycle />
        </div>
      </div>
    </section>
  )
}
