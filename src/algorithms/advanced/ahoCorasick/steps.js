/* Aho-Corasick: find every occurrence of every pattern in one pass over the
   text. The patterns go into a trie; fail links then turn that trie into an
   automaton, so a mismatch never rewinds the text pointer — it just moves to
   the longest proper suffix that is still a live prefix. One pass, all
   patterns, regardless of how many there are.

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. Java
   precomputes a dense goto table (line 23), which is why "no child here" is
   resolved at build time rather than by walking fail links during the search. */

function toText(v, fallback) {
  const raw = Array.isArray(v) ? v.join('') : v
  const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  return s || fallback
}

export function generateSteps(textInput, patternInput) {
  const text = toText(textInput, 'USHERS')
  /* stringPair gives everything after the first comma as one string, which is
     exactly the pattern list: "USHERS,HE,SHE,HIS,HERS". */
  const patterns = [...new Set(
    toText(patternInput, 'HE,SHE,HIS,HERS').split(',').map(p => p.trim()).filter(Boolean),
  )].slice(0, 6)
  if (!patterns.length) patterns.push(text[0] || 'A')

  const chars = text.split('')
  const steps = []

  /* Java's `go` is int[maxNodes][26]; the alphabet here is just the characters
     the patterns actually use, so the dense table stays small enough to trace. */
  const alphabet = [...new Set(patterns.join('').split(''))].sort()
  const go = [Object.fromEntries(alphabet.map(c => [c, 0]))]
  const fail = [0]
  const out = [[]]
  const found = []
  let size = 1
  let phase = 'trie'

  const newNode = () => {
    go.push(Object.fromEntries(alphabet.map(c => [c, 0])))
    fail.push(0)
    out.push([])
    return size++
  }

  const push = (i, description, codeLine) => steps.push({
    array: chars,
    array2: patterns,
    array2Label: `Patterns: ${patterns.join(', ')}`,
    highlight: [],
    sorted: found.flatMap(f => Array.from({ length: f.pattern.length }, (_, k) => f.start + k)),
    window: i >= 0 ? { start: i, end: i } : undefined,
    pointers: i >= 0 && i < text.length ? [{ index: i, label: 'i' }] : [],
    current: -1,
    description,
    codeLine,
    extra: { phase, nodes: size, matches: found.length },
  })

  /* ── Phase 1: the trie ── */
  for (let idx = 0; idx < patterns.length; idx++) {
    const pat = patterns[idx]
    let cur = 0
    push(-1, `Add "${pat}" to the trie, starting at the root.`, 7)
    for (const ch of pat) {
      push(-1, `Next character '${ch}' of "${pat}".`, 8)
      if (go[cur][ch] === 0) {
        const created = newNode()
        go[cur][ch] = created
        push(-1, `No '${ch}' edge from node ${cur} — create node ${created} for it.`, 10)
      }
      cur = go[cur][ch]
      push(-1, `Follow '${ch}' to node ${cur}.`, 11)
    }
    out[cur].push(pat)
    push(-1, `Node ${cur} is the end of "${pat}" — mark it as an output node.`, 13)
  }

  /* ── Phase 2: fail links ── */
  phase = 'fail-links'
  const queue = []
  for (const c of alphabet) {
    if (go[0][c] !== 0) queue.push(go[0][c])
  }
  push(-1, `Trie built with ${size} nodes. Seed the queue with the root's children (${queue.join(', ')}) — their fail link is the root, since a one-character suffix has nowhere shorter to fall back to.`, 17)

  while (queue.length) {
    const u = queue.shift()
    push(-1, `Take node ${u} off the queue and give each of its transitions a fail link.`, 19)
    for (const c of alphabet) {
      const v = go[u][c]
      if (v !== 0) {
        fail[v] = go[fail[u]][c]
        const inherited = out[fail[v]]
        if (inherited.length) out[v] = [...out[v], ...inherited]
        queue.push(v)
        push(-1, `Node ${u} has a '${c}' edge to ${v}. Its fail link is where '${c}' leads from ${u}'s own fail node ${fail[u]} — node ${fail[v]}.${inherited.length ? ` That node ends "${inherited.join('", "')}", so ${v} reports it too — a match can sit inside another.` : ''}`, 22)
      } else if (go[fail[u]][c] !== 0) {
        /* Java's dense table: "no '${c}' from here" is precomputed to mean
           "go wherever '${c}' goes from the fail node", so the search never
           walks fail links at all. */
        go[u][c] = go[fail[u]][c]
        push(-1, `Node ${u} has no '${c}' edge, so precompute one straight to node ${go[u][c]} — where '${c}' leads from its fail node ${fail[u]}. The search will never have to back up.`, 23)
      }
    }
  }

  /* ── Phase 3: the single pass ── */
  phase = 'search'
  let cur = 0
  push(-1, `Automaton ready. Scan "${text}" once, from the root.`, 28)
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    push(i, `Read '${ch}' at index ${i}.`, 29)
    cur = go[cur][ch] ?? 0
    push(i, `The automaton moves to node ${cur}${cur === 0 ? ' — back to the root, nothing partial survives.' : '.'} The text pointer never moves backwards.`, 30)
    if (out[cur].length) {
      push(i, `Node ${cur} is an output node — something ends here.`, 31)
      for (const pat of out[cur]) {
        const start = i - pat.length + 1
        found.push({ start, pattern: pat })
        push(i, `"${pat}" found at index ${start}.`, 32)
      }
    }
  }

  push(-1, found.length
    ? `Done in one pass — ${found.length} match${found.length > 1 ? 'es' : ''}: ${found.map(f => `"${f.pattern}"@${f.start}`).join(', ')}.`
    : 'Done in one pass — none of the patterns occur in the text.', 33)
  steps[steps.length - 1].result = found.length ? found.map(f => `${f.pattern}@${f.start}`).join(', ') : 'No pattern occurs'
  return steps
}
