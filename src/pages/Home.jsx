import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/HomePage/Hero'
import CategoryGrid from '../components/HomePage/CategoryGrid'

export default function Home() {
  const location = useLocation()

  /* Scroll to #discussion-section when navigated here with ?scrollTo=discussion */
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('scrollTo') === 'discussion') {
      setTimeout(() => {
        document.getElementById('discussion-section')
          ?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }, [location.search])

  return (
    <>
      <Hero />
      <CategoryGrid />

      {/* ── Discussion section ── */}
      <section
        id="discussion-section"
        style={{
          background: '#060810',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 40, marginBottom: 12 }}>💬</p>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
          Community Discussion
        </h2>
        <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px' }}>
          Sign in and join the conversation — ask questions, share insights, discuss algorithms.
        </p>
        <p style={{ fontSize: 13, color: '#334155' }}>
          Full discussion board coming soon.
        </p>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t" style={{ borderColor:'rgba(255,255,255,0.06)', background:'#060810' }}>
        <p className="text-sm" style={{ color:'#334155' }}>
          AlgoFlow — Where Logic Flows Visually &nbsp;·&nbsp; Built for learning
        </p>
      </footer>
    </>
  )
}
