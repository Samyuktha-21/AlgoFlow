import { createContext, useContext } from 'react'

/* Context object + consumer hook live here (no component exports) so the
   provider file stays fast-refresh friendly. Provider: ./ProgressProvider.jsx */
export const ProgressContext = createContext(null)

export const useProgress = () => {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
