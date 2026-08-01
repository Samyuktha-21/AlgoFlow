/* Re-format minified C / C++ / JavaScript snippets in code.json to one
   statement per line.

   Why: steps emit `codeLine` against the JAVA block (one statement per line,
   ~19 lines). The C/C++ blocks were authored minified (~8 lines), folding a
   whole function onto a single line, so there is no honest line-to-line
   mapping to highlight. Expanding them is a prerequisite for per-language
   highlighting — and makes the snippets readable, which is the point of a
   learning site.

   Safety: this is a WHITESPACE-ONLY transform. Every file is verified by
   stripping all whitespace from the before/after source and requiring the two
   to be byte-identical; a file that fails is left untouched and reported.
   Java is never touched (it is the canonical line-number source) and Python
   is never touched (whitespace is significant there).

   Usage:
     node scripts/format-snippets.cjs                  → dry run, prints report
     node scripts/format-snippets.cjs --apply          → write code.json files
     node scripts/format-snippets.cjs --apply sorting  → limit to categories
*/
const fs = require('fs')
const path = require('path')

const LANGS = ['c', 'cpp', 'javascript']
const INDENT = { c: '    ', cpp: '    ', javascript: '  ' }

/* Words that continue the previous statement, so `}` must not flush the line. */
const CONTINUES = /^(else|while|catch|finally)\b/

function stripWs(s) { return s.replace(/\s+/g, '') }

/* Character-level re-emitter. Walks the source tracking string/char/comment
   state so that braces and semicolons inside literals or comments are inert. */
function format(src, lang) {
  const ind = INDENT[lang]
  const out = []
  let line = ''
  let depth = 0
  let paren = 0
  let pendingBlank = false
  const braces = []   // 'block' | 'init', so `}` knows whether to break the line

  const flush = () => {
    const t = line.trim()
    line = ''
    if (!t) return
    if (pendingBlank && out.length) out.push('')
    pendingBlank = false
    // A closing brace / `case` / access specifier de-indents relative to body.
    let d = depth
    if (/^[}\])]/.test(t)) d = Math.max(0, depth)
    out.push(ind.repeat(d) + t)
  }
  const push = (ch) => {
    // Never open a line with whitespace, never emit a double space (the source
    // may already have a space where we just inserted one).
    if (/\s/.test(ch) && (!line || line.endsWith(' '))) return
    line += ch
  }

  let i = 0
  const n = src.length
  while (i < n) {
    const ch = src[i]

    // --- preprocessor directive: own line, verbatim (incl. \ continuations)
    if (ch === '#' && !line.trim()) {
      let j = i
      let raw = ''
      while (j < n) {
        if (src[j] === '\n' && raw.trimEnd().slice(-1) !== '\\') break
        raw += src[j]
        j++
      }
      flush()
      if (pendingBlank && out.length) out.push('')
      pendingBlank = false
      out.push(raw.trim())
      i = j + 1
      continue
    }

    // --- line comment: attach to current line, then break
    if (ch === '/' && src[i + 1] === '/') {
      let j = i
      let raw = ''
      while (j < n && src[j] !== '\n') { raw += src[j]; j++ }
      if (line.trim()) line = line.trimEnd() + ' ' + raw.trim()
      else line = raw.trim()
      flush()
      i = j + 1
      continue
    }

    // --- block comment: keep inline, verbatim
    if (ch === '/' && src[i + 1] === '*') {
      let j = i + 2
      let raw = '/*'
      while (j < n && !(src[j] === '*' && src[j + 1] === '/')) { raw += src[j]; j++ }
      raw += '*/'
      const own = !line.trim()
      if (!own) line = line.trimEnd() + ' '
      line += raw
      if (own || raw.includes('\n')) flush()
      i = j + 2
      continue
    }

    // --- string / char / template literal: copy verbatim
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch
      let j = i + 1
      let raw = q
      while (j < n) {
        if (src[j] === '\\') { raw += src[j] + (src[j + 1] || ''); j += 2; continue }
        raw += src[j]
        if (src[j] === q) { j++; break }
        j++
      }
      line += raw
      i = j
      continue
    }

    // --- newline: whitespace, but preserve a single blank separator line.
    // Detection must look FORWARD at the actual next source line (a backward
    // scan re-fires on every newline near an existing blank, which makes the
    // transform non-idempotent — the file grows a little on every run).
    if (ch === '\n') {
      let j = i + 1
      while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\r')) j++
      if (src[j] === '\n') {
        flush()
        pendingBlank = true
      } else if (line.trim().endsWith(':') && paren === 0) {
        // a label / access specifier / Python-style clause ends its own line
        flush()
      } else {
        push(' ')
      }
      i++
      continue
    }

    // `,` always gets a trailing space — safe, it is only ever a separator.
    if (ch === ',') { line = line.trimEnd() + ', '; i++; continue }

    if (ch === '(' || ch === '[') {
      // `if(`, `for(`, `while(`, `switch(` read better as `if (`.
      if (ch === '(' && /(^|[^A-Za-z0-9_])(if|for|while|switch|catch|return)$/.test(line)) line += ' '
      paren++; push(ch); i++; continue
    }
    if (ch === ')' || ch === ']') { paren = Math.max(0, paren - 1); push(ch); i++; continue }

    // Inside parens a `;` is a `for(;;)` separator, not a statement end.
    // (Only ever a separator, so spacing it is safe — unlike `<=`/`>>=`, which
    // is why no general operator spacing is attempted here.)
    if (paren > 0) {
      if (ch === ';') { line = line.trimEnd() + '; '; i++; continue }
      push(ch); i++; continue
    }

    if (ch === '{') {
      // `= {…}`, `return {…}`, `f({…})` are initializers/object literals, not
      // blocks — breaking them onto their own lines reads terribly. Keep inline.
      const isInit = /(=|\(|,|:|\breturn)\s*$/.test(line)
      braces.push(isInit ? 'init' : 'block')
      if (isInit) { line = line.trimEnd() + ' {'; i++; continue }
      line = line.trim()
      line = line ? line + ' {' : '{'
      flush()
      depth++
      i++
      continue
    }

    if (ch === '}') {
      if (braces[braces.length - 1] === 'init') {
        braces.pop()
        line = line.trimEnd() + '}'
        i++
        continue
      }
      braces.pop()
      flush()
      depth = Math.max(0, depth - 1)
      line = '}'
      // Look ahead: `} else`, `} while(...)`, `};`, `},`, `})` stay attached.
      let j = i + 1
      while (j < n && /\s/.test(src[j])) j++
      const rest = src.slice(j, j + 10)
      if (CONTINUES.test(rest) || /^[;,)\].]/.test(rest)) { i++; continue }
      flush()
      i++
      continue
    }

    if (ch === ';') {
      line = line.trimEnd() + ';'
      flush()
      i++
      continue
    }

    push(ch)
    i++
  }
  flush()

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

