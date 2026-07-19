/*
 * FIRESTORE SECURITY RULES — add in Firebase Console → Firestore → Rules:
 *
 * match /discussions/{postId} {
 *   allow read: if true;
 *   allow create: if request.auth != null;
 *   allow update: if request.auth != null;
 *   allow delete: if request.auth.uid == resource.data.uid;
 *   match /replies/{replyId} {
 *     allow read: if true;
 *     allow create: if request.auth != null;
 *     allow delete: if request.auth.uid == resource.data.uid;
 *   }
 * }
 */

import { useState, useEffect, useRef } from 'react'
import {
  collection, addDoc, query, orderBy, limit, onSnapshot,
  doc, updateDoc, deleteDoc, getDocs,
  arrayUnion, arrayRemove, serverTimestamp, increment,
} from 'firebase/firestore'
import { Heart, Trash2, MessageCircle, Send, ChevronDown } from 'lucide-react'
import { db, firebaseEnabled } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

/* ── Topic config ──────────────────────────────────── */

const TOPICS = [
  'General', 'Sorting', 'Searching', 'Arrays & Strings', 'Linked Lists',
  'Stack & Queue', 'Hashing', 'Trees', 'Heaps', 'Graphs',
  'Greedy', 'Dynamic Programming', 'Backtracking', 'Advanced', 'Fundamentals',
]

/* ── Helpers ───────────────────────────────────────── */

