/* Huffman coding: build a prefix-free binary code where the most frequent
   symbol gets the shortest codeword. The greedy rule is to repeatedly merge
   the two least frequent nodes — the two symbols that can most afford to sit
   deepest in the tree. Depth is codeword length, so pushing the rare symbols
   down is exactly what minimises total encoded size.

   Follows the Java block in code.json statement by statement: `codeLine` is a
   Java line number, resolved to Python through code.json's lineMap. */

/* The input is a list of frequencies; the symbols are named A, B, C… in the
   order given, which is enough to talk about them in the trace. */
const NAMES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function generateSteps(inputArray) {
  const freqs = Array.isArray(inputArray) && inputArray.length >= 2
    ? inputArray.map(v => Math.abs(Math.trunc(v)) || 1).slice(0, 12)
    : [45, 13, 12, 16, 9, 5]
  const chars = freqs.map((_, i) => NAMES[i % NAMES.length])

  const steps = []
  let pq = []
  let codes = null
  let phase = 'build'

  const queueRow = () => pq.map(n => n.freq)
  const push = (description, codeLine, marked = []) => steps.push({
    array: freqs,
    array2: codes ? chars.map(c => codes[c] ?? '—') : queueRow(),
    array2Label: codes
      ? `Huffman codes for ${chars.join(', ')}`
      : 'Priority queue — node weights, smallest first',
    highlight: marked,
    current: -1,
    pointers: [],
    description,
    codeLine,
    extra: { phase, queued: pq.length },
  })

  /* Ties are broken by insertion order so the trace is reproducible; any
     consistent rule gives an equally optimal code, just a different one. */
  let seq = 0
  const enqueue = node => {
    pq.push(node)
    pq.sort((a, b) => a.freq - b.freq || a.seq - b.seq)
  }

  push(`Huffman coding for ${freqs.length} symbols. Build a min-priority-queue of leaves.`, 17)
  for (let i = 0; i < freqs.length; i++) {
    enqueue({ ch: chars[i], freq: freqs[i], seq: seq++, left: null, right: null })
    push(`Queue leaf ${chars[i]} with frequency ${freqs[i]}.`, 18, [i])
  }

  while (pq.length > 1) {
    push(`${pq.length} nodes in the queue — merge the two lightest.`, 19)
    const l = pq.shift()
    const r = pq.shift()
    push(`Take ${l.ch ?? `(${l.freq})`} = ${l.freq} and ${r.ch ?? `(${r.freq})`} = ${r.freq}. These two are the least frequent, so they can afford to sit deepest.`, 20)
    enqueue({ ch: null, freq: l.freq + r.freq, seq: seq++, left: l, right: r })
    push(`Push back their parent of weight ${l.freq + r.freq}. Queue: [${queueRow().join(', ')}].`, 21)
  }

  const root = pq[0]
  phase = 'codes'
  push('One node left — that is the root. Walk the tree to read off each codeword.', 23)

  codes = {}
  const walk = (node, code) => {
    if (!node) return
    if (!node.left && !node.right) {
      /* A single-symbol alphabet has a root that is also a leaf, and an empty
         codeword cannot be written down — it gets "0". */
      codes[node.ch] = code || '0'
      push(`${node.ch} = ${codes[node.ch]} (${codes[node.ch].length} bit${codes[node.ch].length > 1 ? 's' : ''} for frequency ${node.freq}).`, 12, [chars.indexOf(node.ch)])
      return
    }
    push(`Go left from the node of weight ${node.freq} — append a 0.`, 13)
    walk(node.left, code + '0')
    push(`Go right from the node of weight ${node.freq} — append a 1.`, 14)
    walk(node.right, code + '1')
  }
  push('At a leaf, the path taken to reach it is that symbol\'s codeword.', 11)
  walk(root, '')

  const totalBits = freqs.reduce((sum, f, i) => sum + f * codes[chars[i]].length, 0)
  const fixedBits = freqs.reduce((a, b) => a + b, 0) * Math.max(1, Math.ceil(Math.log2(freqs.length)))
  push(`Done. Encoding costs ${totalBits} bits, against ${fixedBits} for a fixed-width code — no prefix-free code does better.`, 23)
  steps[steps.length - 1].result = `${totalBits} bits (${chars.map(c => `${c}=${codes[c]}`).join(', ')})`
  return steps
}
