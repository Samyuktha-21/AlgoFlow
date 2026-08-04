/* Resolve which source line to highlight for the active visualization step.

   Steps emit `codeLine` as a raw line number authored against the JAVA code
   block (the original, default language). Java is canonical, so it highlights
   by identity. Every other language needs a hand-authored `lineMap` in
   code.json translating the Java line → that language's equivalent line:

     lineMap = { python: { "7": 6 } }

   Only Python is mapped. C, C++ and JavaScript ship the same algorithms but
   deliberately carry no map: their snippets diverge structurally from Java
   often enough (helpers above callers, idiomatic rewrites, multi-statement
   lines) that an honest line-for-line correspondence could not be maintained
   for all 124 algorithms. For an unmapped language — or a line missing from a
   map — we return null: no highlight is shown rather than a WRONG one. The UI
   surfaces which languages do highlight via `highlightLangs` below.

   Pure + node-testable. */

/* Java needs no map — a step's codeLine already IS a Java line number. */
const CANONICAL_LANG = 'java'

export function resolveHighlightLine(codeLine, lang, lineMap) {
  if (!codeLine) return null
  if (lang === CANONICAL_LANG) return codeLine
  const forLang = lineMap && lineMap[lang]
  if (!forLang) return null
  const mapped = forLang[String(codeLine)]
  return typeof mapped === 'number' ? mapped : null
}

/* Which languages can highlight for THIS algorithm, in display order.

   Derived from the data rather than hardcoded, so the answer stays honest
   while the rollout is partway done and automatically picks up any language
   that gets mapped later. `hasSteps` is false for the handful of algorithms
   whose generateSteps emits no codeLine at all — there, not even Java can
   highlight, and claiming otherwise would be a lie. */
export function highlightLangs(lineMap, hasSteps = true) {
  if (!hasSteps) return []
  const mapped = lineMap ? Object.keys(lineMap).filter(l => Object.keys(lineMap[l] || {}).length) : []
  return [CANONICAL_LANG, ...mapped.filter(l => l !== CANONICAL_LANG).sort()]
}
