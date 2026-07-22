import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ArrowRight, Eye } from 'lucide-react'
import categories from '../data/categories.json'
import registry from '../data/algorithmRegistry.json'
import ThemeBackground from '../components/Visualizer/ThemeBackground'
import { getThemeContrast } from '../utils/contrastColor'
import { subscribeToCategoryViews, formatViews } from '../firebase/algoStats'
import Seo from '../components/Seo'

/* ── Per-theme accent colors ─────────────────────────────────── */
const THEME_ACCENT = {
  compass:  '#6366f1', water:    '#38bdf8', light:    '#f59e0b',
  puzzle:   '#a78bfa', chain:    '#f472b6', books:    '#34d399',
  cabinet:  '#22d3ee', forest:   '#4ade80', mountain: '#fb923c',
  network:  '#818cf8', target:   '#fbbf24', blocks:   '#60a5fa',
  maze:     '#e879f9', circuit:  '#2dd4bf',
}
const THEME_RGB = {
  compass:  [ 99, 102, 241], water:    [ 56, 189, 248], light:    [245, 158,  11],
  puzzle:   [167, 139, 250], chain:    [244, 114, 182], books:    [ 52, 211, 153],
  cabinet:  [ 34, 211, 238], forest:   [ 74, 222, 128], mountain: [251, 146,  60],
  network:  [129, 140, 248], target:   [251, 191,  36], blocks:   [ 96, 165, 250],
  maze:     [232, 121, 249], circuit:  [ 45, 212, 191],
}

/* ── Dynamic sizing based on algorithm count ─────────────────── */
function getSizeConfig(count) {
  if (count <= 6)  return { pad: '0.85rem 1.1rem', fs: '0.9rem',  gap: '0.5rem',  cols: 3, compact: false }
  if (count <= 9)  return { pad: '0.7rem 1rem',    fs: '0.88rem', gap: '0.5rem',  cols: 3, compact: false }
  if (count <= 12) return { pad: '0.6rem 0.9rem',  fs: '0.85rem', gap: '0.5rem',  cols: 3, compact: false }
  if (count <= 15) return { pad: '0.5rem 0.85rem', fs: '0.82rem', gap: '0.4rem',  cols: 3, compact: true  }
  return               { pad: '0.45rem 0.75rem', fs: '0.8rem',  gap: '0.35rem', cols: 4, compact: true  }
}

