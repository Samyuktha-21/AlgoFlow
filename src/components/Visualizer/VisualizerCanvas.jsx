import { Suspense } from 'react'
import { useVisualization } from '../../context/VisualizationContext'
import { VISUALIZER_MAP } from './visualizerMap'

/* When embedded=true the outer glass wrapper is omitted —
   the parent split panel provides its own background. */
export default function VisualizerCanvas({ algorithmType, themeId, metadata, embedded }) {
  const { currentStep } = useVisualization()
  const VisualizerComponent = VISUALIZER_MAP[algorithmType] || VISUALIZER_MAP.array

  const LIGHT_THEMES = new Set(['water', 'puzzle', 'chain', 'books'])
  const isLightTheme = LIGHT_THEMES.has(themeId)

  const inner = (
    <div className="p-4 flex flex-col" style={{ minHeight: 380 }}>
      <Suspense fallback={
        <div className="flex items-center justify-center" style={{ minHeight: 340 }}>
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <VisualizerComponent
          step={currentStep}
          themeId={themeId}
          metadata={metadata}
        />
      </Suspense>
    </div>
  )

  if (embedded) return inner

  return (
    <div style={{
      background: isLightTheme ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.28)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: isLightTheme ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.12)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {inner}
    </div>
  )
}
