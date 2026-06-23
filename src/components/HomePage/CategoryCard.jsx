import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CARD_ANIMATIONS } from './CardAnimations'

const DISPLAY = "'General Sans', 'Inter', sans-serif"
const ACCENT = '#f5811f'

export default function CategoryCard({ category }) {
  const navigate = useNavigate()
  const AnimComp = CARD_ANIMATIONS[category.theme]

  return (
    <div className="category-card">
      <Link to={`/category/${category.id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}
        aria-label={`${category.name} — ${category.count} algorithms`}>

        {/* theme preview — keeps its own per-category colors */}
        <div style={{ height: 130, overflow: 'hidden', borderRadius: '10px 10px 0 0', flexShrink: 0 }}>
          {AnimComp ? <AnimComp /> : (
            <div style={{ width: '100%', height: '100%', background: category.color || '#1a1a1a' }} />
          )}
        </div>

        {/* body */}
        <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            {category.name}
          </h3>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: ACCENT, marginTop: '0.2rem' }}>
            {category.count} algorithms
          </span>

          <p style={{
            color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5, marginTop: '0.6rem', marginBottom: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {category.description}
          </p>

          {/* sample algorithm chips — clickable, independent hover */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {category.algorithms.slice(0, 2).map(id => (
              <span key={id} className="algo-chip"
                onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/algorithm/${category.id}/${id}`) }}>
                {id.replace(/([A-Z])/g, ' $1').trim().split(' ').slice(0, 2).join(' ')}
              </span>
            ))}
          </div>

          {/* arrow */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '0.75rem' }}>
            <ArrowRight size={16} className="card-arrow" />
          </div>
        </div>
      </Link>
    </div>
  )
}
