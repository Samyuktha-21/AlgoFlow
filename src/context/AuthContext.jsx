import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup, signOut, onAuthStateChanged,
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore'
import { auth, db, googleProvider, firebaseEnabled } from '../firebase/config'

const AuthContext = createContext({
  user: null, loading: false, authError: null,
  signInWithGoogle: () => {}, logout: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(firebaseEnabled)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!firebaseEnabled || !auth) { setLoading(false); return }

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

        if (db) {
          try {
            const ref = doc(db, 'users', firebaseUser.uid)
            const snap = await getDoc(ref)
            if (!snap.exists()) {
              await setDoc(ref, { ...userData, joinedAt: serverTimestamp(), postsCount: 0, commentsCount: 0, role: 'user' })
            } else {
              await setDoc(ref, { ...userData, lastSeen: serverTimestamp() }, { merge: true })
            }
          } catch (e) {
            console.warn('Firestore user write failed:', e.message)
          }
        }
        setUser(userData)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signInWithGoogle = async () => {
    if (!firebaseEnabled || !auth) return
    setAuthError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      if (e.code === 'auth/popup-blocked')
        setAuthError('Allow popups for this site to sign in.')
      else if (e.code !== 'auth/cancelled-popup-request')
        setAuthError('Sign in failed. Please try again.')
      throw e
    }
  }

  const logout = async () => {
    if (!auth) return
    try { await signOut(auth) } catch (e) { console.error(e) }
  }

  return (
    <AuthContext.Provider value={{ user, loading, authError, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
