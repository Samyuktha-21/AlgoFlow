import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Target, Code2, BarChart2, Globe, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useVisualization } from '../context/VisualizationContext'
import { useBeginner } from '../context/BeginnerContext'
import categories from '../data/categories.json'
import { parseArrayInput, parseSearchInput, parseGraphInput } from '../utils/validators'

import ThemeBackground from '../components/Visualizer/ThemeBackground'
import { BeginnerToggleBanner } from '../context/BeginnerContext'
import AlgorithmComments from '../components/AlgorithmComments'
import VisualizerCanvas from '../components/Visualizer/VisualizerCanvas'
import PlaybackControls from '../components/Visualizer/PlaybackControls'
import InputPanel from '../components/Visualizer/InputPanel'
import CodeBlock from '../components/CodeDisplay/CodeBlock'
import LanguageSwitcher from '../components/CodeDisplay/LanguageSwitcher'
import AimPanel from '../components/InfoPanels/AimPanel'
import ComplexityPanel from '../components/InfoPanels/ComplexityPanel'
import ApplicationsPanel from '../components/InfoPanels/ApplicationsPanel'

const metaModules  = import.meta.glob('../algorithms/**/*.json')
const stepsModules = import.meta.glob('../algorithms/**/*.js')

const TABS = [
  { id: 'aim',          label: 'Aim',          Icon: Target,    color: '#3b82f6', darkColor: '#60a5fa' },
  { id: 'code',         label: 'Code',          Icon: Code2,     color: '#22c55e', darkColor: '#4ade80' },
  { id: 'complexity',   label: 'Complexity',    Icon: BarChart2, color: '#f97316', darkColor: '#fb923c' },
  { id: 'applications', label: 'Applications',  Icon: Globe,     color: '#8b5cf6', darkColor: '#a78bfa' },
]

const LIGHT_PAGE_THEMES = new Set(['water', 'puzzle', 'chain', 'books'])

const OP_COLORS = {
  compare:   { bg:'rgba(251,191,36,0.18)', text:'#fcd34d', border:'rgba(251,191,36,0.4)' },
  swap:      { bg:'rgba(248,113,113,0.18)', text:'#fca5a5', border:'rgba(248,113,113,0.4)' },
  sorted:    { bg:'rgba(52,211,153,0.18)', text:'#6ee7b7', border:'rgba(52,211,153,0.4)' },
  found:     { bg:'rgba(74,222,128,0.18)', text:'#86efac', border:'rgba(74,222,128,0.4)' },
  visit:     { bg:'rgba(96,165,250,0.18)', text:'#93c5fd', border:'rgba(96,165,250,0.4)' },
  backtrack: { bg:'rgba(192,132,252,0.18)', text:'#d8b4fe', border:'rgba(192,132,252,0.4)' },
  update:    { bg:'rgba(251,146,60,0.18)', text:'#fdba74', border:'rgba(251,146,60,0.4)' },
  complete:  { bg:'rgba(52,211,153,0.22)', text:'#34d399', border:'rgba(52,211,153,0.5)' },
  default:   { bg:'rgba(99,102,241,0.15)', text:'#a5b4fc', border:'rgba(99,102,241,0.35)' },
}
const OP_LABELS = {
  compare:'Comparing', swap:'Swap!', sorted:'Sorted ✓', found:'Found! ✓',
  visit:'Visiting', backtrack:'Backtrack ↩', update:'Update', complete:'Complete ✓',
  initialize:'Initialize', pivot:'Pivot', merge:'Merge', divide:'Divide',
  insert:'Insert', relax:'Relax', enqueue:'Enqueue', dequeue:'Dequeue',
}

/* ── Default inputs per algorithm type (for auto-run) ── */
function getDefaultInput(type) {
  switch (type) {
    case 'sorting':     return { input: '64, 34, 25, 12, 22, 11, 90', target: '' }
    case 'searching':   return { input: '2, 5, 8, 12, 16, 23, 38, 56, 72, 91', target: '23' }
    case 'graph':       return { input: '0-1, 0-2, 1-3, 1-4, 2-5, 2-6', target: '' }
    case 'tree':        return { input: '4, 2, 6, 1, 3, 5, 7', target: '' }
    case 'heap':        return { input: '90, 70, 80, 40, 50, 60, 30', target: '' }
    case 'dp':          return { input: '5, 3, 8, 1, 9, 2, 7', target: '' }
    case 'dynamic-programming': return { input: '5, 3, 8, 1, 9, 2, 7', target: '' }
    case 'backtracking':return { input: '4, 2, 6, 1, 3', target: '' }
    case 'linked-list': return { input: '1, 2, 3, 4, 5', target: '' }
    case 'stack':       return { input: '3, 7, 2, 5, 8, 4', target: '' }
    case 'queue':       return { input: '3, 7, 2, 5, 8, 4', target: '' }
    case 'array':       return { input: '3, 1, 4, 1, 5, 9, 2, 6', target: '' }
    case 'fundamentals':return { input: '5, 3, 7, 1, 9, 4, 6', target: '' }
    case 'hashing':     return { input: '12, 24, 36, 15, 27', target: '' }
    case 'greedy':      return { input: '10, 20, 30, 5, 15', target: '' }
    default:            return { input: '5, 3, 7, 1, 9', target: '' }
  }
}

