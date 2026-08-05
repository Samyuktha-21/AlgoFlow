import { useEffect, useState } from 'react'
import {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut, onAuthStateChanged,
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore'
import { auth, db, googleProvider, firebaseEnabled } from '../firebase/config'
import { recordLogin, recordNewLearner } from '../firebase/stats'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  /* Only start in the loading state when there is an auth listener to wait
     for — otherwise loading is already settled and nothing has to clear it. */
  const [loading, setLoading]     = useState(Boolean(firebaseEnabled && auth))
  const [authError, setAuthError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!firebaseEnabled || !auth) return

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
      // Popup works on modern desktop AND mobile browsers, and unlike the
      // redirect flow it survives third-party storage partitioning.
      await signInWithPopup(auth, googleProvider)
      clearTimeout(timeoutId)
      recordLogin()
      // onAuthStateChanged handles user state update
    } catch (e) {
      clearTimeout(timeoutId)

      const code = e?.code || ''

      if (code === 'auth/popup-blocked') {
        // Popup blocked (in-app browsers, strict settings) — fall back to
        // the full-page redirect flow. Page navigates away on success.
        try {
          await signInWithRedirect(auth, googleProvider)
          return
        } catch (re) {
          console.error('Redirect fallback error:', re?.code, re?.message)
          setSigningIn(false)
          setAuthError('Sign-in failed. Please allow popups for this site and try again.')
          return
        }
      }

      setSigningIn(false)
      console.error('Sign-in error:', code, e.message)

      if (code === 'auth/user-not-authorized') {
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
