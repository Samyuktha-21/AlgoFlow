import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Target, Code2, BarChart2, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useVisualization } from '../context/VisualizationContext'
import categories from '../data/categories.json'
import { parseArrayInput, parseSearchInput, parseGraphInput } from '../utils/validators'

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
  { id: 'aim',          label: 'Aim',          Icon: Target,    color: '#3b82f6', darkColor: '#60a5fa', border: '#bfdbfe' },
  { id: 'code',         label: 'Code',          Icon: Code2,     color: '#22c55e', darkColor: '#4ade80', border: '#bbf7d0' },
  { id: 'complexity',   label: 'Complexity',    Icon: BarChart2, color: '#f97316', darkColor: '#fb923c', border: '#fed7aa' },
  { id: 'applications', label: 'Applications',  Icon: Globe,     color: '#8b5cf6', darkColor: '#a78bfa', border: '#ddd6fe' },
]

export default function Algorithm() {
  const { categoryId, algorithmId } = useParams()
  const { isDark } = useTheme()
  const { setSteps } = useVisualization()

  const [metadata, setMetadata]     = useState(null)
  const [codeData, setCodeData]     = useState(null)
  const [stepsModule, setStepsModule] = useState(null)
  const [isLoading, setIsLoading]   = useState(true)
  const [notImplemented, setNotImplemented] = useState(false)

  const [activeTab, setActiveTab]   = useState('aim')
  const [language, setLanguage]     = useState('java')

  const category = categories.find(c => c.id === categoryId)

  useEffect(() => {
    setIsLoading(true)
    setMetadata(null)
    setCodeData(null)
    setStepsModule(null)
    setSteps([])
    setNotImplemented(false)

    const metaPath  = `../algorithms/${categoryId}/${algorithmId}/metadata.json`
    const codePath  = `../algorithms/${categoryId}/${algorithmId}/code.json`
    const stepsPath = `../algorithms/${categoryId}/${algorithmId}/steps.js`

    if (!metaModules[metaPath]) {
      setNotImplemented(true)
      setIsLoading(false)
      return
    }

    Promise.all([
      metaModules[metaPath](),
      metaModules[codePath] ? metaModules[codePath]() : Promise.resolve(null),
      stepsModules[stepsPath] ? stepsModules[stepsPath]() : Promise.resolve(null),
    ]).then(([meta, code, steps]) => {
      setMetadata(meta?.default || meta)
      setCodeData(code?.default || code)
      setStepsModule(steps)
      setIsLoading(false)
    }).catch(() => {
      setNotImplemented(true)
      setIsLoading(false)
    })
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

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading algorithm…</p>
        </div>
      </div>
    )
  }

  /* ── Not implemented ── */
  if (notImplemented || !metadata) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="text-5xl">🚧</div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Coming Soon</h2>
        <p className={`text-center max-w-md ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          This algorithm visualization is being built. Check back soon!
        </p>
        <div className="flex gap-3">
          <Link to={`/category/${categoryId}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Back to {category?.name || 'Category'}
          </Link>
          <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}>Home</Link>
        </div>
      </div>
    )
  }

  const activeTabDef = TABS.find(t => t.id === activeTab)
  const tabColor = isDark ? activeTabDef?.darkColor : activeTabDef?.color

  /* ── Theme-aware page backgrounds ── */
  const PAGE_BG = {
    water:    isDark ? 'bg-[#040e1a]' : 'bg-[#082f49]',
    network:  'bg-[#000000]',
    forest:   isDark ? 'bg-[#0a1a0a]' : 'bg-[#052e0e]',
    light:    isDark ? 'bg-[#020617]' : 'bg-[#0f172a]',
    maze:     isDark ? 'bg-[#040f06]' : 'bg-[#052e16]',
    circuit:  'bg-[#030712]',
    default:  isDark ? 'bg-gray-900' : 'bg-gray-50',
  }
  const pageBg = PAGE_BG[category?.theme] || PAGE_BG.default
  const isImmersive = ['water','network','forest','light','maze','circuit'].includes(category?.theme)

  /* ── Main layout ── */
  return (
    <div className={`min-h-screen ${pageBg}`}>
      {/* Breadcrumb */}
      <div className={`border-b sticky top-14 z-40 backdrop-blur-sm ${
        isImmersive
          ? 'border-white/10 bg-black/40'
          : isDark ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'
      }`}>
        <div className="max-w-[1400px] mx-auto px-5 py-2.5 flex items-center gap-1.5 text-sm flex-wrap">
          <Link to="/" className={`hover:text-blue-500 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Home
          </Link>
          <ChevronRight size={13} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
          <Link to={`/category/${categoryId}`}
            className={`hover:text-blue-500 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {category?.name}
          </Link>
          <ChevronRight size={13} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{metadata.name}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 py-6 space-y-5">

        {/* ── Page title ── */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className={`text-2xl font-bold ${isImmersive ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {metadata.name}
            </h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              isImmersive ? 'bg-white/10 text-white/70 border border-white/20'
              : isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              Live
            </span>
          </div>
          <p className={`text-sm leading-relaxed max-w-3xl ${
            isImmersive ? 'text-white/60' : isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {metadata.description}
          </p>
        </div>

        {/* ── Visualization ── */}
        <VisualizerCanvas
          algorithmType={metadata.type}
          themeId={category?.theme}
          metadata={metadata}
        />

        {/* ── Controls row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-3">
            <InputPanel
              algorithmType={metadata.type}
              onVisualize={handleVisualize}
            />
          </div>
          <div className="lg:col-span-2">
            <PlaybackControls disabled={!stepsModule} />
          </div>
        </div>

        {/* ── Info tabs ── */}
        <div className={`rounded-xl border overflow-hidden ${
          isImmersive ? 'bg-black/30 border-white/10 backdrop-blur-sm'
          : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>

          {/* Tab bar */}
          <div className={`flex border-b overflow-x-auto ${
            isImmersive ? 'border-white/10' : isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              const color = isDark ? tab.darkColor : tab.color
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap
                    transition-all duration-200 border-b-[3px] flex-shrink-0 ${
                    isActive
                      ? ''
                      : isImmersive
                        ? 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/5'
                        : isDark
                        ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/40'
                        : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  style={isActive ? {
                    borderBottomColor: color,
                    color: color,
                    background: `${color}0f`,
                  } : {}}
                >
                  <tab.Icon size={15} />
                  {tab.label}
                </button>
              )
            })}

            {/* Language switcher — right-aligned, only in Code tab */}
            {activeTab === 'code' && (
              <div className="ml-auto flex items-center px-4 flex-shrink-0">
                <LanguageSwitcher selected={language} onChange={setLanguage} />
              </div>
            )}
          </div>

          {/* Tab content with AnimatePresence fade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="p-7 min-h-[440px]"
              style={{ borderLeft: `5px solid ${tabColor}` }}
            >
              {activeTab === 'aim' && <AimPanel metadata={metadata} />}

              {activeTab === 'code' && (
                <CodeBlock
                  code={currentCode}
                  language={language}
                  highlightedLine={highlightedLine}
                />
              )}

              {activeTab === 'complexity' && <ComplexityPanel metadata={metadata} />}

              {activeTab === 'applications' && <ApplicationsPanel metadata={metadata} />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
