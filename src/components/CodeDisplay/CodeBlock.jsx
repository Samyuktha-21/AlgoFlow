import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import { useTheme } from '../../context/ThemeContext'

Prism.manual = true

export default function CodeBlock({ code, language, highlightedLine }) {
  const { isDark } = useTheme()
  const codeRef = useRef(null)

  useEffect(() => {
    if (codeRef.current) Prism.highlightElement(codeRef.current)
  }, [code, language])

  const lines = (code || '').split('\n')
  const prismLang = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : 'java'

  return (
    <div className={`rounded-xl overflow-hidden text-sm font-mono border ${
      isDark ? 'bg-gray-950 border-gray-700' : 'bg-gray-900 border-gray-700'
    }`}>
      {/* Line numbers + code */}
      <div className="overflow-auto max-h-[480px]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1
              const isHighlighted = lineNum === highlightedLine
              return (
                <tr
                  key={idx}
                  className={`group transition-colors ${
                    isHighlighted ? 'bg-yellow-500/15' : 'hover:bg-white/5'
                  }`}
                >
                  <td className={`select-none text-right pr-4 pl-4 py-0.5 text-xs border-r min-w-[3rem] ${
                    isHighlighted
                      ? 'text-yellow-400 border-yellow-500/30'
                      : 'text-gray-600 border-gray-700/50'
                  }`}>
                    {lineNum}
                  </td>
                  <td className={`pl-4 pr-4 py-0.5 leading-6 ${isHighlighted ? 'border-l-2 border-yellow-400' : 'border-l-2 border-transparent'}`}>
                    <code
                      className={`language-${prismLang} !bg-transparent !p-0 text-gray-200`}
                      dangerouslySetInnerHTML={{
                        __html: Prism.highlight(
                          line || ' ',
                          Prism.languages[prismLang] || Prism.languages.plain,
                          prismLang
                        )
                      }}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