function timeAgo(ts) {
  if (!ts) return 'just now'
  const date = ts?.toDate ? ts.toDate() : new Date(ts)
  const s = (Date.now() - date.getTime()) / 1000
  if (s < 60)     return 'just now'
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Avatar({ src, name, size = 36 }) {
  const fb = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=f5811f&color=000&size=128`
  return (
    <img src={src || fb} alt={name} onError={e => { e.target.src = fb }}
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.12)' }}
    />
  )
}

function TopicChip({ topic, small }) {
  return (
    <span style={{
      padding: small ? '2px 7px' : '3px 10px', borderRadius: 20,
      fontSize: small ? 10 : 11, fontWeight: 700,
      background: 'rgba(245,129,31,0.12)', color: '#fdba74', border: '1px solid rgba(245,129,31,0.28)',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {topic}
    </span>
  )
}

/* ── TopicSelect — custom dropdown, viewport-safe ──── */

function TopicSelect({ value, onChange, isDark }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const menuRef = useRef(null)

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Fix viewport overflow after menu renders */
  useEffect(() => {
    if (!open || !menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    if (rect.right > window.innerWidth) {
      menuRef.current.style.left = 'auto'
      menuRef.current.style.right = '0px'
    }
    if (rect.left < 0) {
      menuRef.current.style.left = '0px'
      menuRef.current.style.right = 'auto'
    }
  }, [open])

  /* Dark / light palette */
  const bg      = isDark ? '#1e293b'                     : '#ffffff'
  const border  = isDark ? 'rgba(245,129,31,0.4)'        : 'rgba(245,129,31,0.3)'
  const text    = isDark ? '#f1f5f9'                     : '#0f172a'
  const hover   = isDark ? 'rgba(245,129,31,0.15)'       : 'rgba(245,129,31,0.08)'
  const active  = isDark ? 'rgba(245,129,31,0.28)'       : 'rgba(245,129,31,0.14)'
  const shadow  = isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.15)'
  /* Trigger: orange-tinted so it's clearly visible on any background */
  const trigBg     = isDark ? 'rgba(245,129,31,0.15)' : 'rgba(245,129,31,0.1)'
  const trigBorder = isDark ? 'rgba(245,129,31,0.5)'  : 'rgba(245,129,31,0.35)'
  const trigText   = isDark ? '#fdba74'               : '#c2410c'

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600,
          background: trigBg, border: `1px solid ${trigBorder}`,
          color: trigText, cursor: 'pointer', fontFamily: 'inherit',
          minWidth: 140, justifyContent: 'space-between',
          transition: 'all 0.18s', whiteSpace: 'nowrap',
        }}
      >
        <span>{value}</span>
        <ChevronDown size={13} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 'auto',
            minWidth: 200,
            maxWidth: 280,
            maxHeight: 240,
            overflowY: 'auto',
            zIndex: 9999,
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 10,
            boxShadow: shadow,
            scrollbarWidth: 'thin',
            scrollbarColor: `rgba(245,129,31,0.4) transparent`,
          }}
        >
          {TOPICS.map(t => (
            <div
              key={t}
              onClick={() => { onChange(t); setOpen(false) }}
              style={{
                padding: '0.5rem 1rem', fontSize: 13, cursor: 'pointer',
                color: text, background: t === value ? active : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = t === value ? active : hover }}
              onMouseLeave={e => { e.currentTarget.style.background = t === value ? active : 'transparent' }}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── PostCard — owns replies state ─────────────────── */

function PostCard({ post, currentUser, signInWithGoogle }) {
  const [repliesOpen, setRepliesOpen]     = useState(false)
  const [replies, setReplies]             = useState([])
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [replyText, setReplyText]         = useState('')
  const [postingReply, setPostingReply]   = useState(false)
  const [deleted, setDeleted]             = useState(false)

  /* Lazy-load replies with real-time listener */
  useEffect(() => {
    if (!repliesOpen || !db || !firebaseEnabled) return
    setRepliesLoading(true)
    const q = query(
      collection(db, 'discussions', post.id, 'replies'),
      orderBy('timestamp', 'asc')
    )
    const unsub = onSnapshot(q,
      snap => { setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setRepliesLoading(false) },
      () => setRepliesLoading(false)
    )
    return () => unsub()
  }, [repliesOpen, post.id])

  if (deleted) return null

  const liked = currentUser && (post.likedBy || []).includes(currentUser.uid)
  const isOwner = currentUser?.uid === post.uid

  const handleLike = async () => {
    if (!currentUser) { try { await signInWithGoogle() } catch { /* sign-in dismissed */ }; return }
    if (!db) return
    await updateDoc(doc(db, 'discussions', post.id), {
      likes: increment(liked ? -1 : 1),
      likedBy: liked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
    }).catch(console.error)
  }

  const handleDelete = async () => {
    if (!currentUser || !db) return
    setDeleted(true) // optimistic
    try {
      const repliesSnap = await getDocs(collection(db, 'discussions', post.id, 'replies'))
      await Promise.all(repliesSnap.docs.map(d => deleteDoc(d.ref)))
      await deleteDoc(doc(db, 'discussions', post.id))
    } catch (e) {
      console.error('Delete error:', e)
      setDeleted(false)
    }
  }

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !currentUser || !db) return
    setPostingReply(true)
    try {
      await addDoc(collection(db, 'discussions', post.id, 'replies'), {
        uid: currentUser.uid,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        text: replyText.trim(),
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
      })
      await updateDoc(doc(db, 'discussions', post.id), {
        replyCount: increment(1),
      }).catch(() => {})
      setReplyText('')
    } catch (e) { console.error(e) }
    setPostingReply(false)
  }

  const handleReplyLike = async (replyId, likedBy = []) => {
    if (!currentUser) return
    if (!db) return
    const rl = likedBy.includes(currentUser.uid)
    await updateDoc(doc(db, 'discussions', post.id, 'replies', replyId), {
      likes: increment(rl ? -1 : 1),
      likedBy: rl ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
    }).catch(console.error)
  }

  const replyCount = post.replyCount || 0

  return (
    <div style={{
      borderRadius: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '1rem 1.2rem',
      transition: 'background 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
    >
      {/* Post header */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        <Avatar src={post.userAvatar} name={post.userName} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', flexShrink: 0 }}>{post.userName}</span>
            <TopicChip topic={post.topic} small />
            {post.algorithmName && (
              <span style={{
                padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: 'rgba(245,129,31,0.1)', border: '1px solid rgba(245,129,31,0.25)', color: '#fdba74',
                flexShrink: 0,
              }}>
                {post.algorithmName}
              </span>
            )}
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto', flexShrink: 0 }}>
              {timeAgo(post.timestamp)}
            </span>
          </div>
          <p style={{ fontSize: 15, color: '#e2e8f0', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {post.text}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 14, paddingLeft: 48, alignItems: 'center' }}>
        <button type="button" onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
          color: liked ? '#f5811f' : '#64748b', fontSize: 12, fontFamily: 'inherit', transition: 'color 0.18s',
        }}>
          <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
          {post.likes || 0}
        </button>

        <button type="button" onClick={() => setRepliesOpen(o => !o)} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
          color: repliesOpen ? '#f5811f' : '#64748b', fontSize: 12, fontFamily: 'inherit', transition: 'color 0.18s',
        }}>
          <MessageCircle size={13} />
          {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
        </button>

        {isOwner && (
          <button type="button" onClick={handleDelete} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
            color: '#475569', fontSize: 11, fontFamily: 'inherit',
            transition: 'color 0.18s', marginLeft: 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569' }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Replies section */}
      {repliesOpen && (
        <div style={{ marginTop: 12, paddingLeft: 48, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          {repliesLoading ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>Loading replies…</p>
          ) : replies.map(r => {
            const rLiked = currentUser && (r.likedBy || []).includes(currentUser.uid)
            return (
              <div key={r.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <Avatar src={r.userAvatar} name={r.userName} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{r.userName}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{timeAgo(r.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 5px', whiteSpace: 'pre-wrap' }}>{r.text}</p>
                  <button type="button" onClick={() => handleReplyLike(r.id, r.likedBy)} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: rLiked ? '#f5811f' : '#64748b', fontSize: 11, fontFamily: 'inherit',
                  }}>
                    <Heart size={11} fill={rLiked ? 'currentColor' : 'none'} />
                    {r.likes || 0}
                  </button>
                </div>
              </div>
            )
          })}

          {/* Reply composer */}
          {currentUser ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Avatar src={currentUser.avatar} name={currentUser.name} size={28} />
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReplySubmit() } }}
                  placeholder="Write a reply…"
                  style={{
                    flex: 1, padding: '8px 14px', borderRadius: 20, fontSize: 13,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f1f5f9', outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <button type="button" onClick={handleReplySubmit}
                  disabled={!replyText.trim() || postingReply}
                  style={{
                    padding: '8px 14px', borderRadius: 20, border: 'none',
                    background: replyText.trim() && !postingReply ? '#f5811f' : 'rgba(255,255,255,0.06)',
                    color: replyText.trim() && !postingReply ? '#000' : '#475569',
                    cursor: replyText.trim() && !postingReply ? 'pointer' : 'not-allowed',
                    fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.2s',
                  }}>
                  <Send size={12} />
                  {postingReply ? '…' : 'Reply'}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#475569' }}>
              <button type="button" onClick={signInWithGoogle} style={{ background:'none', border:'none', color:'#fdba74', cursor:'pointer', padding:0, fontFamily:'inherit', fontSize:13 }}>
                Sign in
              </button>{' '}to reply.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main Discussion Section ────────────────────────── */

export default function DiscussionSection() {
  const { user, signInWithGoogle } = useAuth()
  const { isDark } = useTheme()

  const [posts, setPosts]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeTopic, setActiveTopic]   = useState('All')
  const [loadLimit, setLoadLimit]       = useState(20)
  const [hasMore, setHasMore]           = useState(false)

  const [composerText, setComposerText] = useState('')
  const [composerTopic, setComposerTopic] = useState('General')
  const [composerAlgo, setComposerAlgo] = useState('')
  const [posting, setPosting]           = useState(false)
  const [postSuccess, setPostSuccess]   = useState(false)
  const [postError, setPostError]       = useState(null)

  const textRef = useRef(null)

  /* ── Real-time posts listener ── */
  useEffect(() => {
    if (!firebaseEnabled || !db) { setLoading(false); return }
    const q = query(collection(db, 'discussions'), orderBy('timestamp', 'desc'), limit(loadLimit))
    const unsub = onSnapshot(q,
      snap => {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setPosts(loaded)
        setHasMore(snap.docs.length === loadLimit)
        setLoading(false)
      },
      err => { console.error('Discussion load error:', err); setLoading(false) }
    )
    return () => unsub()
  }, [loadLimit])

  /* ── Post submission ── */
  const handlePost = async () => {
    if (!composerText.trim() || !user || posting || !db) return
    setPosting(true); setPostError(null)
    try {
      await addDoc(collection(db, 'discussions'), {
        uid:           user.uid,
        userName:      user.name,
        userAvatar:    user.avatar,
        topic:         composerTopic,
        algorithmName: composerAlgo.trim(),
        text:          composerText.trim(),
        timestamp:     serverTimestamp(),
        likes:         0,
        likedBy:       [],
        replyCount:    0,
      })
      setComposerText(''); setComposerAlgo('')
      setPostSuccess(true)
      setTimeout(() => setPostSuccess(false), 2000)
      textRef.current?.focus()
    } catch (e) {
      console.error('Post error:', e)
      setPostError('Failed to post. Please try again.')
    }
    setPosting(false)
  }

  /* ── Filtered posts ── */
  const filtered = activeTopic === 'All' ? posts : posts.filter(p => p.topic === activeTopic)

  return (
    <section
      id="discussion-section"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '80px 0',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f5811f', marginBottom: 10 }}>
            Community
          </p>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: '#ffffff', marginBottom: 10, lineHeight: 1.15 }}>
            💬 Community Discussion
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6 }}>
            Ask questions, share insights, discuss algorithms
          </p>
        </div>

        {/* Topic filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 32, paddingBottom: 4, scrollbarWidth: 'none' }}>
          {['All', ...TOPICS].map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setActiveTopic(t)}
              style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12,
                fontWeight: activeTopic === t ? 700 : 600,
                whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
                background: activeTopic === t ? '#f5811f' : 'transparent',
                color: activeTopic === t ? '#000000' : '#94a3b8',
                border: activeTopic === t ? '1px solid #f5811f' : '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { if (activeTopic !== t) { e.currentTarget.style.borderColor = 'rgba(245,129,31,0.4)'; e.currentTarget.style.color = '#fdba74' } }}
              onMouseLeave={e => { if (activeTopic !== t) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#94a3b8' } }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Firebase not configured notice */}
        {!firebaseEnabled && (
          <div style={{ padding: '16px 20px', borderRadius: 12, marginBottom: 24, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <p style={{ color: '#fcd34d', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              💡 Configure <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 4 }}>VITE_FIREBASE_*</code> environment variables to enable real-time discussion.
            </p>
          </div>
        )}

        {/* Post composer */}
        {user ? (
          <div style={{ marginBottom: 32, padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <Avatar src={user.avatar} name={user.name} size={38} />
              <textarea
                ref={textRef}
                value={composerText}
                onChange={e => { setComposerText(e.target.value); setPostError(null) }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost() }}
                placeholder="Share your thoughts or ask a question…"
                rows={3}
                style={{
                  flex: 1, padding: '12px 16px', minHeight: 80,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, color: '#f1f5f9', fontSize: 15, fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none', transition: 'border 0.18s, box-shadow 0.18s',
                }}
                onFocus={e => { e.target.style.border = '1px solid #f5811f'; e.target.style.boxShadow = '0 0 0 3px rgba(245,129,31,0.15)' }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div style={{
              display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '0.75rem', marginTop: '0.5rem',
            }}>
              <TopicSelect value={composerTopic} onChange={setComposerTopic} isDark={isDark} />
              <input
                value={composerAlgo}
                onChange={e => setComposerAlgo(e.target.value)}
                placeholder="Algorithm name (optional)"
                style={{
                  flex: 1, minWidth: 160, padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: 13,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f1f5f9', outline: 'none', transition: 'border 0.18s',
                }}
                onFocus={e => { e.target.style.border = '1px solid #f5811f' }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)' }}
              />
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                {postSuccess && (
                  <span style={{ fontSize: 13, color: '#34d399', fontWeight: 600 }}>✓ Posted!</span>
                )}
                {postError && (
                  <span style={{ fontSize: 13, color: '#f87171' }}>{postError}</span>
                )}
                <button
                  type="button"
                  onClick={handlePost}
                  disabled={!composerText.trim() || posting}
                  style={{
                    padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none',
                    background: 'linear-gradient(135deg,#f5811f,#ff5722)',
                    color: '#000000', fontWeight: 700, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 14,
                    opacity: !composerText.trim() || posting ? 0.4 : 1,
                    cursor: !composerText.trim() || posting ? 'not-allowed' : 'pointer',
                    boxShadow: composerText.trim() && !posting ? '0 0 16px rgba(245,129,31,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <Send size={13} />
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 32, padding: '24px', borderRadius: 16, textAlign: 'center', background: 'rgba(245,129,31,0.08)', border: '1px solid rgba(245,129,31,0.2)' }}>
            <p style={{ color: '#94a3b8', marginBottom: 16, fontSize: 15 }}>Sign in to join the discussion</p>
            <button type="button" onClick={signInWithGoogle} style={{
              padding: '10px 24px', borderRadius: 24, border: 'none',
              background: 'linear-gradient(135deg,#f5811f,#ff5722)',
              color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 0 20px rgba(245,129,31,0.35)',
            }}>
              🔑 Sign in with Google
            </button>
          </div>
        )}

        {/* Posts list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#475569' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💭</div>
              <p style={{ color: '#475569', fontSize: 15 }}>
                {activeTopic === 'All'
                  ? 'No posts yet — be the first to start a discussion!'
                  : `No posts in "${activeTopic}" yet.`}
              </p>
            </div>
          ) : (
            filtered.map(p => (
              <PostCard key={p.id} post={p} currentUser={user} signInWithGoogle={signInWithGoogle} />
            ))
          )}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button type="button" onClick={() => setLoadLimit(l => l + 20)} style={{
              padding: '10px 28px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent', color: '#94a3b8', fontSize: 14, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f1f5f9' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
            >
              Load more
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
