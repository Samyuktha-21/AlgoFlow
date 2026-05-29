import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import Category from './pages/Category'
import Algorithm from './pages/Algorithm'
import Interview from './pages/Interview'
import GlobalSearch from './components/Search/GlobalSearch'
import { registerSearchOpener } from './components/Search/SearchTrigger'
import { useTheme } from './context/ThemeContext'

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

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/algorithm/:categoryId/:algorithmId" element={<Algorithm />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <h1 className="text-6xl font-bold text-gray-300">404</h1>
              <p className="text-gray-500">Page not found</p>
              <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
            </div>
          } />
        </Routes>
      </main>
      {!isHomepage && <Footer />}
    </div>
  )
}

export default App
