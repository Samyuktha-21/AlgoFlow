import CategoryCard from './CategoryCard'
import categories from '../../data/categories.json'

const DISPLAY = "'General Sans', 'Inter', sans-serif"
const MONO = "'IBM Plex Mono', monospace"

export default function CategoryGrid() {
  return (
    <section id="category-grid" style={{ background: '#0d0d0d', paddingBottom: '4rem', scrollMarginTop: 70 }}>
      {/* header */}
      <div className="cat-header-v2" style={{ padding: '4rem 4rem 2rem' }}>
        <p style={{ fontFamily: MONO, fontSize: '0.78rem', color: '#f5811f', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>
          Browse by category
        </p>
        <h2 style={{
          fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800,
          color: '#ffffff', margin: 0, lineHeight: 1.15, paddingBottom: '0.15em', letterSpacing: '-0.02em',
        }}>
          Explore Algorithm Categories
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: 620 }}>
          Each category has a unique visual theme — water, stars, forest, circuits and more. Click to explore algorithms with immersive visualizations.
        </p>
      </div>

      {/* grid — all 14 categories */}
      <div className="home-grid-v2">
        {categories.map((cat, i) => (
          <CategoryCard key={cat.id} category={cat} index={i} />
        ))}
      </div>
    </section>
  )
}
