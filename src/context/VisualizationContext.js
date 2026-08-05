import { createContext, useContext } from 'react'

/* Context object + consumer hook live here (no component exports) so the
   provider file stays fast-refresh friendly. Provider: ./VisualizationProvider.jsx */
export const VisualizationContext = createContext(null)

export const useVisualization = () => {
  const ctx = useContext(VisualizationContext)
  if (!ctx) throw new Error('useVisualization must be used within VisualizationProvider')
  return ctx
}
