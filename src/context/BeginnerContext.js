import { createContext, useContext } from 'react'

/* Context object + consumer hook live here (no component exports) so the
   provider file stays fast-refresh friendly. Provider: ./BeginnerProvider.jsx */
export const BeginnerContext = createContext({ beginner: true, setBeginner: () => {} })

export function useBeginner() {
  return useContext(BeginnerContext)
}
