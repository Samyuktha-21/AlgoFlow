import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Zap, MessageSquare } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { BeginnerToggleCompact } from '../../context/BeginnerContext'
import { useAuth } from '../../context/AuthContext'
import { SearchTriggerHeader } from '../Search/SearchTrigger'

const GLASS = {
  background: 'rgba(8,12,22,0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
}

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
      <div style={{ width: 80, height: 32, borderRadius: 24, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
    )
  }

  if (user) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'3px 3px 3px 12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:28 }}>
        <span style={{ fontSize:13, color:'rgba(255,255,255,0.75)', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {user.name?.split(' ')[0]}
        </span>
        <img src={user.avatar} alt={user.name} onClick={logout} title="Click to sign out"
          style={{ width:32, height:32, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.25)', cursor:'pointer' }}
        />
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={signingIn}
        style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'8px 16px', borderRadius:24, border:'none',
          background: signingIn ? 'rgba(79,70,229,0.45)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          color:'#fff', fontSize:13, fontWeight:700,
          cursor: signingIn ? 'not-allowed' : 'pointer',
          fontFamily:'inherit', opacity: signingIn ? 0.8 : 1,
          boxShadow: signingIn ? 'none' : '0 0 20px rgba(79,70,229,0.5)',
          transition:'all 0.2s', whiteSpace:'nowrap',
        }}
        onMouseEnter={e => { if (!signingIn) { e.currentTarget.style.boxShadow='0 0 30px rgba(79,70,229,0.8)'; e.currentTarget.style.transform='translateY(-1px)' }}}
        onMouseLeave={e => { e.currentTarget.style.boxShadow=signingIn?'none':'0 0 20px rgba(79,70,229,0.5)'; e.currentTarget.style.transform='translateY(0)' }}
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

export default function Header({ isHomepage }) {
  useTheme() // keeps ThemeProvider context active
  const { pathname } = useLocation()
  const navigate = useNavigate()

  /* Detect algorithm page → route Interview to algorithm-specific view */
  const algoMatch = pathname.match(/^\/algorithm\/([^/]+)\/([^/]+)$/)
  const [, algoCategory, algoId] = algoMatch || []

  const handleInterview = () => {
    if (algoMatch) {
      navigate(`/interview?algoId=${algoId}&category=${algoCategory}`)
    } else {
      navigate('/interview')
    }
  }

  const handleDiscussion = () => {
    navigate('/discussion')
  }

  /* Homepage header — minimal overlay */
  if (isHomepage) {
    return (
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-lg">
                AF
              </div>
              <div className="absolute inset-0 rounded-xl bg-purple-500/30 blur-sm animate-pulse" />
            </div>
            <span className="font-black text-xl tracking-tight text-white drop-shadow-lg">AlgoFlow</span>
          </Link>

          {/* Right: nav + controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInterview}
              style={{
                display:'inline-flex', alignItems:'center', gap:5,
                padding:'6px 14px', borderRadius:20, fontSize:'0.78rem',
                fontWeight:700, color:'#ffffff', textTransform:'uppercase', letterSpacing:'0.03em',
                background:'linear-gradient(135deg,#f59e0b,#f97316)',
                boxShadow:'0 0 12px rgba(245,158,11,0.4)', border:'none', cursor:'pointer',
                fontFamily:'inherit', transition:'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 20px rgba(245,158,11,0.6)'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='0 0 12px rgba(245,158,11,0.4)'; e.currentTarget.style.transform='translateY(0)' }}
            >
              <Zap size={12} />
              Interview
            </button>

            <button
              type="button"
              onClick={handleDiscussion}
              style={{
                display:'inline-flex', alignItems:'center', gap:5,
                padding:'6px 14px', borderRadius:20, fontSize:'0.78rem',
                fontWeight:700, color:'#ffffff', textTransform:'uppercase', letterSpacing:'0.03em',
                background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                boxShadow:'0 0 12px rgba(99,102,241,0.4)',
                border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 20px rgba(99,102,241,0.6)'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='0 0 12px rgba(99,102,241,0.4)'; e.currentTarget.style.transform='translateY(0)' }}
            >
              <MessageSquare size={12} />
              Discussion
            </button>

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

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
            AF
          </div>
          <span className="font-bold text-base text-white">AlgoFlow</span>
        </Link>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right cluster: Search | Beginner | Interview | Discussion | Dark | Login */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Search */}
          <SearchTriggerHeader />

          {/* Beginner/Advanced toggle */}
          <BeginnerToggleCompact />

          {/* Interview — gradient, algorithm-aware */}
          <button
            type="button"
            onClick={handleInterview}
            style={{
              display:'inline-flex', alignItems:'center', gap:5,
              padding:'6px 16px', borderRadius:20, fontSize:'0.82rem',
              fontWeight:700, color:'#ffffff', textTransform:'uppercase', letterSpacing:'0.03em',
              background:'linear-gradient(135deg,#f59e0b,#f97316)',
              boxShadow:'0 0 12px rgba(245,158,11,0.4)',
              border:'none', cursor:'pointer', fontFamily:'inherit',
              transition:'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 20px rgba(245,158,11,0.6)'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow='0 0 12px rgba(245,158,11,0.4)'; e.currentTarget.style.transform='translateY(0)' }}
          >
            <Zap size={13} />
            Interview
          </button>

          {/* Discussion — purple gradient */}
          <button
            type="button"
            onClick={handleDiscussion}
            style={{
              display:'inline-flex', alignItems:'center', gap:5,
              padding:'6px 16px', borderRadius:20, fontSize:'0.82rem',
              fontWeight:700, color:'#ffffff', textTransform:'uppercase', letterSpacing:'0.03em',
              background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
              boxShadow:'0 0 12px rgba(99,102,241,0.4)',
              border:'none', cursor:'pointer', fontFamily:'inherit',
              transition:'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 20px rgba(99,102,241,0.6)'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow='0 0 12px rgba(99,102,241,0.4)'; e.currentTarget.style.transform='translateY(0)' }}
          >
            <MessageSquare size={13} />
            Discussion
          </button>

          {/* Sign In */}
          <LoginButton />
        </div>
      </div>
    </header>
  )
}
