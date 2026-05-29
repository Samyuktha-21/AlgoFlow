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

export default function AlgorithmComments({ algorithmId }) {
  const { user, signInWithGoogle } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading]   = useState(firebaseEnabled)
  const [text, setText]         = useState('')
  const [posting, setPosting]   = useState(false)
  const [error, setError]       = useState(null)
  const ref = useRef(null)

  /* Real-time listener */
  useEffect(() => {
    if (!firebaseEnabled || !db || !algorithmId) { setLoading(false); return }
    const q = query(
      collection(db, 'algorithmComments', algorithmId, 'comments'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q,
      snap => { setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) },
      err  => { console.error('Comments error:', err); setError('Could not load comments.'); setLoading(false) }
    )
    return () => unsub()
  }, [algorithmId])

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
    if (!user || !db) { if (!user) { try { await signInWithGoogle() } catch(_){} }; return }
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
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          💬 Discussion
          <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 12 }}>
            {loading ? '…' : comments.length}
          </span>
        </h3>
        {!user && (
          <button onClick={signInWithGoogle} style={{
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
          <p style={{ color: '#fcd34d', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            💡 Add <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4 }}>VITE_FIREBASE_*</code> environment variables in <code>.env</code> to enable comments.
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
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, color: '#f1f5f9', fontSize: 15,
                fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                opacity: posting ? 0.6 : 1, transition: 'border 0.18s',
              }}
              onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.5)' }}
              onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#475569' }}>Signed in as {user.name?.split(' ')[0]}</span>
              <button
                onClick={post}
                disabled={!text.trim() || posting}
                style={{
                  padding: '8px 20px', borderRadius: 20, border: 'none',
                  background: text.trim() && !posting ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)',
                  color: text.trim() && !posting ? '#fff' : '#475569',
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
          background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <p style={{ color: '#a5b4fc', margin: 0, fontSize: 14 }}>Sign in to join the discussion.</p>
          <button onClick={signInWithGoogle} style={{
            padding: '6px 14px', borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>🔑 Sign In</button>
        </div>
      )}

      {/* Comments list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: '#475569' }}>Loading…</div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>💭</div>
            <div style={{ fontSize: 15 }}>No comments yet — start the discussion!</div>
          </div>
        ) : comments.map(c => (
          <div key={c.id} style={{
            display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Avatar src={c.authorAvatar} name={c.authorName} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{c.authorName}</span>
                <span style={{ fontSize: 12, color: '#475569' }}>{timeAgo(c.createdAt)}</span>
              </div>
              <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>
                {c.content}
              </p>
              <button
                onClick={() => toggleLike(c.id, c.likedBy || [])}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                  color: user && c.likedBy?.includes(user.uid) ? '#f472b6' : '#475569',
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
