import Hero from '../components/HomePage/Hero'
import CategoryGrid from '../components/HomePage/CategoryGrid'

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      {/* Dark footer on homepage */}
      <footer className="py-8 text-center border-t" style={{ borderColor:'rgba(255,255,255,0.06)', background:'#060810' }}>
        <p className="text-sm" style={{ color:'#334155' }}>
          AlgoFlow — Where Logic Flows Visually &nbsp;·&nbsp; Built for learning
        </p>
      </footer>
    </>
  )
}
