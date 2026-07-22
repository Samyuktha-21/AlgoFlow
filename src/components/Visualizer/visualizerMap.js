import { lazy } from 'react'

/* Each visualizer is code-split so a page only downloads the one its
   algorithm type needs (not all ten). Shared by VisualizerCanvas (the
   algorithm page) and the Test Yourself game. */
const SortVisualizer         = lazy(() => import('./SortVisualizer'))
const SearchVisualizer       = lazy(() => import('./SearchVisualizer'))
const GraphVisualizer        = lazy(() => import('./GraphVisualizer'))
const ArrayVisualizer        = lazy(() => import('./ArrayVisualizer'))
const DPVisualizer           = lazy(() => import('./DPVisualizer'))
const TreeVisualizer         = lazy(() => import('./TreeVisualizer'))
const LinkedListVisualizer   = lazy(() => import('./LinkedListVisualizer'))
const StackVisualizer        = lazy(() => import('./StackVisualizer'))
const HeapVisualizer         = lazy(() => import('./HeapVisualizer'))
const BacktrackingVisualizer = lazy(() => import('./BacktrackingVisualizer'))

export const VISUALIZER_MAP = {
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

export const getVisualizer = (type) => VISUALIZER_MAP[type] || ArrayVisualizer
