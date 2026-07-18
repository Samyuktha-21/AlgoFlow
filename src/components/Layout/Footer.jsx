import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

export default function Footer() {
  const { isDark } = useTheme()

  return (
    <footer className={`border-t mt-auto ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              AF
            </div>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>AlgoFlow</span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>— Where Logic Flows Visually</span>
          </div>
          <div className={`text-sm flex gap-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
            <Link to="/category/sorting" className="hover:text-blue-500 transition-colors">Sorting</Link>
            <Link to="/category/graphs" className="hover:text-blue-500 transition-colors">Graphs</Link>
            <Link to="/category/dynamic-programming" className="hover:text-blue-500 transition-colors">DP</Link>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Built for learning. 100+ algorithms visualized. Crafted by Samyuktha &amp; Sharvesh.
          </p>
        </div>
      </div>
    </footer>
  )
}
