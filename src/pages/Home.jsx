import HeroSection from '../components/HomePage/HeroSection'
import CategoryGrid from '../components/HomePage/CategoryGrid'
import CursorGlow from '../components/HomePage/CursorGlow'

const MONO = "'IBM Plex Mono', monospace"

export default function Home() {
  return (
    <div style={{ background: '#0d0d0d', position: 'relative' }}>
      {/* ambient cursor glow — homepage only, sits behind content */}
      <CursorGlow />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <HeroSection />

        <CategoryGrid />

        <footer style={{
          background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1.5rem 4rem', fontFamily: MONO, fontSize: '0.78rem', color: '#6b6b6b',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <span>AlgoFlow — watch algorithms run</span>
          <span>crafted by <span style={{ color: '#ff9433' }}>Samyuktha</span> &amp; <span style={{ color: '#ff9433' }}>Sharvesh</span></span>
          <span>124 algorithms · 14 categories · built for learning</span>
        </footer>
      </div>
    </div>
  )
}
