import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut, onAuthStateChanged,
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore'
import { auth, db, googleProvider, firebaseEnabled } from '../firebase/config'
import { recordLogin, recordNewLearner } from '../firebase/stats'

const AuthContext = createContext({
  user: null, loading: false, authError: null, signingIn: false,
  signInWithGoogle: () => {}, logout: () => {},
})

/* Detect mobile browsers — popups are blocked by default on mobile */
const isMobile = () =>
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  )

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(firebaseEnabled)
  const [authError, setAuthError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!firebaseEnabled || !auth) { setLoading(false); return }

    // Handle redirect result for mobile sign-in (runs on page load after redirect)
    getRedirectResult(auth)
      .then(result => {
        if (result?.user) {
          console.log('Redirect sign-in successful:', result.user.email)
          recordLogin()
          // onAuthStateChanged will handle setting the user
        }
      })
      .catch(e => {
        const code = e?.code || ''
        if (code === 'auth/user-not-authorized') {
          setAuthError('Your Google account is not authorized. The app may still be in testing mode — contact the developer.')
          setLoading(false)
        } else if (code !== 'auth/null-operation' && code !== 'auth/no-current-user') {
          console.error('Redirect result error:', e)
          setAuthError('Sign-in failed after redirect. Please try again.')
          setLoading(false)
        }
      })

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${
          encodeURIComponent(firebaseUser.displayName || 'User')
        }&background=6366f1&color=fff&size=128`

        const userData = {
          uid:    firebaseUser.uid,
          name:   firebaseUser.displayName || 'Anonymous',
          email:  firebaseUser.email,
          avatar: firebaseUser.photoURL || fallbackAvatar,
        }

        // Set user + clear loading immediately — Firestore write is non-blocking
        setUser(userData)
        setLoading(false)
        setSigningIn(false)

        if (db) {
          try {
            const ref = doc(db, 'users', firebaseUser.uid)
            const snap = await getDoc(ref)
            if (!snap.exists()) {
              await setDoc(ref, {
                ...userData,
                joinedAt: serverTimestamp(),
                postsCount: 0, commentsCount: 0, role: 'user',
              })
              recordNewLearner()
            } else {
              await setDoc(ref, { ...userData, lastSeen: serverTimestamp() }, { merge: true })
            }
          } catch (e) {
            console.warn('Firestore user write failed:', e.message)
          }
        }
      } else {
        setUser(null)
        setLoading(false)
        setSigningIn(false)
      }
    })
    return () => unsub()
  }, [])

  const signInWithGoogle = async () => {
    if (!firebaseEnabled || !auth) {
      setAuthError('Authentication is not configured. Please contact the developer.')
      return
    }
    setAuthError(null)
    setSigningIn(true)

    // 15-second timeout fallback — clears loading if auth hangs silently
    const timeoutId = setTimeout(() => {
      setSigningIn(false)
      setAuthError('Sign-in timed out. Please try again or use a different browser.')
    }, 15000)

    try {
      if (isMobile()) {
        // On mobile, popups are blocked — use redirect flow instead
        await signInWithRedirect(auth, googleProvider)
        // Page navigates away; code below won't run until redirect back
      } else {
        await signInWithPopup(auth, googleProvider)
        clearTimeout(timeoutId)
        recordLogin()
        // onAuthStateChanged handles user state update
      }
    } catch (e) {
      clearTimeout(timeoutId)
      setSigningIn(false)

      const code = e?.code || ''
      console.error('Sign-in error:', code, e.message)

      if (code === 'auth/popup-blocked') {
        setAuthError('Popup was blocked. Please allow popups for this site, or try on a different browser.')
      } else if (code === 'auth/user-not-authorized') {
        setAuthError('This Google account is not authorized yet. The app may be in testing mode — contact the developer.')
      } else if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
        // User dismissed — not an error worth showing
      } else if (code === 'auth/network-request-failed') {
        setAuthError('Network error. Please check your connection and try again.')
      } else {
        setAuthError('Sign-in failed. Please try again or use a different browser.')
      }
    }
  }

  const logout = async () => {
    if (!auth) return
    setAuthError(null)
    try { await signOut(auth) } catch (e) { console.error(e) }
  }

  return (
    <AuthContext.Provider value={{ user, loading, authError, signingIn, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
