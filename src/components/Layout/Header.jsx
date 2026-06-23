import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Zap, MessageSquare } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { SearchTriggerHeader } from '../Search/SearchTrigger'

const GLASS = {
  background: 'rgba(10,10,10,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}

/* Flat nav button — no gradient, no glow, no purple */
const navBtn = (big) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: big ? '6px 16px' : '6px 14px',
  borderRadius: 6, fontSize: big ? '0.82rem' : '0.78rem',
  fontWeight: 600, color: '#ffffff', letterSpacing: '0.02em',
  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)',
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
})

const GoogleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

function LoginButton() {
  const { user, loading, authError, signingIn, signInWithGoogle, logout } = useAuth()

  if (loading) {
    return (
      <div style={{ width: 80, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
    )
  }

  if (user) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'3px 3px 3px 12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:24 }}>
        <span style={{ fontSize:13, color:'rgba(255,255,255,0.75)', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {user.name?.split(' ')[0]}
        </span>
        <img src={user.avatar} alt={user.name} onClick={logout} title="Click to sign out"
          style={{ width:30, height:30, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.25)', cursor:'pointer' }}
        />
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
      <button
        type="button"
        className="nav-btn"
        onClick={signInWithGoogle}
        disabled={signingIn}
        style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'8px 16px', borderRadius:6,
          background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.08)',
          color:'#fff', fontSize:13, fontWeight:600,
          cursor: signingIn ? 'not-allowed' : 'pointer',
          fontFamily:'inherit', opacity: signingIn ? 0.7 : 1,
          whiteSpace:'nowrap',
        }}
      >
        {signingIn
          ? <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
          : <GoogleIcon />}
        {signingIn ? 'Signing in…' : 'Sign In'}
      </button>
      {authError && (
        <div style={{ fontSize:11, color:'#fca5a5', maxWidth:200, textAlign:'right', lineHeight:1.4, padding:'3px 8px', borderRadius:6, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>
          {authError}
        </div>
      )}
    </div>
  )
}

const LogoMark = () => (
  <img
    src="/logo.svg"
    alt="AlgoFlow"
    style={{ height: 28, width: 28, flexShrink: 0, objectFit: 'contain' }}
  />
)

export default function Header({ isHomepage }) {
  useTheme() // keeps ThemeProvider context active
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const algoMatch = pathname.match(/^\/algorithm\/([^/]+)\/([^/]+)$/)
  const [, algoCategory, algoId] = algoMatch || []

  const handleInterview = () => {
    if (algoMatch) navigate(`/interview?algoId=${algoId}&category=${algoCategory}`)
    else navigate('/interview')
  }
  const handleDiscussion = () => navigate('/discussion')

  const interviewBtn = (big) => (
    <button type="button" className="nav-btn" onClick={handleInterview} style={navBtn(big)}>
      <Zap size={big ? 13 : 12} /> Interview
    </button>
  )
  const discussionBtn = (big) => (
    <button type="button" className="nav-btn" onClick={handleDiscussion} style={navBtn(big)}>
      <MessageSquare size={big ? 13 : 12} /> Discussion
    </button>
  )

  /* Homepage header — minimal overlay */
  if (isHomepage) {
    return (
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-bold text-xl tracking-tight text-white"
              style={{ fontFamily: "'General Sans', 'Inter', sans-serif" }}>AlgoFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            {interviewBtn(false)}
            {discussionBtn(false)}
            <LoginButton />
          </div>
        </div>
      </header>
    )
  }

  /* Non-homepage header */
  return (
    <header className="sticky top-0 z-50" style={GLASS}>
      <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <LogoMark />
          <span className="font-bold text-base text-white" style={{ fontFamily: "'General Sans', 'Inter', sans-serif" }}>AlgoFlow</span>
        </Link>

        <div style={{ flex: 1 }} />

        <div className="flex items-center gap-2 flex-shrink-0">
          <SearchTriggerHeader />
          {interviewBtn(true)}
          {discussionBtn(true)}
          <LoginButton />
        </div>
      </div>
    </header>
  )
}
