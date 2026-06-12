import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/HomePage/Hero'
import CategoryGrid from '../components/HomePage/CategoryGrid'
import DiscussionSection from '../components/HomePage/DiscussionSection'

export default function Home() {
  const location = useLocation()

  /* Scroll to #discussion-section when navigated with ?scrollTo=discussion */
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
      <DiscussionSection />
      <footer className="py-8 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#060810' }}>
        <p className="text-sm" style={{ color: '#334155' }}>
          AlgoFlow — Where Logic Flows Visually &nbsp;·&nbsp; Built for learning
        </p>
      </footer>
    </>
  )
}
