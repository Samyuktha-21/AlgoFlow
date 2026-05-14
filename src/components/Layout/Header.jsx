import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, GitBranch, Zap } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Header({ isHomepage }) {
  const { isDark, toggle } = useTheme()
  const { pathname } = useLocation()

  if (isHomepage) {
    return (
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm
                bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-lg
                group-hover:shadow-purple-500/50 transition-shadow duration-300">
                AF
              </div>
              <div className="absolute inset-0 rounded-xl bg-purple-500/30 blur-sm animate-pulse" />
            </div>
            <span className="font-black text-xl tracking-tight text-white drop-shadow-lg">
              AlgoFlow
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              beta
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl transition-colors hover:bg-white/10 text-gray-400 hover:text-white"
              aria-label="GitHub"
            >
              <GitBranch size={18} />
            </a>
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl transition-colors hover:bg-white/10 text-yellow-400 hover:text-yellow-300"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={`sticky top-0 z-50 border-b ${
      isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
    } backdrop-blur-sm`}>
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
            bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
            AF
          </div>
          <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            AlgoFlow
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'
          }`}>
            beta
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                     : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
            }`}
            aria-label="GitHub"
          >
            <GitBranch size={18} />
          </a>
          <button
            onClick={toggle}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-yellow-400 hover:text-yellow-300'
                     : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'
            }`}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
