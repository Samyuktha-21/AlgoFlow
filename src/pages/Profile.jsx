import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Seo from '../components/Seo'
import categories from '../data/categories.json'
import registry from '../data/algorithmRegistry.json'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { computeProgress, splitKey } from '../utils/progressStats'

/* Progress dashboard: overall + per-topic completion, bookmarks, and recently
   learned. Signed out → a sign-in CTA. Gated behind the existing Google auth. */
const algoName = (cat, algo) => (registry[cat] || []).find(a => a.id === algo)?.name || algo
const catName  = (cat) => categories.find(c => c.id === cat)?.name || cat
const ts = ([, v]) => (v && typeof v.toMillis === 'function' ? v.toMillis() : 0)

function ProgressBar({ pct, label, sub, to, big }) {
  const body = (
    <div style={{ padding: big ? '14px 16px' : '10px 14px', borderRadius: 12, background: 'var(--page-surface)', border: '1px solid var(--page-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: big ? 15 : 13, fontWeight: 700, color: 'var(--chrome-text)' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>{sub || `${pct}%`}</span>
      </div>
      <div style={{ height: big ? 10 : 7, borderRadius: 6, background: 'var(--page-surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#f5811f,#fbbf24)', borderRadius: 6, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{body}</Link> : body
}

function ListCard({ title, empty, entries }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--page-surface)', border: '1px solid var(--page-border)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--chrome-text)', margin: '0 0 10px' }}>{title}</h3>
      {entries.length === 0 ? (
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{empty}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {entries.map(([key]) => {
            const [cat, algo] = splitKey(key)
            return (
              <Link key={key} to={`/algorithm/${cat}/${algo}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: 'var(--chrome-text)', textDecoration: 'none', padding: '6px 8px', borderRadius: 7, background: 'var(--page-surface-2)' }}>
                <span style={{ fontWeight: 600 }}>{algoName(cat, algo)}</span>
                <span style={{ color: '#64748b', fontSize: 11 }}>{catName(cat)}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  const { user, signInWithGoogle } = useAuth()
  const { learned, bookmarks } = useProgress()

  if (!user) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <Seo title="Your Progress" description="Track which algorithms you've learned and bookmarked on AlgoFlow." />
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--chrome-text)' }}>Your Progress</h1>
        <p style={{ color: '#64748b', maxWidth: 420, textAlign: 'center', lineHeight: 1.6 }}>
          Sign in to mark algorithms as learned, bookmark them, and track your progress across all {categories.length} topics.
        </p>
        <button type="button" onClick={signInWithGoogle} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#fff', background: '#f5811f', border: 'none', fontFamily: 'inherit' }}>
          Sign in with Google
        </button>
      </div>
    )
  }

  const { overall, byCategory } = computeProgress(learned, categories, registry)
  const learnedEntries   = Object.entries(learned).sort((a, b) => ts(b) - ts(a)).slice(0, 10)
  const bookmarkEntries  = Object.entries(bookmarks).sort((a, b) => ts(b) - ts(a))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <Seo title="Your Progress" description="Track which algorithms you've learned and bookmarked on AlgoFlow." />
      <div className="max-w-[1100px] mx-auto px-5 py-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 18, color: 'var(--chrome-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--chrome-text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: 'var(--chrome-text)' }}>Your Progress</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <img src={user.avatar} alt={user.name} style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid var(--page-border)' }} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--chrome-text)', margin: 0 }}>{user.name}</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{overall.learned} of {overall.total} algorithms learned</p>
          </div>
        </div>

        <ProgressBar pct={overall.pct} label="Overall" big />

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--chrome-text)', margin: '28px 0 12px' }}>By topic</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.map(c => {
            const s = byCategory[c.id] || { learned: 0, total: 0, pct: 0 }
            return <ProgressBar key={c.id} pct={s.pct} label={c.name} sub={`${s.learned}/${s.total}`} to={`/category/${c.id}`} />
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 28 }}>
          <ListCard title="Bookmarks" empty="No bookmarks yet." entries={bookmarkEntries} />
          <ListCard title="Recently learned" empty="Nothing learned yet." entries={learnedEntries} />
        </div>
      </div>
    </div>
  )
}