/* --------------------------------------------------------------------- */

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const cats = args.filter(a => !a.startsWith('--'))

const root = 'src/algorithms'
const allCats = fs.readdirSync(root).filter(c => fs.statSync(path.join(root, c)).isDirectory())
const useCats = cats.length ? cats : allCats

let changed = 0
let skipped = 0
let protectedCount = 0
const failures = []
const report = []

for (const c of useCats) {
  const d = path.join(root, c)
  if (!fs.existsSync(d)) continue
  for (const a of fs.readdirSync(d)) {
    const p = path.join(d, a, 'code.json')
    if (!fs.existsSync(p)) continue
    const json = JSON.parse(fs.readFileSync(p, 'utf8'))
    // A lineMap is hand-verified against exact line numbers. Reformatting would
    // shift them and silently corrupt every highlight, so never touch these.
    if (json.lineMap) { protectedCount++; continue }
    let touched = false
    const detail = []
    for (const lang of LANGS) {
      const block = json[lang]
      if (!block || !block.code) continue
      const before = block.code
      // Template literals with `${}` would confuse brace tracking — skip.
      if (lang === 'javascript' && /`[^`]*\$\{/.test(before)) { skipped++; continue }
      let after
      try { after = format(before, lang) } catch (e) { failures.push(`${c}/${a} ${lang}: ${e.message}`); continue }
      if (stripWs(before) !== stripWs(after)) {
        failures.push(`${c}/${a} ${lang}: round-trip mismatch (left untouched)`)
        continue
      }
      if (before.trim() === after.trim()) continue
      detail.push(`${lang} ${before.split('\n').length}→${after.split('\n').length}`)
      block.code = after
      touched = true
    }
    if (touched) {
      changed++
      // Reformatting shifts target line numbers, so any existing lineMap is
      // now stale. Drop it — gen-linemap.cjs regenerates from the new source.
      delete json.lineMap
      report.push(`${(c + '/' + a).padEnd(38)} ${detail.join('  ')}`)
      if (APPLY) fs.writeFileSync(p, JSON.stringify(json, null, 2) + '\n')
    }
  }
}

console.log(report.join('\n'))
console.log(`\n${changed} code.json reformatted${APPLY ? ' and written' : ' (dry run)'}; ${skipped} blocks skipped (template literals); ${protectedCount} protected (hand-verified lineMap).`)
if (failures.length) {
  console.log(`\n${failures.length} FAILURES (left untouched):`)
  console.log(failures.join('\n'))
}
