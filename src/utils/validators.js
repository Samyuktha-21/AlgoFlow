export function parseArrayInput(input) {
  if (!input || !input.trim()) return { error: 'Input cannot be empty' }
  const parts = input.split(',').map(s => s.trim())
  if (parts.some(p => p === '')) return { error: 'Invalid format — use comma-separated integers (e.g. 5,3,7,1,9)' }
  const nums = parts.map(Number)
  if (nums.some(isNaN)) return { error: 'All values must be integers' }
  if (nums.some(n => !Number.isInteger(n))) return { error: 'All values must be integers (no decimals)' }
  if (nums.length < 2) return { error: 'Need at least 2 elements' }
  if (nums.length > 50) return { error: 'Maximum 50 elements allowed' }
  return { array: nums }
}

export function parseSearchInput(arrayInput, targetInput) {
  const arrayResult = parseArrayInput(arrayInput)
  if (arrayResult.error) return arrayResult
  const target = Number(targetInput)
  if (isNaN(target) || !Number.isInteger(target)) return { error: 'Target must be an integer' }
  const sorted = [...arrayResult.array].sort((a, b) => a - b)
  return { array: sorted, target }
}

export function parseGraphInput(edgesInput) {
  if (!edgesInput || !edgesInput.trim()) return { error: 'Input cannot be empty' }
  const pairs = edgesInput.split(',').map(s => s.trim())
  const edges = []
  const nodeSet = new Set()
  for (const pair of pairs) {
    const parts = pair.split('-')
    if (parts.length !== 2) return { error: `Invalid edge format "${pair}" — use "0-1" format` }
    const [a, b] = parts.map(Number)
    if (isNaN(a) || isNaN(b)) return { error: `Invalid node IDs in "${pair}"` }
    edges.push({ from: a, to: b })
    nodeSet.add(a)
    nodeSet.add(b)
  }
  if (nodeSet.size > 20) return { error: 'Maximum 20 nodes allowed' }
  const nodes = [...nodeSet].sort((a, b) => a - b).map(id => ({ id, label: String(id) }))
  return { nodes, edges }
}
