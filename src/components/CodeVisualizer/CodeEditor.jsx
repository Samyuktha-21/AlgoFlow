import { useEffect, useRef } from 'react'

const LINE_H = 20
const PAD = 10

/* Plain textarea editor: line-number gutter, active/error line bands drawn
   behind the text, Tab = 4 spaces, Enter keeps indentation (+4 after ':').
   The outer box scrolls; the textarea grows to fit so bands line up exactly. */
export default function CodeEditor({ value, onChange, activeLine, errorLine, readOnly, height = 460 }) {
  const taRef = useRef(null)
  const bandRef = useRef(null)
  const lines = value.split('\n')
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 0)

  useEffect(() => {
    bandRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeLine])

  const edit = (text, selStart, selEnd = selStart) => {
    onChange(text)
    requestAnimationFrame(() => {
      if (taRef.current) taRef.current.selectionStart = selStart
      if (taRef.current) taRef.current.selectionEnd = selEnd
    })
  }

  const onKeyDown = (e) => {
    if (readOnly) return
    const ta = e.currentTarget
    const { selectionStart: s, selectionEnd: t } = ta
    if (e.key === 'Tab') {
      e.preventDefault()
      edit(value.slice(0, s) + '    ' + value.slice(t), s + 4)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const lineStart = value.lastIndexOf('\n', s - 1) + 1
      const line = value.slice(lineStart, s)
      let indent = line.match(/^\s*/)[0]
      if (line.trimEnd().endsWith(':')) indent += '    '
      edit(value.slice(0, s) + '\n' + indent + value.slice(t), s + 1 + indent.length)
    }
  }

  const band = (line, color, ref) => line ? (
    <div ref={ref} style={{ position: 'absolute', left: 0, right: 0, top: PAD + (line - 1) * LINE_H, height: LINE_H, background: color, pointerEvents: 'none', transition: 'top 0.15s ease' }} />
  ) : null

  return (
    <div style={{ height, overflow: 'auto', background: '#0b1220', borderRadius: 10, border: '1px solid #1e293b' }}>
      <div style={{ position: 'relative', display: 'flex', minHeight: '100%', minWidth: 'max-content' }}>
        {band(errorLine, 'rgba(244,63,94,0.22)')}
        {band(activeLine, 'rgba(56,189,248,0.18)', bandRef)}
        <div aria-hidden style={{ padding: `${PAD}px 10px ${PAD}px 12px`, textAlign: 'right', color: '#475569', fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13, lineHeight: `${LINE_H}px`, userSelect: 'none', position: 'sticky', left: 0, background: '#0b1220', zIndex: 1, borderRight: '1px solid #1e293b' }}>
          {lines.map((_, i) => (
            <div key={i} style={{ color: i + 1 === activeLine ? '#38bdf8' : i + 1 === errorLine ? '#f43f5e' : undefined, fontWeight: i + 1 === activeLine ? 700 : 400 }}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={taRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          wrap="off"
          aria-label="Python code"
          style={{
            flex: 1,
            minWidth: `${longest + 4}ch`,
            height: lines.length * LINE_H + PAD * 2,
            padding: `${PAD}px 12px`,
            border: 'none', outline: 'none', resize: 'none', overflow: 'hidden',
            background: 'transparent', color: '#e2e8f0', caretColor: '#38bdf8',
            fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13, lineHeight: `${LINE_H}px`,
            whiteSpace: 'pre', tabSize: 4,
            position: 'relative', zIndex: 0,
          }}
        />
      </div>
    </div>
  )
}
