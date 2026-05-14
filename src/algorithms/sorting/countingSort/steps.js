export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  const max = Math.max(...arr)
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`Counting Sort — range 0..${max}, not comparison-based`, codeLine:2 })
  const count = new Array(max + 1).fill(0)
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], array2:count.slice(0,Math.min(max+1,20)), array2Label:'Count array (value → freq)', description:`Count array initialized with zeros`, codeLine:4 })
  for (let i = 0; i < n; i++) {
    count[arr[i]]++
    steps.push({ array:[...arr], comparing:[i], swapping:[], sorted:[], current:i, array2:count.slice(0,Math.min(max+1,20)), array2Label:'Count array', description:`count[${arr[i]}]++ = ${count[arr[i]]} (encountered ${arr[i]})`, codeLine:5 })
  }
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], array2:count.slice(0,Math.min(max+1,20)), array2Label:'Cumulative count', description:'Accumulate counts to get positions', codeLine:7 })
  for (let i = 1; i <= max; i++) count[i] += count[i-1]
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], array2:count.slice(0,Math.min(max+1,20)), array2Label:'Cumulative positions', description:'Cumulative sum done — count[v] = number of elements ≤ v', codeLine:8 })
  const out = new Array(n)
  for (let i = n - 1; i >= 0; i--) { out[--count[arr[i]]] = arr[i] }
  const allSorted = Array.from({length:n},(_,i)=>i)
  steps.push({ array:out, comparing:[], swapping:[], sorted:allSorted, description:`Output: [${out.join(', ')}] — placed by position`, codeLine:10 })
  return steps
}