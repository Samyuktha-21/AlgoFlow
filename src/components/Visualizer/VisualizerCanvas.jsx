import { useVisualization } from '../../context/VisualizationContext'
import ThemeBackground from './ThemeBackground'
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
import { useTheme } from '../../context/ThemeContext'

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

export default function VisualizerCanvas({ algorithmType, themeId, metadata }) {
  const { currentStep } = useVisualization()
  const { isDark } = useTheme()

  const VisualizerComponent = VISUALIZER_MAP[algorithmType] || ArrayVisualizer

  return (
    <ThemeBackground themeId={themeId} className={`border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="p-4 min-h-[420px] flex flex-col">
        <VisualizerComponent
          step={currentStep}
          themeId={themeId}
          metadata={metadata}
        />
      </div>
    </ThemeBackground>
  )
}