/* ── Contextual "WHY" explanation generator ── */
function getWhyText(step, algorithmType) {
  if (!step) return null
  const { type, array, comparing, swapping, sorted, target, mid, low, high, current, queue, visited, pivot } = step

  // Sorting: compare
  if (type === 'compare' && Array.isArray(comparing) && comparing.length >= 2 && array) {
    const [i, j] = comparing
    const a = array[i], b = array[j]
    if (a !== undefined && b !== undefined) {
      if (a > b) return `${a} > ${b} — out of order for ascending sort, so they'll be swapped`
      return `${a} ≤ ${b} — already in the right order, no swap needed`
    }
  }

  // Sorting: swap
  if (type === 'swap' && Array.isArray(swapping) && swapping.length >= 2 && array) {
    const [i, j] = swapping
    const a = array[i], b = array[j]
    if (a !== undefined && b !== undefined)
      return `Moving ${a} and ${b} — the larger value bubbles toward the end of the array`
  }

  // Sorting: pivot selected
  if (type === 'pivot' && pivot !== undefined && array) {
    return `${array[pivot]} is the pivot — everything smaller goes left, everything larger goes right`
  }

  // Sorting: position sorted
  if (type === 'sorted' && Array.isArray(sorted))
    return `This position is now permanent — the correct value is locked in place`

  // Searching: binary compare
  if ((algorithmType === 'searching' || type === 'compare') && mid !== undefined && target !== undefined && array) {
    const midVal = array[mid]
    if (midVal === target) return `Middle value ${midVal} equals target — found it!`
    if (target < midVal) return `Target ${target} < middle value ${midVal} — search the LEFT half next (discard right)`
    return `Target ${target} > middle value ${midVal} — search the RIGHT half next (discard left)`
  }
  if (type === 'found') return `Target found! Binary search takes at most log₂(n) comparisons — far faster than checking every element`

  // Graph: BFS visit
  if (type === 'visit' && current !== undefined) {
    if (Array.isArray(queue) && queue.length > 0)
      return `Processing node ${current} from the front of the queue. BFS always expands closest nodes first — like ripples in a pond`
    return `Exploring as deep as possible from node ${current} before backtracking (DFS)`
  }
  if (type === 'enqueue')
    return `Adding unvisited neighbours to the queue so they'll be explored in order of discovery`

  // Backtracking
  if (type === 'backtrack')
    return `Dead end — no valid option here. Backtracking to try a different choice`

  // DP
  if (type === 'update')
    return `Storing this result so we never recompute it — this is memoization, the core of dynamic programming`

  return null
}

function deriveResult(step) {
  if (!step) return null
  if (step.found >= 0) return `Found at index ${step.found}`
  if (step.found === -2) return 'Not found in array'
  if (step.array && step.sorted?.length === step.array.length)
    return step.array.join(' → ')
  if (step.visited?.length > 0 && !step.current && !step.queue?.length)
    return `Visited: ${step.visited.join(' → ')}`
  if (step.result !== undefined) return String(step.result)
  if (step.dp?.length && !step.current) return `dp result: ${step.dp[step.dp.length-1]}`
  if (step.description?.toLowerCase().includes('complete') ||
      step.description?.toLowerCase().includes('sorted'))
    return step.description
  return null
}

