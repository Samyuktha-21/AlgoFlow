import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Target, BarChart2, Globe, CheckCircle, Share2, Check, Bookmark, BookmarkCheck, Code2, Info } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useVisualization } from '../context/VisualizationContext'
import { useBeginner } from '../context/BeginnerContext'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import categories from '../data/categories.json'
import { parseArrayInput, parseSearchInput, parseGraphInput } from '../utils/validators'
import { getCategoryTheme } from '../themes/themeConfig'
import { recordAlgoView, recordVizRun } from '../firebase/stats'
import { recordAlgorithmView } from '../firebase/algoStats'
import AlgoViewsBadge from '../components/AlgoViewsBadge'

import ThemeBackground from '../components/Visualizer/ThemeBackground'


import VisualizerCanvas from '../components/Visualizer/VisualizerCanvas'
import PlaybackControls from '../components/Visualizer/PlaybackControls'
import InputPanel from '../components/Visualizer/InputPanel'
import CodeBlock from '../components/CodeDisplay/CodeBlock'
import AimPanel from '../components/InfoPanels/AimPanel'
import ComplexityPanel from '../components/InfoPanels/ComplexityPanel'
import ApplicationsPanel from '../components/InfoPanels/ApplicationsPanel'
import Seo from '../components/Seo'
import { getWhyText, deriveResult } from '../utils/stepExplain'
import { getDefaultInput } from '../game/defaultInput'
import { resolveHighlightLine, highlightLangs } from '../utils/highlightLine'

const metaModules  = import.meta.glob('../algorithms/**/*.json')
const stepsModules = import.meta.glob('../algorithms/**/*.js')

const TABS = [
  { id: 'aim',          label: 'Aim',         Icon: Target,    color: '#3b82f6', darkColor: '#60a5fa' },
  { id: 'complexity',   label: 'Complexity',   Icon: BarChart2, color: '#f97316', darkColor: '#fb923c' },
  { id: 'applications', label: 'Applications', Icon: Globe,     color: '#8b5cf6', darkColor: '#a78bfa' },
]


const OP_COLORS_DARK = {
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
const OP_COLORS_LIGHT = {
  compare:   { bg:'rgba(254,243,199,0.9)', text:'#92400e', border:'rgba(251,191,36,0.5)' },
  swap:      { bg:'rgba(254,226,226,0.9)', text:'#991b1b', border:'rgba(239,68,68,0.5)' },
  sorted:    { bg:'rgba(209,250,229,0.9)', text:'#065f46', border:'rgba(52,211,153,0.5)' },
  found:     { bg:'rgba(209,250,229,0.9)', text:'#065f46', border:'rgba(74,222,128,0.5)' },
  visit:     { bg:'rgba(219,234,254,0.9)', text:'#1e40af', border:'rgba(96,165,250,0.5)' },
  backtrack: { bg:'rgba(237,233,254,0.9)', text:'#4c1d95', border:'rgba(167,139,250,0.5)' },
  update:    { bg:'rgba(255,237,213,0.9)', text:'#7c2d12', border:'rgba(251,146,60,0.5)' },
  complete:  { bg:'rgba(209,250,229,0.9)', text:'#065f46', border:'rgba(52,211,153,0.5)' },
  default:   { bg:'rgba(224,231,255,0.9)', text:'#312e81', border:'rgba(99,102,241,0.4)' },
}
const OP_LABELS = {
  compare:'Comparing', swap:'Swap!', sorted:'Sorted ✓', found:'Found! ✓',
  visit:'Visiting', backtrack:'Backtrack ↩', update:'Update', complete:'Complete ✓',
  initialize:'Initialize', pivot:'Pivot', merge:'Merge', divide:'Divide',
  insert:'Insert', relax:'Relax', enqueue:'Enqueue', dequeue:'Dequeue',
}

/* ── Step description bar — pinned INSIDE the visualization panel top ── */
function StepDescBar() {
  const { currentStep, currentIndex } = useVisualization()
  const desc = currentStep?.description || null

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      padding: '0.5rem 1.2rem',
      minHeight: '2.2rem',
      width: '100%',
      borderRadius: '12px 12px 0 0',
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: '0.88rem',
            fontWeight: 500,
            color: desc ? '#f1f5f9' : 'rgba(241,245,249,0.5)',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            lineHeight: 1.4,
            display: 'block',
          }}
        >
          {desc || 'Press play to start visualization'}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

