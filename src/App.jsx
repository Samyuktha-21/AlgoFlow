import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import GlobalSearch from './components/Search/GlobalSearch'
import FeedbackPrompt from './components/FeedbackPrompt'
import { registerSearchOpener } from './components/Search/SearchTrigger'
import { useTheme } from './context/ThemeContext'
import { recordVisit, recordLearningMinute } from './firebase/stats'

/* Route pages are code-split so each route only ships its own JS */
const Home           = lazy(() => import('./pages/Home'))
const Category       = lazy(() => import('./pages/Category'))
const Algorithm      = lazy(() => import('./pages/Algorithm'))
const Interview      = lazy(() => import('./pages/Interview'))
const DiscussionPage = lazy(() => import('./pages/DiscussionPage'))
const TestYourself   = lazy(() => import('./pages/TestYourself'))
const Practice       = lazy(() => import('./pages/Practice'))

/* Lightweight fallback while a route chunk loads */
function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])
  return null
}

function App() {
  const { isDark } = useTheme()
  const { pathname } = useLocation()
  const isHomepage = pathname === '/'
  const [searchOpen, setSearchOpen] = useState(false)

  /* Count this browser session in the live site-visit counter, then
     accrue one "learning minute" per minute the tab stays visible */
  useEffect(() => {
    recordVisit()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') recordLearningMinute()
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  /* Register global search opener so any component can call openSearch() */
  useEffect(() => {
    registerSearchOpener(() => setSearchOpen(true))

    /* Also handle Ctrl+K here so it works on every page */
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={
      isHomepage
        ? 'homepage-root flex flex-col'
        : `min-h-screen flex flex-col ${isDark ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`
    }>
      <ScrollToTop />
      <Header isHomepage={isHomepage} />

      {/* Global search modal — mounted once at root */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Exit-intent review prompt — asks once, stores to Firestore */}
      <FeedbackPrompt />

      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryId" element={<Category />} />
            <Route path="/algorithm/:categoryId/:algorithmId" element={<Algorithm />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/discussion" element={<DiscussionPage />} />
            <Route path="/play" element={<TestYourself />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h1 className="text-6xl font-bold text-gray-300">404</h1>
                <p className="text-gray-500">Page not found</p>
                <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      {!isHomepage && <Footer />}
    </div>
  )
}

export default App
