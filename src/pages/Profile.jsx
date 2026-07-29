import { Link } from 'react-router-dom'
import { ChevronRight, BookOpen, GraduationCap, CheckCircle2, Code2, Flame, CalendarCheck, Zap, Trophy, Award } from 'lucide-react'
import Seo from '../components/Seo'
import categories from '../data/categories.json'
import registry from '../data/algorithmRegistry.json'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { computeProgress, splitKey } from '../utils/progressStats'
import { xpToNext } from '../utils/xp'
import { evaluateBadges, earnedBadgeCount } from '../utils/badges'

/* Badge icon strings (from src/utils/badges.js) → lucide components, and the
   per-tier accent color. Kept at module scope so the pure util stays React-free. */
const ICONS = { BookOpen, GraduationCap, CheckCircle2, Code2, Flame, CalendarCheck, Zap, Trophy }
const TIER = { bronze: '#c2410c', silver: '#64748b', gold: '#ca8a04' }

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

function BadgeCard({ badge }) {
  const Icon = ICONS[badge.icon] || Award
  const color = TIER[badge.tier] || '#64748b'
  const earned = badge.earned
  return (
    <div title={badge.desc} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
      padding: '14px 10px', borderRadius: 12,
      background: earned ? 'var(--page-surface)' : 'var(--page-surface-2)',
      border: `1px solid ${earned ? color : 'var(--page-border)'}`, opacity: earned ? 1 : 0.72,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: earned ? `${color}22` : 'var(--page-surface)',
        border: `1px solid ${earned ? color : 'var(--page-border)'}`, color: earned ? color : '#94a3b8',
      }}>
        <Icon size={20} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--chrome-text)' }}>{badge.title}</div>
      {earned ? (
        <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{badge.tier}</div>
      ) : (
        <div style={{ width: '100%' }}>
          <div style={{ height: 5, borderRadius: 4, background: 'var(--page-surface)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${badge.progressPct}%`, background: '#94a3b8', borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 4 }}>{badge.value}/{badge.threshold}</div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--page-surface)', border: '1px solid var(--page-border)' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--chrome-text)' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}{sub ? ` · ${sub}` : ''}</div>
    </div>
  )
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
  const { learned, bookmarks, xp, level, currentStreak, longestStreak, solvedCount, dailyCount } = useProgress()

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
  const badgeStats = { learned: overall.learned, solved: solvedCount, streak: longestStreak, daily: dailyCount, level }
  const badges = evaluateBadges(badgeStats)

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          <Stat label="Level" value={level} sub={`${xpToNext(xp).inLevel}/100 to next`} />
          <Stat label="Total XP" value={xp} />
          <Stat label="Current streak" value={`🔥 ${currentStreak}`} sub={`longest ${longestStreak}`} />
          <Stat label="Problems solved" value={solvedCount} />
        </div>

        <ProgressBar pct={overall.pct} label="Overall" big />

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--chrome-text)', margin: '28px 0 12px' }}>By topic</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.map(c => {
            const s = byCategory[c.id] || { learned: 0, total: 0, pct: 0 }
            return <ProgressBar key={c.id} pct={s.pct} label={c.name} sub={`${s.learned}/${s.total}`} to={`/category/${c.id}`} />
          })}
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--chrome-text)', margin: '28px 0 12px' }}>
          Badges <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>· {earnedBadgeCount(badgeStats)}/{badges.length}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
          {badges.map(b => <BadgeCard key={b.id} badge={b} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 28 }}>
          <ListCard title="Bookmarks" empty="No bookmarks yet." entries={bookmarkEntries} />
          <ListCard title="Recently learned" empty="Nothing learned yet." entries={learnedEntries} />
        </div>
      </div>
    </div>
  )
}
