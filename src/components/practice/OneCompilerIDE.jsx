import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

/* Embedded, runnable IDE via OneCompiler. No backend: OneCompiler executes the
   code. Switching language remounts the iframe (key) so the editor reloads for
   the new runtime. There is no auto-judging — users self-check against the
   example cases shown in the problem panel. */
const LANGS = [
  { id: 'java', label: 'Java' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'python', label: 'Python' },
]

export default function OneCompilerIDE({ initialLanguage = 'java' }) {
  const { isDark } = useTheme()
  const start = LANGS.some(l => l.id === initialLanguage) ? initialLanguage : 'java'
  const [lang, setLang] = useState(start)
  const theme = isDark ? 'dark' : 'light'
  const src =
    `https://onecompiler.com/embed/${lang}` +
    `?theme=${theme}&hideNew=true&hideNewFileOption=true&hideTitle=true` +
    `&listenToEvents=true&availableLanguages=java,c,cpp,python`

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100%',
      border: '1px solid var(--page-border)', borderRadius: 14, overflow: 'hidden',
      background: 'var(--page-surface)',
    }}>
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderBottom: '1px solid var(--page-border)', flexWrap: 'wrap' }}>
        {LANGS.map(l => {
          const active = lang === l.id
          return (
            <button key={l.id} type="button" onClick={() => setLang(l.id)} style={{
              padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              background: active ? 'rgba(245,129,31,0.18)' : 'transparent',
              border: `1px solid ${active ? 'rgba(245,129,31,0.45)' : 'var(--page-border)'}`,
              color: active ? '#fdba74' : 'var(--chrome-text-muted)',
            }}>{l.label}</button>
          )
        })}
      </div>
      <iframe
        key={`${lang}-${theme}`}
        src={src}
        title="AlgoFlow code editor"
        loading="lazy"
        style={{ width: '100%', flex: 1, minHeight: 480, border: 'none', background: '#0d0d0d' }}
      />
    </div>
  )
}
