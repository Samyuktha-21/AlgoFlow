import { useState, useEffect, useRef } from 'react'
import {
  collection, addDoc, query, orderBy,
  onSnapshot, doc, updateDoc,
  arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore'
import { Heart } from 'lucide-react'
import { db, firebaseEnabled } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

function timeAgo(ts) {
  const date = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : new Date()
  const s = (Date.now() - date.getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Avatar({ src, name, size = 36 }) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name||'U')}&background=6366f1&color=fff&size=128`
  return (
    <img
      src={src || fallback}
      alt={name}
      onError={e => { e.target.src = fallback }}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        border: '2px solid rgba(255,255,255,0.14)', objectFit: 'cover',
      }}
    />
  )
}

export default function AlgorithmComments({ algorithmId, isLight }) {
  const { user, signInWithGoogle } = useAuth()
  /* The snapshot carries the algorithm it belongs to, so switching algorithms
     (or having no backend at all) resolves to "empty, not loading" by
     derivation instead of an extra setState inside the listener effect. */
  const canLoad = Boolean(firebaseEnabled && db && algorithmId)
  const [snapshot, setSnapshot] = useState({ id: null, comments: [] })
  const comments = snapshot.id === algorithmId ? snapshot.comments : []
  const loading  = canLoad && snapshot.id !== algorithmId
  const [text, setText]         = useState('')
  const [posting, setPosting]   = useState(false)
  const [error, setError]       = useState(null)
  const ref = useRef(null)

  /* ── Theme-aware colors ── */
  const onDark = !isLight   // isLight=true → light bg → need dark text
  const C = {
    heading:      onDark ? '#f8fafc'   : '#0f172a',
    countBadge:   onDark ? '#64748b'   : '#475569',
    countBg:      onDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    divider:      onDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
    author:       onDark ? '#f1f5f9'   : '#0f172a',
    timestamp:    onDark ? '#94a3b8'   : '#64748b',
    body:         onDark ? '#cbd5e1'   : '#1e293b',
    likeDefault:  onDark ? '#64748b'   : '#94a3b8',
    emptyIcon:    onDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
    emptyText:    onDark ? 'rgba(255,255,255,0.35)' : '#475569',
    cardBg:       onDark ? 'rgba(255,255,255,0.03)'  : 'rgba(0,0,0,0.03)',
    cardBorder:   onDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.08)',
    textareaBg:   onDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.04)',
    textareaBorder: onDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
    textareaText: onDark ? '#f1f5f9'   : '#0f172a',
    textareaPlaceholder: onDark ? '#64748b' : '#94a3b8',
    signedInAs:   onDark ? '#94a3b8'   : '#475569',
    signInNudge:  onDark ? '#a5b4fc'   : '#4338ca',
    signInNudgeBg: onDark ? 'rgba(79,70,229,0.1)' : 'rgba(99,102,241,0.08)',
    signInNudgeBorder: onDark ? 'rgba(79,70,229,0.2)' : 'rgba(99,102,241,0.2)',
    loadingText:  onDark ? '#64748b'   : '#94a3b8',
  }

  /* Real-time listener */
  useEffect(() => {
    if (!canLoad) return
    const q = query(
      collection(db, 'algorithmComments', algorithmId, 'comments'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q,
      snap => setSnapshot({ id: algorithmId, comments: snap.docs.map(d => ({ id: d.id, ...d.data() })) }),
      err  => {
        console.error('Comments error:', err)
        setError('Could not load comments.')
        setSnapshot({ id: algorithmId, comments: [] })
      }
    )
    return () => unsub()
  }, [algorithmId, canLoad])

  const post = async () => {
    if (!text.trim() || !user || posting || !db) return
    setPosting(true); setError(null)
    try {
      await addDoc(collection(db, 'algorithmComments', algorithmId, 'comments'), {
        content: text.trim(),
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        createdAt: serverTimestamp(),
        likes: 0, likedBy: [],
      })
      setText(''); ref.current?.focus()
    } catch (e) {
      console.error(e)
      setError('Failed to post comment. Please try again.')
    }
    setPosting(false)
  }

  const toggleLike = async (commentId, likedBy = []) => {
    if (!user || !db) { if (!user) { try { await signInWithGoogle() } catch { /* sign-in dismissed */ } }; return }
    const liked = likedBy.includes(user.uid)
    await updateDoc(doc(db, 'algorithmComments', algorithmId, 'comments', commentId), {
      likes:   liked ? Math.max(0, likedBy.length - 1) : likedBy.length + 1,
      likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    }).catch(e => console.error('Like error:', e))
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 22, paddingBottom: 16,
        borderBottom: `1px solid ${C.divider}`,
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: C.heading, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          💬 Discussion
          <span style={{ fontSize: 13, fontWeight: 500, color: C.countBadge, background: C.countBg, padding: '2px 8px', borderRadius: 12 }}>
            {loading ? '…' : comments.length}
          </span>
        </h3>
        {!user && (
          <button type="button" onClick={signInWithGoogle} style={{
            padding: '7px 14px', borderRadius: 20, border: 'none',
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 0 14px rgba(79,70,229,0.4)',
          }}>🔑 Sign in to comment</button>
        )}
      </div>

      {/* Firebase not configured notice */}
      {!firebaseEnabled && (
        <div style={{
          padding: '14px 18px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
        }}>
          <p style={{ color: '#d97706', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            💡 Add <code style={{ background: 'rgba(0,0,0,0.15)', padding: '1px 5px', borderRadius: 4 }}>VITE_FIREBASE_*</code> environment variables in <code>.env</code> to enable comments.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Composer */}
      {user && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <Avatar src={user.avatar} name={user.name} />
          <div style={{ flex: 1 }}>
            <textarea
              ref={ref}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) post() }}
              placeholder="Share your thoughts, ask a question… (Ctrl+Enter to post)"
              rows={3}
              disabled={posting}
              style={{
                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                background: C.textareaBg,
                border: `1px solid ${C.textareaBorder}`,
                borderRadius: 12, color: C.textareaText, fontSize: 15,
                fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                opacity: posting ? 0.6 : 1, transition: 'border 0.18s',
              }}
              onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.5)' }}
              onBlur={e => { e.target.style.border = `1px solid ${C.textareaBorder}` }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: C.signedInAs }}>Signed in as {user.name?.split(' ')[0]}</span>
              <button
                type="button"
                onClick={post}
                disabled={!text.trim() || posting}
                style={{
                  padding: '8px 20px', borderRadius: 20, border: 'none',
                  background: text.trim() && !posting ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)',
                  color: text.trim() && !posting ? '#fff' : C.signedInAs,
                  cursor: text.trim() && !posting ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                  boxShadow: text.trim() && !posting ? '0 0 18px rgba(99,102,241,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {posting ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign-in nudge */}
      {!user && comments.length > 0 && (
        <div style={{
          padding: '13px 18px', borderRadius: 12, marginBottom: 20,
          background: C.signInNudgeBg, border: `1px solid ${C.signInNudgeBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <p style={{ color: C.signInNudge, margin: 0, fontSize: 14 }}>Sign in to join the discussion.</p>
          <button type="button" onClick={signInWithGoogle} style={{
            padding: '6px 14px', borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>🔑 Sign In</button>
        </div>
      )}

      {/* Comments list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: C.loadingText }}>Loading…</div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 34, marginBottom: 10, opacity: 0.5 }}>💭</div>
            <div style={{ fontSize: 15, color: C.emptyText }}>No comments yet — start the discussion!</div>
          </div>
        ) : comments.map(c => (
          <div key={c.id} style={{
            display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 12,
            background: C.cardBg, border: `1px solid ${C.cardBorder}`,
          }}>
            <Avatar src={c.authorAvatar} name={c.authorName} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.author }}>{c.authorName}</span>
                <span style={{ fontSize: 12, color: C.timestamp }}>{timeAgo(c.createdAt)}</span>
              </div>
              <p style={{ fontSize: 15, color: C.body, lineHeight: 1.65, margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>
                {c.content}
              </p>
              <button
                type="button"
                onClick={() => toggleLike(c.id, c.likedBy || [])}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                  color: user && c.likedBy?.includes(user.uid) ? '#f472b6' : C.likeDefault,
                  fontSize: 12, fontFamily: 'inherit', transition: 'color 0.18s',
                }}
              >
                <Heart size={13} fill={user && c.likedBy?.includes(user.uid) ? 'currentColor' : 'none'} />
                {c.likes || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
