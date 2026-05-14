import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import Category from './pages/Category'
import Algorithm from './pages/Algorithm'
import { useTheme } from './context/ThemeContext'

function App() {
  const { isDark } = useTheme()
  const { pathname } = useLocation()
  const isHomepage = pathname === '/'

  return (
    <div className={
      isHomepage
        ? 'homepage-root flex flex-col'
        : `min-h-screen flex flex-col ${isDark ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`
    }>
      <Header isHomepage={isHomepage} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/algorithm/:categoryId/:algorithmId" element={<Algorithm />} />
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