/* ── Compact status bar — op badge, step counter, beginner WHY hint ── */
function StatusBar({ isLight, algorithmType }) {
  const { steps, currentIndex, currentStep } = useVisualization()
  const { beginner } = useBeginner()

  if (!currentStep || steps.length === 0) return null

  const OP_COLORS = isLight ? OP_COLORS_LIGHT : OP_COLORS_DARK
  const op = currentStep.type || 'default'
  const oc = OP_COLORS[op] || OP_COLORS.default
  const opLabel = OP_LABELS[op] || op.toUpperCase()
  const whyText = beginner ? getWhyText(currentStep, algorithmType) : null
  const progress = ((currentIndex + 1) / steps.length) * 100

  return (
    <div style={{
      background: isLight ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.22)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: isLight ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '8px 14px',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <span style={{
          padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:700,
          background:'rgba(59,130,246,0.25)',
          color: isLight ? '#1e40af' : '#93c5fd',
          border:'1px solid rgba(59,130,246,0.4)', whiteSpace:'nowrap', flexShrink:0,
        }}>
          {currentIndex + 1} / {steps.length}
        </span>
        {op !== 'default' && (
          <span style={{
            padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:700,
            background: oc.bg, color: oc.text, border:`1px solid ${oc.border}`,
            textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap', flexShrink:0,
          }}>
            {opLabel}
          </span>
        )}
        {/* Progress bar inline */}
        <div style={{ flex:1, minWidth:60, height:2, background:'rgba(255,255,255,0.12)', borderRadius:1 }}>
          <div style={{
            height:'100%', width:`${progress}%`,
            background: progress >= 100
              ? 'linear-gradient(90deg,#34d399,#10b981)'
              : 'linear-gradient(90deg,#60a5fa,#3b82f6)',
            borderRadius:1, transition:'width 0.3s ease',
          }} />
        </div>
      </div>
      {whyText && (
        <p style={{
          fontSize: 12, marginTop: 5, margin:'5px 0 0 0', lineHeight: 1.55,
          color: isLight ? '#334155' : 'rgba(255,255,255,0.65)',
          paddingLeft: 4, borderLeft: '3px solid rgba(99,102,241,0.4)',
        }}>
          💡 {whyText}
        </p>
      )}
    </div>
  )
}

function FinalAnswerDisplay() {
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
        padding:'16px 20px', borderRadius:14,
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

/* Canonical language order + labels. Tabs are rendered dynamically from the
   languages actually present in an algorithm's code.json, so a language can be
   rolled out incrementally without showing empty panels. */
const LANG_ORDER = ['java', 'c', 'cpp', 'python', 'javascript']
const LANG_LABELS = { java: 'Java', c: 'C', cpp: 'C++', python: 'Python', javascript: 'JavaScript' }
const VALID_LANGS = LANG_ORDER

export default function Algorithm() {
  const { categoryId, algorithmId } = useParams()
  const { user, signInWithGoogle } = useAuth()
  const { isLearned, isBookmarked, toggleLearned, toggleBookmark } = useProgress()
  const { setSteps, play, pause, next, prev, reset, setSpeed, goTo, isPlaying, steps, currentIndex } = useVisualization()
  const prefersReducedMotion = useReducedMotion()

  /* ── Shareable-link params: ?input=&target=&step=&lang= ── */
  const [searchParams] = useSearchParams()
  const sharedInput  = searchParams.get('input')
  const sharedTarget = searchParams.get('target')
  const sharedStep   = searchParams.get('step')
  const sharedLang   = searchParams.get('lang')

  const [lastRun, setLastRun] = useState({ input: '', target: '' })
  const [shared, setShared]   = useState(false)

  /* Feed the homepage live "algos explored" counter + this algorithm's own view count */
  useEffect(() => {
    recordAlgoView()
    recordAlgorithmView(categoryId, algorithmId)
  }, [categoryId, algorithmId])

  /* One bundle per algorithm, tagged with the route it was loaded for, so
     "which algorithm is on screen" and "are we still loading" are derived from
     the route rather than reset by the loader effect. */
  const loadKey  = `${categoryId}/${algorithmId}`
  const metaPath = `../algorithms/${categoryId}/${algorithmId}/metadata.json`
  const missing  = !metaModules[metaPath]
  const [bundle, setBundle] = useState({ key: null, metadata: null, codeData: null, stepsModule: null, failed: false })
  const ready          = bundle.key === loadKey
  const metadata       = ready ? bundle.metadata    : null
  const codeData       = ready ? bundle.codeData    : null
  const stepsModule    = ready ? bundle.stepsModule : null
  const notImplemented = missing || (ready && bundle.failed)
  const isLoading      = !missing && !ready

  const [activeTab, setActiveTab]     = useState('aim')
  const [language, setLanguage]       = useState(() => VALID_LANGS.includes(sharedLang) ? sharedLang : 'java')
  /* Latch, not render state: whether this route already kicked off its demo run. */
  const autoRunKey = useRef(null)

  /* ── Split-screen state ── */
  const [leftWidth, setLeftWidth] = useState(() => {
    try { const s = localStorage.getItem('algoflow-split-ratio'); return s ? parseFloat(s) : 60 }
    catch { return 60 }
  })
  const [divHover, setDivHover] = useState(false)
  const [isWide, setIsWide]     = useState(true)
  const containerRef = useRef(null)
  const dragging     = useRef(false)

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 900)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Keyboard shortcuts for the visualizer (ignored while typing) ── */
  const kbRef = useRef({})
  /* Keep the ref fresh each render without touching it during render */
  useEffect(() => {
    kbRef.current = { isPlaying, play, pause, next, prev, reset, hasSteps: steps.length > 0 }
  })
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      const tag = t?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable) return
      const k = kbRef.current
      if (!k.hasSteps) return
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        k.isPlaying ? k.pause() : k.play()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); k.next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); k.prev()
      } else if (e.key === 'r' || e.key === 'R') {
        k.reset()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = Math.max(25, Math.min(75, ((e.clientX - rect.left) / rect.width) * 100))
      setLeftWidth(pct)
      try { localStorage.setItem('algoflow-split-ratio', String(pct)) } catch { /* storage unavailable */ }
    }
    const onUp = () => { dragging.current = false }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const category    = categories.find(c => c.id === categoryId)
  const themeId     = category?.theme || 'circuit'
  const isLight     = new Set(['water','puzzle','chain','books']).has(themeId)
  const themeConf   = getCategoryTheme(themeId)
  const themeAccent = themeConf.accent
  const themeAccRgb = themeConf.accentRgb || '99,102,241'

  const glass = {
    background: isLight ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
    border: isLight ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  }
  const textPrimary = isLight ? '#0f172a' : '#f8fafc'
  const textMuted   = isLight ? '#334155' : 'rgba(255,255,255,0.6)'

  /* Load algorithm files */
  useEffect(() => {
    if (missing) return
    let cancelled = false

    const codePath  = `../algorithms/${categoryId}/${algorithmId}/code.json`
    const stepsPath = `../algorithms/${categoryId}/${algorithmId}/steps.js`

    Promise.all([
      metaModules[metaPath](),
      metaModules[codePath] ? metaModules[codePath]() : Promise.resolve(null),
      stepsModules[stepsPath] ? stepsModules[stepsPath]() : Promise.resolve(null),
    ]).then(([meta, code, steps]) => {
      if (cancelled) return
      /* Drop the previous algorithm's frames as the new bundle lands, so the
         old animation can never play under the new title. */
      setSteps([])
      setBundle({
        key: loadKey,
        metadata: meta?.default || meta,
        codeData: code?.default || code,
        stepsModule: steps,
        failed: false,
      })
    }).catch((err) => {
      console.error('Algorithm load error:', err)
      if (cancelled) return
      setSteps([])
      setBundle({ key: loadKey, metadata: null, codeData: null, stepsModule: null, failed: true })
    })

    return () => { cancelled = true }
  }, [categoryId, algorithmId, loadKey, metaPath, missing, setSteps])

  /* Languages this algorithm actually ships, in canonical order; the effective
     language falls back to the first available if the selected one is absent. */
  const availableLangs  = LANG_ORDER.filter(l => codeData && codeData[l])
  const activeLang      = codeData && codeData[language] ? language : (availableLangs[0] || language)
  const currentCode     = codeData?.[activeLang]?.code || ''
  const { currentStep } = useVisualization()
  /* codeLine is authored against the Java block; translate it to the active
     language via code.json's lineMap (Java = identity; unmapped = no highlight). */
  const highlightedLine = resolveHighlightLine(currentStep?.codeLine, activeLang, codeData?.lineMap)

  /* Which languages follow along with the playback for THIS algorithm. Read
     from the data so the answer stays honest per algorithm rather than being
     a blanket claim. A few algorithms emit no codeLine at all, in which case
     not even Java highlights and the list comes back empty. */
  const stepsHaveCodeLine = steps.some(s => typeof s?.codeLine === 'number')
  const litLangs          = highlightLangs(codeData?.lineMap, stepsHaveCodeLine)
  const litLabel          = litLangs.map(l => LANG_LABELS[l] || l).join(' and ')
  const highlightNote     = litLangs.length
    ? `Line highlighting follows the animation in ${litLabel}. Other languages show the same algorithm without a synced highlight.`
    : 'This algorithm has no per-step line highlighting yet.'

  const handleVisualize = useCallback((inputStr, targetStr) => {
    if (!stepsModule?.generateSteps) return { error: 'Algorithm not yet implemented' }
    const type      = metadata?.type || 'sorting'
    const inputType = metadata?.inputType
    setLastRun({ input: inputStr || '', target: targetStr || '' })

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
    } else if (inputType === 'stringPair') {
      const raw = (inputStr || '').trim()
      if (!raw) return { error: 'Enter two strings separated by a comma, e.g. ABCBDAB,BDCAB' }
      const parts = raw.split(',')
      if (parts.length < 2) return { error: 'Enter two strings separated by a comma, e.g. ABCBDAB,BDCAB' }
      const s1 = parts[0].trim().toUpperCase()
      const s2 = parts.slice(1).join(',').trim().toUpperCase()
      if (!s1 || !s2) return { error: 'Both strings must be non-empty' }
      setSteps(stepsModule.generateSteps(s1, s2))
    } else if (inputType === 'singleString') {
      const raw = (inputStr || '').trim()
      if (!raw) return { error: 'Enter a string, e.g. racecar' }
      setSteps(stepsModule.generateSteps(raw))
    } else {
      const p = parseArrayInput(inputStr)
      if (p.error) return { error: p.error }
      setSteps(stepsModule.generateSteps(p.array))
    }
    recordVizRun()
    return {}
  }, [stepsModule, metadata, setSteps])

  useEffect(() => {
    if (!metadata || !stepsModule?.generateSteps || isLoading) return
    if (autoRunKey.current === loadKey) return
    autoRunKey.current = loadKey
    const def = getDefaultInput(metadata.type, metadata.inputType)
    /* Seed from a shared link if present, otherwise use the default input */
    const initInput  = sharedInput  ?? def.input
    const initTarget = sharedTarget ?? (def.target || '')
    const result = handleVisualize(initInput, initTarget)
    if (result?.error) return
    if (sharedStep != null) {
      /* Restore the exact step from a shared link (steps are set by now) */
      const n = parseInt(sharedStep, 10)
      if (!Number.isNaN(n)) setTimeout(() => goTo(n), 60)
    } else if (!prefersReducedMotion) {
      /* Respect reduced-motion: seed the steps but don't auto-animate */
      setSpeed('0.5x')
      setTimeout(() => play(), 600)
    }
  }, [metadata, stepsModule, isLoading, loadKey, handleVisualize, play, setSpeed,
      goTo, prefersReducedMotion, sharedInput, sharedTarget, sharedStep])

  const defaultInput = metadata ? getDefaultInput(metadata.type, metadata.inputType) : null
  const shownInput   = sharedInput  ?? defaultInput?.input
  const shownTarget  = sharedTarget ?? defaultInput?.target

  const handleShare = async () => {
    const params = new URLSearchParams()
    const input  = lastRun.input  || shownInput  || ''
    const target = lastRun.target || shownTarget || ''
    if (input)  params.set('input', input)
    if (target) params.set('target', target)
    params.set('lang', language)
    params.set('step', String(currentIndex))
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 1500)
    } catch { /* clipboard unavailable */ }
  }

  /* ── Loading state ── */
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

  /* ── Not found state ── */
  if (notImplemented || !metadata) {
    return (
      <div style={{ position:'relative', minHeight:'100vh' }}>
        <ThemeBackground themeId={themeId} variant="page" />
        <div style={{ position:'relative', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:16, padding:'0 24px' }}>
          <div style={{ ...glass, padding:'40px 48px', textAlign:'center' }}>
            <p style={{ fontSize:48, marginBottom:12 }}>🔍</p>
            <h2 style={{ fontSize:24, fontWeight:700, color: textPrimary, marginBottom:8 }}>Algorithm Not Found</h2>
            <p style={{ color: textMuted, maxWidth:400, lineHeight:1.6 }}>
              The page <code style={{ fontSize:13, padding:'2px 6px', borderRadius:4, background:'rgba(255,255,255,0.1)' }}>/{categoryId}/{algorithmId}</code> doesn't match any known algorithm.
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
      <Seo
        title={`${metadata.name}${category?.name ? ` — ${category.name}` : ''}`}
        description={metadata.description}
        type="article"
      />
      <ThemeBackground themeId={themeId} variant="page" />

      <div style={{ position:'relative', zIndex:10 }}>

        {/* ── Breadcrumb ── */}
        <div style={{
          ...glass, borderRadius:0, borderLeft:'none', borderRight:'none', borderTop:'none',
          position:'sticky', top:56, zIndex:40, padding:'8px 12px',
        }}>
          <div className="flex items-center gap-1.5 text-sm flex-wrap">
            <Link to="/" style={{ color: textMuted }} className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight size={13} style={{ color: textMuted }} />
            <Link to={`/category/${categoryId}`} style={{ color: textMuted }} className="hover:text-blue-400 transition-colors">
              {category?.name}
            </Link>
            <ChevronRight size={13} style={{ color: textMuted }} />
            <span style={{ fontWeight:600, color: textPrimary }}>{metadata.name}</span>
          </div>
        </div>

        <div className="w-full px-3 py-6 space-y-4">

          {/* ── Page title ── */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 style={{ fontSize:24, fontWeight:700, color: textPrimary }}>{metadata.name}</h1>
              <span style={{
                fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:600,
                background:'rgba(59,130,246,0.2)', color: isLight ? '#1e40af' : '#93c5fd',
                border:'1px solid rgba(59,130,246,0.35)',
              }}>Live</span>
              <AlgoViewsBadge categoryId={categoryId} algorithmId={algorithmId} isLight={isLight} />
              <Link
                to={`/practice?topic=${categoryId}&algo=${algorithmId}`}
                style={{
                  marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  color: isLight ? '#b45309' : '#fdba74',
                  background: 'rgba(245,129,31,0.14)', border: '1px solid rgba(245,129,31,0.35)',
                  textDecoration: 'none',
                }}
              >
                <Code2 size={14} /> Practice
              </Link>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleLearned(categoryId, algorithmId)}
                    title={isLearned(categoryId, algorithmId) ? 'Learned — click to unmark' : 'Mark as learned'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      color: isLearned(categoryId, algorithmId) ? (isLight ? '#065f46' : '#6ee7b7') : (isLight ? '#334155' : '#cbd5e1'),
                      background: isLearned(categoryId, algorithmId) ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.12)',
                      border: `1px solid ${isLearned(categoryId, algorithmId) ? 'rgba(52,211,153,0.5)' : 'rgba(148,163,184,0.3)'}`,
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                  >
                    <CheckCircle size={14} /> {isLearned(categoryId, algorithmId) ? 'Learned' : 'Mark learned'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(categoryId, algorithmId)}
                    aria-label={isBookmarked(categoryId, algorithmId) ? 'Remove bookmark' : 'Bookmark this algorithm'}
                    title={isBookmarked(categoryId, algorithmId) ? 'Bookmarked — click to remove' : 'Bookmark'}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                      color: isBookmarked(categoryId, algorithmId) ? '#fbbf24' : (isLight ? '#64748b' : '#94a3b8'),
                      background: isBookmarked(categoryId, algorithmId) ? 'rgba(251,191,36,0.15)' : 'rgba(148,163,184,0.12)',
                      border: `1px solid ${isBookmarked(categoryId, algorithmId) ? 'rgba(251,191,36,0.5)' : 'rgba(148,163,184,0.3)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    {isBookmarked(categoryId, algorithmId) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    color: isLight ? '#1e40af' : '#93c5fd',
                    background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.35)',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                >
                  <CheckCircle size={14} /> Sign in to track progress
                </button>
              )}
              <button
                type="button"
                onClick={handleShare}
                aria-label={shared ? 'Link copied' : 'Copy shareable link'}
                title="Copy a link to this input & step"
                style={{
                  marginLeft: 8, display:'flex', alignItems:'center', gap:6,
                  padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
                  color: shared ? '#34d399' : (isLight ? '#1e40af' : '#93c5fd'),
                  background: shared ? 'rgba(52,211,153,0.12)' : 'rgba(59,130,246,0.14)',
                  border: `1px solid ${shared ? 'rgba(52,211,153,0.5)' : 'rgba(59,130,246,0.35)'}`,
                  transition: 'all 0.15s',
                }}
              >
                {shared ? <Check size={14} /> : <Share2 size={14} />}
                {shared ? 'Copied!' : 'Share'}
              </button>
            </div>
            <p style={{ fontSize:14, color: textMuted, lineHeight:1.6, maxWidth:780 }}>
              {metadata.description}
            </p>
          </div>

          {/* ══ SPLIT SCREEN: Visualization (left) + Code (right) ══ */}
          <div
            ref={containerRef}
            style={{
              display: 'flex',
              flexDirection: isWide ? 'row' : 'column',
              minHeight: 460,
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {/* ── Left panel: visualization ── */}
            <div style={{
              width: isWide ? `${leftWidth}%` : '100%',
              flexShrink: 0,
              minWidth: isWide ? '25%' : undefined,
              /* overflow:auto allows sticky children to stick inside this panel */
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              background: isLight ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.28)',
              backdropFilter: 'blur(16px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
              borderRight: isWide
                ? (isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.07)')
                : 'none',
              borderBottom: !isWide
                ? (isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.07)')
                : 'none',
            }}>
              {/* ▶ Step description bar — sticky inside panel top (FIX 1) */}
              <StepDescBar />

              {/* Visualization canvas */}
              <div style={{ flex: 1 }}>
                <VisualizerCanvas
                  algorithmType={metadata.type}
                  themeId={themeId}
                  metadata={metadata}
                  embedded
                />
              </div>
            </div>

            {/* ── Drag divider (desktop only) ── */}
            {isWide && (
              <div
                onMouseDown={() => { dragging.current = true }}
                onMouseEnter={() => setDivHover(true)}
                onMouseLeave={() => setDivHover(false)}
                style={{
                  width: 6, cursor: 'col-resize', flexShrink: 0, zIndex: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: divHover ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.2s', userSelect: 'none',
                }}
              >
                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:3, height:3, borderRadius:'50%', background:'white', opacity: divHover ? 0.6 : 0.25 }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Right panel: code ── */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              width: isWide ? undefined : '100%',
              minWidth: isWide ? '25%' : undefined,
              minHeight: isWide ? undefined : 300,
              background: 'rgba(8,12,28,0.85)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              overflow: 'hidden',
            }}>
              {/* Language tabs */}
              <div style={{
                display:'flex', alignItems:'center',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding:'0 12px', flexShrink:0,
                background: 'rgba(0,0,0,0.25)', gap:2,
              }}>
                {availableLangs.map(lang => {
                  const active = activeLang === lang
                  const label  = LANG_LABELS[lang] || lang
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      style={{
                        padding:'10px 18px', fontSize:12, fontWeight:700,
                        background: active ? `rgba(${themeAccRgb},0.18)` : 'transparent',
                        color: active ? themeAccent : 'rgba(255,255,255,0.4)',
                        borderBottom: active ? `2px solid ${themeAccent}` : '2px solid transparent',
                        borderRadius: active ? '6px 6px 0 0' : 0,
                        transition:'all 0.2s', cursor:'pointer',
                        textTransform:'uppercase', letterSpacing:'0.07em',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
                {/* Which languages actually follow the animation. Shown as a
                    quiet marker rather than a warning — the other languages
                    are still correct code, they just have no synced line. */}
                <span
                  title={highlightNote}
                  tabIndex={0}
                  aria-label={highlightNote}
                  style={{
                    marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:4,
                    fontSize:10, paddingRight:8, cursor:'help', userSelect:'none',
                    color: litLangs.includes(activeLang) ? `rgba(${themeAccRgb},0.75)` : 'rgba(255,255,255,0.3)',
                  }}
                >
                  <Info size={12} />
                  {litLangs.length ? litLabel : 'no highlight'}
                </span>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)', paddingRight:8, userSelect:'none' }}>
                  ←→ drag to resize
                </span>
              </div>

              {/* Code body — self-contained scroll handled by CodeBlock */}
              <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
                {currentCode ? (
                  <CodeBlock
                    code={currentCode}
                    language={activeLang}
                    highlightedLine={highlightedLine}
                    accentColor={themeAccent}
                    accentRgb={themeAccRgb}
                    inPanel
                  />
                ) : (
                  <div style={{
                    display:'flex', alignItems:'center', justifyContent:'center',
                    height:200, color:'rgba(255,255,255,0.2)', fontSize:13,
                  }}>
                    No code available
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* ══ end split screen ══ */}

          {/* ── Final answer ── */}
          <FinalAnswerDisplay isLight={isLight} />

          {/* ── Compact status bar: op badge + step counter + WHY hint ── */}
          <StatusBar isLight={isLight} algorithmType={metadata.type} />

          {/* ── Controls ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-3">
              <InputPanel
                key={`${categoryId}/${algorithmId}/${shownInput ?? ''}/${shownTarget ?? ''}`}
                algorithmType={metadata.type}
                inputType={metadata.inputType}
                onVisualize={handleVisualize}
                defaultValue={shownInput}
                defaultTarget={shownTarget}
              />
            </div>
            <div className="lg:col-span-2">
              <PlaybackControls disabled={!stepsModule} />
            </div>
          </div>

          {/* ── Info tabs: Aim | Complexity | Applications ── */}
          <div style={{ ...glass, overflow:'hidden' }}>
            <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.1)', overflowX:'auto' }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id
                const color = tab.darkColor
                return (
                  <button
                    type="button"
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
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-4 }}
                transition={{ duration:0.2 }}
                style={{ padding:28, minHeight:300, borderLeft:`5px solid ${tabAccent}` }}
              >
                {activeTab === 'aim'          && <AimPanel metadata={metadata} isLight={isLight} />}
                {activeTab === 'complexity'   && <ComplexityPanel metadata={metadata} isLight={isLight} />}
                {activeTab === 'applications' && <ApplicationsPanel metadata={metadata} isLight={isLight} />}
              </motion.div>
            </AnimatePresence>
          </div>


        </div>
      </div>
    </div>
  )
}