export default function Category() {
  const { categoryId } = useParams()

  /* Live per-algorithm view counts for this category — { [algoId]: views } */
  const [algoViews, setAlgoViews] = useState({})
  useEffect(() => subscribeToCategoryViews(categoryId, setAlgoViews), [categoryId])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const category   = categories.find(c => c.id === categoryId)
  const algorithms = registry[categoryId] || []

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold text-white">Category not found</h2>
        <Link to="/" className="text-blue-500 hover:underline">Back to Home</Link>
      </div>
    )
  }

  const accent    = THEME_ACCENT[category.theme] || '#6366f1'
  const [r, g, b] = THEME_RGB[category.theme]    || [99, 102, 241]
  const contrast  = getThemeContrast(category.theme)
  const cfg       = getSizeConfig(algorithms.length)

  const showDescription = !cfg.compact
  const showBadges      = !cfg.compact

  return (
    /* 56px = navbar height (h-14); subtract so grid fills exactly to viewport bottom */
    <div style={{
      height: 'calc(100vh - 56px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <Seo
        title={category.name}
        description={`${category.description} Explore ${algorithms.length} ${category.name} algorithms with step-by-step visualizations and code in Java, C, C++ and Python.`}
      />

      {/* ── 1. Fixed full-page theme background — no overlay ── */}
      <ThemeBackground themeId={category.theme} variant="page" />

      {/* ── 2. All content (z-index 2) ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        flex: 1, minHeight: 0,
        padding: '1.25rem 2.5rem 1rem 2.5rem',
      }}>

        {/* ══ HEADER SECTION (auto-height) ════════════════════════ */}
        <div style={{ flexShrink: 0, paddingBottom: '0.75rem' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <Link
              to="/"
              style={{ color: contrast.breadcrumb, fontSize: '0.72rem', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = contrast.heading }}
              onMouseLeave={e => { e.currentTarget.style.color = contrast.breadcrumb }}
            >Home</Link>
            <ChevronRight size={10} style={{ color: contrast.breadcrumb }} />
            <span style={{ color: contrast.breadcrumb, fontSize: '0.72rem' }}>{category.name}</span>
          </div>

          {/* Main row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontSize: cfg.compact
                  ? 'clamp(1.4rem, 2.5vw, 2rem)'
                  : 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 800,
                color: contrast.heading,
                textShadow: contrast.isLight ? '0 1px 6px rgba(255,255,255,0.6)' : '0 2px 20px rgba(0,0,0,0.7)',
                lineHeight: 1.1, margin: 0,
                paddingBottom: '0.1em', overflow: 'visible',
              }}>
                {category.name}
              </h1>
              {showDescription && (
                <p style={{
                  fontSize: '0.82rem',
                  color: contrast.subheading,
                  marginTop: '0.4rem', marginBottom: 0,
                  maxWidth: 520, lineHeight: 1.5,
                  textShadow: contrast.isLight ? 'none' : '0 1px 8px rgba(0,0,0,0.6)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {category.description}
                </p>
              )}
            </div>
            {showBadges && (
              <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                <StatBadge value={category.count} label="ALGORITHMS" contrast={contrast} />
                <StatBadge value="4" label="LANGUAGES" contrast={contrast} />
              </div>
            )}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{
          height: 1, flexShrink: 0, marginBottom: '0.75rem',
          background: contrast.divider,
        }} />

        {/* ══ ALGORITHM GRID SECTION ════════════════════════════════ */}
        <div style={{
          flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Grid heading */}
          <div style={{ flexShrink: 0, marginBottom: '0.5rem' }}>
            <h2 style={{ color: contrast.gridHeading, fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              All Algorithms
            </h2>
            <p style={{ fontSize: '0.75rem', marginTop: '0.15rem', marginBottom: 0, color: contrast.gridMuted }}>
              {algorithms.length} algorithms
            </p>
          </div>

          {/* The grid — overflow:hidden ensures strict viewport fit */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
            gap: cfg.gap,
            overflow: 'hidden',
            alignContent: 'start',
            flex: 1,
          }}>
            {algorithms.map(algo =>
              algo.implemented
                ? <AlgoCard
                    key={algo.id} algo={algo} categoryId={categoryId}
                    accent={accent} r={r} g={g} b={b}
                    cfg={cfg} contrast={contrast}
                    views={algoViews[algo.id]}
                  />
                : <AlgoCardSoon
                    key={algo.id} algo={algo} accent={accent} cfg={cfg} contrast={contrast}
                  />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ───────────────────────────────────────────── */

function StatBadge({ value, label, contrast }) {
  return (
    <div style={{
      background: contrast.statBg,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: `1px solid ${contrast.statBorder}`,
      borderRadius: 40,
      padding: '0.4rem 1rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: contrast.statText, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{
        fontSize: '0.58rem', letterSpacing: '0.1em',
        color: contrast.statMuted, textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  )
}

function AlgoCard({ algo, categoryId, accent, r, g, b, cfg, contrast, views }) {
  const baseBg     = contrast.cardBg
  const hoverBg    = contrast.isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.09)'
  const baseBorder = contrast.cardBorder
  const arrowColor = contrast.isLight ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)'
  const arrowHover = contrast.isLight ? '#0f172a' : '#ffffff'
  const shadow     = contrast.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.4)'

  return (
    <Link
      to={`/algorithm/${categoryId}/${algo.id}`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: cfg.pad,
        background: baseBg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${baseBorder}`,
        borderRadius: 10,
        textDecoration: 'none',
        cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        minHeight: 0,
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background  = hoverBg
        e.currentTarget.style.borderColor = `rgba(${r},${g},${b},0.4)`
        e.currentTarget.style.transform   = 'translateY(-1px)'
        e.currentTarget.style.boxShadow   = `0 4px 20px ${shadow}`
        const bar   = e.currentTarget.querySelector('.accent-bar')
        const arrow = e.currentTarget.querySelector('.card-arrow')
        if (bar)   bar.style.opacity = '1'
        if (arrow) { arrow.style.color = arrowHover; arrow.style.transform = 'translateX(3px)' }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background  = baseBg
        e.currentTarget.style.borderColor = baseBorder
        e.currentTarget.style.transform   = 'translateY(0)'
        e.currentTarget.style.boxShadow   = 'none'
        const bar   = e.currentTarget.querySelector('.accent-bar')
        const arrow = e.currentTarget.querySelector('.card-arrow')
        if (bar)   bar.style.opacity = '0'
        if (arrow) { arrow.style.color = arrowColor; arrow.style.transform = 'translateX(0)' }
      }}
    >
      {/* Left accent bar */}
      <div className="accent-bar" style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
        opacity: 0, transition: 'opacity 0.18s ease',
        borderRadius: '10px 0 0 10px',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: accent, boxShadow: `0 0 5px ${accent}80`,
        }} />
        <span style={{
          fontSize: cfg.fs, fontWeight: 500, color: contrast.cardText,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {algo.name}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 6 }}>
        {views > 0 && (
          <span
            title={`${views.toLocaleString()} views`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: '0.66rem', fontWeight: 500,
              color: contrast.isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.4)',
            }}
          >
            <Eye size={10} />
            {formatViews(views)}
          </span>
        )}
        <ArrowRight
          size={13}
          className="card-arrow"
          style={{
            color: arrowColor,
            transition: 'color 0.18s, transform 0.18s',
          }}
        />
      </div>
    </Link>
  )
}

function AlgoCardSoon({ algo, accent, cfg, contrast }) {
  const soonBg     = contrast.isLight ? 'rgba(0,0,0,0.04)'  : 'rgba(255,255,255,0.02)'
  const soonBorder = contrast.isLight ? 'rgba(0,0,0,0.08)'  : 'rgba(255,255,255,0.05)'
  const soonText   = contrast.isLight ? '#6b7280' : '#475569'
  const badgeBg    = contrast.isLight ? 'rgba(0,0,0,0.06)'  : 'rgba(255,255,255,0.04)'
  const badgeText  = contrast.isLight ? '#6b7280' : '#334155'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: cfg.pad,
      background: soonBg,
      border: `1px solid ${soonBorder}`,
      borderRadius: 10, minHeight: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: accent, opacity: 0.2,
        }} />
        <span style={{
          fontSize: cfg.fs, color: soonText,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {algo.name}
        </span>
      </div>
      <span style={{
        fontSize: '0.68rem', color: badgeText,
        padding: '2px 7px', borderRadius: 4,
        background: badgeBg,
        flexShrink: 0, marginLeft: 6, fontWeight: 500,
      }}>
        Soon
      </span>
    </div>
  )
}
