import { useNavigate } from 'react-router-dom'

const DISPLAY = "'General Sans', 'Inter', sans-serif"
const ACCENT = '#f5811f'

export default function BottomCTA() {
  const navigate = useNavigate()
  return (
    <section className="bottom-cta-v2" style={{ padding: '6rem 4rem', background: '#0d0d0d', textAlign: 'left' }}>
      <div style={{ maxWidth: 600 }}>
        <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>
          Pick one. Watch it think.
        </h2>
        <p style={{ fontFamily: DISPLAY, fontSize: '0.95rem', color: '#a3a3a3', marginTop: '0.75rem', marginBottom: '2rem' }}>
          124 algorithms, no signup required to start.
        </p>
        <button
          type="button"
          onClick={() => navigate('/category/sorting')}
          style={{
            background: ACCENT, color: '#0a0a0a', fontFamily: DISPLAY, fontWeight: 700,
            fontSize: '0.95rem', padding: '0.9rem 2rem', borderRadius: 4, border: 'none',
            cursor: 'pointer', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          Browse all algorithms →
        </button>
      </div>
    </section>
  )
}
