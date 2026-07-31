/* Resolve which source line to highlight for the active visualization step.

   Steps emit `codeLine` as a raw line number authored against the JAVA code
   block (the original, default language). Every algorithm ships the same logic
   in up to 5 languages whose line layouts differ, so a per-language `lineMap`
   in code.json translates the Java line → that language's equivalent line:

     lineMap = { c: { "7": 8 }, cpp: {...}, python: {...}, javascript: {...} }

   Java is the canonical source, so it maps identically. For a language that
   hasn't been mapped yet (or a line missing from its map) we return null: no
   highlight is shown rather than a WRONG one. Pure + node-testable. */
export function resolveHighlightLine(codeLine, lang, lineMap) {
  if (!codeLine) return null
  if (lang === 'java') return codeLine
  const forLang = lineMap && lineMap[lang]
  if (!forLang) return null
  const mapped = forLang[String(codeLine)]
  return typeof mapped === 'number' ? mapped : null
}
