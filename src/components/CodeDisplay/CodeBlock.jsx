import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import { useTheme } from '../../context/ThemeContext'

Prism.manual = true

export default function CodeBlock({ code, language, highlightedLine, accentColor, accentRgb, inPanel }) {
  const { isDark } = useTheme()
  const activeRef = useRef(null)
  const scrollRef = useRef(null)

  /* Scroll active line into view using the code panel's own scroll container.
     We use scrollTo() on the container — NOT scrollIntoView() — so the page
     scroll position is never disturbed. */
  useEffect(() => {
    if (!highlightedLine || !activeRef.current || !scrollRef.current) return
    const container = scrollRef.current
    const el = activeRef.current
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    const target = container.scrollTop + (eRect.top - cRect.top) - cRect.height / 2 + el.offsetHeight / 2
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }, [highlightedLine])

  const lines = (code || '').split('\n')
  const prismLang    = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : 'java'
  const accent       = accentColor || '#fbbf24'
  const accentRgbVal = accentRgb   || '251,191,36'

  return (
    <div
      className={inPanel
        ? 'text-sm font-mono w-full h-full'
        : `rounded-xl overflow-hidden text-sm font-mono border ${isDark ? 'bg-gray-950 border-gray-700' : 'bg-gray-900 border-gray-700'}`
      }
      style={inPanel ? { display: 'flex', flexDirection: 'column' } : undefined}
    >
      <div
        ref={scrollRef}
        style={inPanel
          ? { overflowY: 'auto', flex: 1 }
          : { overflowY: 'auto', maxHeight: '480px' }
        }
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1
              const isHighlighted = lineNum === highlightedLine
              return (
                <tr
                  key={idx}
                  ref={isHighlighted ? activeRef : null}
                  style={{
                    background: isHighlighted ? `rgba(${accentRgbVal},0.18)` : 'transparent',
                    transition: 'background 0.25s ease',
                  }}
                  className={isHighlighted ? '' : 'hover:bg-white/5'}
                >
                  <td
                    className="select-none text-right pr-4 pl-4 py-0.5 text-xs min-w-[3rem]"
                    style={{
                      borderRight: `1px solid ${isHighlighted ? `rgba(${accentRgbVal},0.35)` : 'rgba(75,85,99,0.4)'}`,
                      color: isHighlighted ? accent : '#4b5563',
                    }}
                  >
                    {lineNum}
                  </td>
                  <td
                    style={{
                      paddingLeft: 16, paddingRight: 16, paddingTop: 2, paddingBottom: 2,
                      lineHeight: 1.7,
                      borderLeft: isHighlighted ? `3px solid ${accent}` : '3px solid transparent',
                      borderRadius: isHighlighted ? '0 6px 6px 0' : 0,
                    }}
                  >
                    <code
                      className={`language-${prismLang} !bg-transparent !p-0 text-gray-200`}
                      dangerouslySetInnerHTML={{
                        __html: Prism.highlight(
                          line || ' ',
                          Prism.languages[prismLang] || Prism.languages.plain,
                          prismLang
                        ),
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
