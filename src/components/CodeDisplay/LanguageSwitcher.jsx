import { useTheme } from '../../context/ThemeContext'

const LANGUAGES = [
  { id: 'java', label: 'Java' },
  { id: 'c',    label: 'C'    },
  { id: 'cpp',  label: 'C++'  },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
]

export default function LanguageSwitcher({ selected, onChange }) {
  const { isDark } = useTheme()

  return (
    <div className={`inline-flex rounded-lg p-0.5 gap-0.5 ${
      isDark ? 'bg-gray-700' : 'bg-gray-100'
    }`}>
      {LANGUAGES.map(lang => (
        <button
          key={lang.id}
          onClick={() => onChange(lang.id)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            selected === lang.id
              ? isDark
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-blue-700 shadow-sm border border-gray-200'
              : isDark
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
