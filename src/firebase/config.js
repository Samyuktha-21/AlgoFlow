import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseEnabled = !!firebaseConfig.apiKey

let _auth = null, _db = null, _googleProvider = null

if (firebaseEnabled) {
  try {
    const app = initializeApp(firebaseConfig)
    _auth = getAuth(app)
    _db = getFirestore(app)
    _googleProvider = new GoogleAuthProvider()
    _googleProvider.setCustomParameters({ prompt: 'select_account' })
  } catch (e) {
    console.warn('Firebase init failed — auth/comments disabled:', e.message)
  }
}

export const auth           = _auth
export const db             = _db
export const googleProvider = _googleProvider