/* ── StepInfo panel — now shows WHY in Simple mode ── */
function StepInfo({ isLight, algorithmType }) {
  const { steps, currentIndex, currentStep } = useVisualization()
  const { beginner } = useBeginner()
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!currentStep) return
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 400)
    return () => clearTimeout(t)
  }, [currentIndex])

  if (!currentStep || steps.length === 0) return null

  const progress = ((currentIndex + 1) / steps.length) * 100
  const op = currentStep.type || 'default'
  const oc = OP_COLORS[op] || OP_COLORS.default
  const opLabel = OP_LABELS[op] || op.toUpperCase()
  const whyText = beginner ? getWhyText(currentStep, algorithmType) : null

  return (
    <div style={{
      padding: '14px 18px', borderRadius: 14, marginBottom: 8,
      background: isLight ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.32)',
      backdropFilter: 'blur(12px)',
      border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
      transition: 'box-shadow 0.3s',
      boxShadow: pulse ? '0 0 0 2px rgba(99,102,241,0.4)' : 'none',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom: whyText ? 8 : 0 }}>
        {/* Step counter — prominent */}
        <span style={{
          padding:'4px 12px', borderRadius:20, fontSize:13, fontWeight:700,
          background:'rgba(59,130,246,0.25)', color:'#93c5fd',
          border:'1px solid rgba(59,130,246,0.4)', whiteSpace:'nowrap', flexShrink:0,
        }}>
          Step {currentIndex + 1} / {steps.length}
        </span>

        {/* Operation badge — enlarged */}
        {op !== 'default' && (
          <span style={{
            padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700,
            background: oc.bg, color: oc.text, border:`1px solid ${oc.border}`,
            textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap', flexShrink:0,
          }}>
            {opLabel}
          </span>
        )}

        {/* Main description — 18px minimum */}
        <span style={{
          fontSize: 18, fontWeight:600, flex:1,
          color: isLight ? '#0f172a' : '#f1f5f9',
          textShadow: isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
          lineHeight: 1.4,
        }}>
          {currentStep.description || '—'}
        </span>
      </div>

      {/* WHY text — only in Simple mode */}
      {whyText && (
        <p style={{
          fontSize: 14, color: isLight ? '#334155' : 'rgba(255,255,255,0.65)',
          margin: 0, lineHeight: 1.6,
          paddingLeft: 4, borderLeft: '3px solid rgba(99,102,241,0.4)',
        }}>
          💡 {whyText}
        </p>
      )}

      {/* Progress bar */}
      <div style={{ marginTop:10, height:3, background:'rgba(255,255,255,0.1)', borderRadius:2 }}>
        <div style={{
          height:'100%', width:`${progress}%`,
          background: progress >= 100
            ? 'linear-gradient(90deg,#34d399,#10b981)'
            : 'linear-gradient(90deg,#60a5fa,#3b82f6)',
          borderRadius:2, transition:'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

/* ── FinalAnswerDisplay ── */
function FinalAnswerDisplay({ isLight }) {
  const { steps, isFinished } = useVisualization()
  const lastStep = steps[steps.length - 1]
  if (!isFinished || !lastStep) return null
  const result = deriveResult(lastStep)
  if (!result) return null

  return (
    <motion.div
      initial={{ opacity:0, y:8 }}
      animate={{ opacity:1, y:0 }}
      style={{
        padding:'16px 20px', borderRadius:14, marginBottom:4,
        background:'rgba(52,211,153,0.12)',
        backdropFilter:'blur(12px)',
        border:'2px solid rgba(52,211,153,0.55)',
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <CheckCircle size={20} style={{ color:'#34d399', flexShrink:0 }} />
        <span style={{ fontSize:13, fontWeight:700, color:'#34d399', textTransform:'uppercase', letterSpacing:'0.05em' }}>
          Final Answer
        </span>
        <span style={{
          fontSize:20, fontWeight:800,
          fontFamily:'Fira Code, monospace',
          background:'linear-gradient(135deg,#34d399,#10b981)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          flex:1,
        }}>
          {result}
        </span>
      </div>
    </motion.div>
  )
}

export default function Algorithm() {
  const { categoryId, algorithmId } = useParams()
  const { isDark } = useTheme()
  const { setSteps, play, setSpeed } = useVisualization()

  const [metadata, setMetadata]       = useState(null)
  const [codeData, setCodeData]       = useState(null)
  const [stepsModule, setStepsModule] = useState(null)
  const [isLoading, setIsLoading]     = useState(true)
  const [notImplemented, setNotImplemented] = useState(false)
  const [activeTab, setActiveTab]     = useState('aim')
  const [language, setLanguage]       = useState('java')
  const [autoRunDone, setAutoRunDone] = useState(false)

  const category = categories.find(c => c.id === categoryId)
  const themeId  = category?.theme || 'circuit'
  const isLight  = LIGHT_PAGE_THEMES.has(themeId)

  const glass = {
    background: isLight ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.38)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.13)',
    borderRadius: 16,
  }
  const textPrimary = isLight ? '#0f172a' : '#f8fafc'
  const textMuted   = isLight ? '#334155' : 'rgba(255,255,255,0.6)'

  /* Load algorithm files */
  useEffect(() => {
    let cancelled = false
    setIsLoading(true); setMetadata(null); setCodeData(null)
    setStepsModule(null); setSteps([]); setNotImplemented(false)
    setAutoRunDone(false)   // reset auto-run flag on navigation

    const metaPath  = `../algorithms/${categoryId}/${algorithmId}/metadata.json`
    const codePath  = `../algorithms/${categoryId}/${algorithmId}/code.json`
    const stepsPath = `../algorithms/${categoryId}/${algorithmId}/steps.js`

    if (!metaModules[metaPath]) {
      if (!cancelled) { setNotImplemented(true); setIsLoading(false) }
      return () => { cancelled = true }
    }

    Promise.all([
      metaModules[metaPath](),
      metaModules[codePath] ? metaModules[codePath]() : Promise.resolve(null),
      stepsModules[stepsPath] ? stepsModules[stepsPath]() : Promise.resolve(null),
    ]).then(([meta, code, steps]) => {
      if (cancelled) return
      setMetadata(meta?.default || meta)
      setCodeData(code?.default || code)
      setStepsModule(steps)
      setIsLoading(false)
    }).catch((err) => {
      console.error('Algorithm load error:', err)
      if (!cancelled) { setNotImplemented(true); setIsLoading(false) }
    })

    return () => { cancelled = true }
  }, [categoryId, algorithmId])

  const currentCode      = codeData?.[language]?.code || ''
  const { currentStep }  = useVisualization()
  const highlightedLine  = currentStep?.codeLine || null

  const handleVisualize = useCallback((inputStr, targetStr) => {
    if (!stepsModule?.generateSteps) return { error: 'Algorithm not yet implemented' }
    const type = metadata?.type || 'sorting'
    if (type === 'searching') {
      const p = parseSearchInput(inputStr, targetStr)
      if (p.error) return { error: p.error }
      setSteps(stepsModule.generateSteps(p.array, p.target))
    } else if (type === 'graph') {
      if (inputStr?.trim()) {
        const p = parseGraphInput(inputStr)
        if (p.error) return { error: p.error }
        setSteps(stepsModule.generateSteps(p.nodes, p.edges, 0))
      } else {
        setSteps(stepsModule.generateSteps(null, null, 0))
      }
    } else {
      const p = parseArrayInput(inputStr)
      if (p.error) return { error: p.error }
      setSteps(stepsModule.generateSteps(p.array))
    }
    return {}
  }, [stepsModule, metadata, setSteps])

  /* Auto-run default visualization when algorithm loads */
  useEffect(() => {
    if (!metadata || !stepsModule?.generateSteps || autoRunDone || isLoading) return
    setAutoRunDone(true)
    const def = getDefaultInput(metadata.type)
    const result = handleVisualize(def.input, def.target || '')
    if (!result?.error) {
      setSpeed('0.5x')
      setTimeout(() => play(), 600)   // small delay so the canvas finishes mounting
    }
  }, [metadata, stepsModule, autoRunDone, isLoading, handleVisualize, play, setSpeed])

  /* Compute default input values for InputPanel pre-fill */
  const defaultInput = metadata ? getDefaultInput(metadata.type) : null

  if (isLoading) {
    return (
      <div style={{ position:'relative', minHeight:'100vh' }}>
        <ThemeBackground themeId={themeId} variant="page" />
        <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
            <div className="w-8 h-8 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p style={{ color: textMuted, fontSize:14 }}>Loading algorithm…</p>
          </div>
        </div>
      </div>
    )
  }

  if (notImplemented || !metadata) {
    return (
      <div style={{ position:'relative', minHeight:'100vh' }}>
        <ThemeBackground themeId={themeId} variant="page" />
        <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:16, padding:'0 24px' }}>
          <div style={{ ...glass, padding:'40px 48px', textAlign:'center' }}>
            <p style={{ fontSize:48, marginBottom:12 }}>🔍</p>
            <h2 style={{ fontSize:24, fontWeight:700, color: textPrimary, marginBottom:8 }}>Algorithm Not Found</h2>
            <p style={{ color: textMuted, maxWidth:400, lineHeight:1.6 }}>
              The page <code style={{ fontSize:13, padding:'2px 6px', borderRadius:4, background:'rgba(255,255,255,0.1)' }}>/{categoryId}/{algorithmId}</code> doesn't match any known algorithm. Try navigating from the category page.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:20 }}>
              <Link to={`/category/${categoryId}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Back to {category?.name}
              </Link>
              <Link to="/" style={{ padding:'8px 16px', borderRadius:8, fontSize:14, fontWeight:500, border:'1px solid rgba(255,255,255,0.2)', color: textMuted }}>
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const activeTabDef = TABS.find(t => t.id === activeTab)
  const tabAccent    = activeTabDef?.darkColor || '#60a5fa'

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <ThemeBackground themeId={themeId} variant="page" />

      <div style={{ position:'relative', zIndex:10 }}>

        {/* Breadcrumb */}
        <div style={{
          ...glass, borderRadius:0, borderLeft:'none', borderRight:'none', borderTop:'none',
          position:'sticky', top:56, zIndex:40, padding:'8px 20px',
        }}>
          <div className="max-w-[1400px] mx-auto flex items-center gap-1.5 text-sm flex-wrap">
            <Link to="/" style={{ color: textMuted }} className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight size={13} style={{ color: textMuted }} />
            <Link to={`/category/${categoryId}`} style={{ color: textMuted }} className="hover:text-blue-400 transition-colors">
              {category?.name}
            </Link>
            <ChevronRight size={13} style={{ color: textMuted }} />
            <span style={{ fontWeight:600, color: textPrimary }}>{metadata.name}</span>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-5 py-6 space-y-4">

          {/* Page title */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 style={{ fontSize:24, fontWeight:700, color: textPrimary }}>{metadata.name}</h1>
              <span style={{
                fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:600,
                background:'rgba(59,130,246,0.2)', color:'#93c5fd', border:'1px solid rgba(59,130,246,0.35)',
              }}>Live</span>
            </div>
            <p style={{ fontSize:14, color: textMuted, lineHeight:1.6, maxWidth:780 }}>
              {metadata.description}
            </p>
          </div>

          {/* Beginner toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <BeginnerToggleBanner />
          </div>

          {/* ── STEP INFO — moved ABOVE the visualization ── */}
          <StepInfo isLight={isLight} algorithmType={metadata.type} />

          {/* Visualization */}
          <VisualizerCanvas
            algorithmType={metadata.type}
            themeId={themeId}
            metadata={metadata}
          />

          {/* Final answer */}
          <FinalAnswerDisplay isLight={isLight} />

          {/* Controls row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-3">
              <InputPanel
                algorithmType={metadata.type}
                onVisualize={handleVisualize}
                defaultValue={defaultInput?.input}
                defaultTarget={defaultInput?.target}
              />
            </div>
            <div className="lg:col-span-2">
              <PlaybackControls disabled={!stepsModule} />
            </div>
          </div>

          {/* Info tabs */}
          <div style={{ ...glass, overflow:'hidden' }}>
            <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.1)', overflowX:'auto' }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id
                const color = tab.darkColor
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:6,
                      padding:'14px 22px', fontSize:13, fontWeight:600,
                      whiteSpace:'nowrap', flexShrink:0,
                      borderBottom: isActive ? `3px solid ${color}` : '3px solid transparent',
                      color: isActive ? color : textMuted,
                      background: isActive ? `${color}0f` : 'transparent',
                      transition:'all 0.18s', cursor:'pointer',
                    }}
                  >
                    <tab.Icon size={14} />
                    {tab.label}
                  </button>
                )
              })}
              {activeTab === 'code' && (
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', padding:'0 16px', flexShrink:0 }}>
                  <LanguageSwitcher selected={language} onChange={setLanguage} />
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-4 }}
                transition={{ duration:0.2 }}
                style={{ padding:28, minHeight:440, borderLeft:`5px solid ${tabAccent}` }}
              >
                {activeTab === 'aim' && <AimPanel metadata={metadata} />}
                {activeTab === 'code' && (
                  <CodeBlock code={currentCode} language={language} highlightedLine={highlightedLine} />
                )}
                {activeTab === 'complexity' && <ComplexityPanel metadata={metadata} />}
                {activeTab === 'applications' && <ApplicationsPanel metadata={metadata} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Comments */}
          <div style={{ ...glass, overflow:'hidden', marginTop: 0 }}>
            <AlgorithmComments algorithmId={algorithmId} />
          </div>

        </div>
      </div>
    </div>
  )
}
