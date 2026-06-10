import { useVisualization } from '../../context/VisualizationContext'
import SortVisualizer from './SortVisualizer'
import SearchVisualizer from './SearchVisualizer'
import GraphVisualizer from './GraphVisualizer'
import ArrayVisualizer from './ArrayVisualizer'
import DPVisualizer from './DPVisualizer'
import TreeVisualizer from './TreeVisualizer'
import LinkedListVisualizer from './LinkedListVisualizer'
import StackVisualizer from './StackVisualizer'
import HeapVisualizer from './HeapVisualizer'
import BacktrackingVisualizer from './BacktrackingVisualizer'

const VISUALIZER_MAP = {
  sorting:        SortVisualizer,
  searching:      SearchVisualizer,
  graph:          GraphVisualizer,
  array:          ArrayVisualizer,
  'linked-list':  LinkedListVisualizer,
  stack:          StackVisualizer,
  queue:          StackVisualizer,
  'stack-queue':  StackVisualizer,
  tree:           TreeVisualizer,
  heap:           HeapVisualizer,
  dp:             DPVisualizer,
  'dynamic-programming': DPVisualizer,
  backtracking:   BacktrackingVisualizer,
  greedy:         ArrayVisualizer,
  hashing:        ArrayVisualizer,
  fundamentals:   ArrayVisualizer,
}

/* When embedded=true the outer glass wrapper is omitted —
   the parent split panel provides its own background. */
export default function VisualizerCanvas({ algorithmType, themeId, metadata, embedded }) {
  const { currentStep } = useVisualization()
  const VisualizerComponent = VISUALIZER_MAP[algorithmType] || ArrayVisualizer

  const LIGHT_THEMES = new Set(['water', 'puzzle', 'chain', 'books'])
  const isLightTheme = LIGHT_THEMES.has(themeId)

  const inner = (
    <div className="p-4 flex flex-col" style={{ minHeight: 380 }}>
      <VisualizerComponent
        step={currentStep}
        themeId={themeId}
        metadata={metadata}
      />
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
