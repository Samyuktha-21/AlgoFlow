import { createContext, useContext } from 'react'

/* Context object + consumer hook live here (no component exports) so the
   provider file stays fast-refresh friendly. Provider: ./ThemeProvider.jsx */
export const ThemeContext = createContext(null)

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
