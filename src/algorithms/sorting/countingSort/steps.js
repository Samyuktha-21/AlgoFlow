export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  const max = Math.max(...arr)
  /* Counting sort indexes its count array by value, so a negative value used
     to write a string property rather than a slot — the counts were lost and
     the output came back full of holes. Everything is offset by the minimum,
     which is the standard fix and keeps the algorithm intact. */
  const min = Math.min(...arr)
  const span = max - min
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`Counting Sort — values run ${min}..${max}, so the count array has ${span + 1} slots. Not comparison-based.`, codeLine:2 })
  const count = new Array(span + 1).fill(0)
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], array2:count.slice(0,Math.min(span+1,20)), array2Label:'Count array (value → freq)', description:`Count array initialized with zeros`, codeLine:4 })
  for (let i = 0; i < n; i++) {
    count[arr[i] - min]++
    steps.push({ array:[...arr], comparing:[i], swapping:[], sorted:[], current:i, array2:count.slice(0,Math.min(span+1,20)), array2Label:'Count array', description:`count[${arr[i]}]++ = ${count[arr[i] - min]} (encountered ${arr[i]})`, codeLine:5 })
  }
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], array2:count.slice(0,Math.min(span+1,20)), array2Label:'Cumulative count', description:'Accumulate counts to get positions', codeLine:7 })
  for (let i = 1; i <= span; i++) count[i] += count[i-1]
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], array2:count.slice(0,Math.min(span+1,20)), array2Label:'Cumulative positions', description:'Cumulative sum done — count[v] = number of elements ≤ v', codeLine:8 })
  const out = new Array(n)
  for (let i = n - 1; i >= 0; i--) { out[--count[arr[i] - min]] = arr[i] }
  const allSorted = Array.from({length:n},(_,i)=>i)
  steps.push({ array:out, comparing:[], swapping:[], sorted:allSorted, description:`Output: [${out.join(', ')}] — placed by position`, codeLine:10 })
  return steps
}