import { createContext, useContext } from 'react'

/* Context object + consumer hook live here (no component exports) so the
   provider file stays fast-refresh friendly. Provider: ./AuthProvider.jsx */
export const AuthContext = createContext({
  user: null, loading: false, authError: null, signingIn: false,
  signInWithGoogle: () => {}, logout: () => {},
})

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
