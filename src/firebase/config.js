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

let _app = null, _auth = null, _db = null, _googleProvider = null

if (firebaseEnabled) {
  try {
    _app = initializeApp(firebaseConfig)
    _auth = getAuth(_app)
    _db = getFirestore(_app)
    _googleProvider = new GoogleAuthProvider()
    _googleProvider.setCustomParameters({ prompt: 'select_account' })
  } catch (e) {
    console.warn('Firebase init failed — auth/comments disabled:', e.message)
  }
}

export const app            = _app
export const auth           = _auth
export const db             = _db
export const googleProvider = _googleProvider