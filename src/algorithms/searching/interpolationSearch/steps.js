export function generateSteps(inputArray, target = null) {
  const arr = [...inputArray].sort((a,b)=>a-b)
  const n = arr.length
  const searchTarget = target !== null ? target : arr[Math.floor(n * 0.6)]
  const steps = [], eliminated = []
  steps.push({ array:[...arr], low:0, high:n-1, mid:-1, found:-1, eliminated:[], target:searchTarget, description:`Interpolation Search for ${searchTarget} (uniform distribution assumed)`, codeLine:2 })
  let lo = 0, hi = n - 1
  while (lo <= hi && searchTarget >= arr[lo] && searchTarget <= arr[hi]) {
    if (lo === hi) {
      if (arr[lo] === searchTarget) { steps.push({ array:[...arr], low:lo, high:hi, mid:lo, found:lo, eliminated:[...eliminated], target:searchTarget, description:`Single element — found ${searchTarget}`, codeLine:5 }); return steps }
      break
    }
    const probe = lo + Math.floor(((searchTarget - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]))
    steps.push({ array:[...arr], low:lo, high:hi, mid:probe, found:-1, eliminated:[...eliminated], target:searchTarget, description:`Probe = ${lo} + (${searchTarget}-${arr[lo]})/(${arr[hi]}-${arr[lo]}) × ${hi-lo} = ${probe}  → arr[${probe}]=${arr[probe]}`, codeLine:6 })
    if (arr[probe] === searchTarget) { steps.push({ array:[...arr], low:lo, high:hi, mid:probe, found:probe, eliminated:[...eliminated], target:searchTarget, description:`Found ${searchTarget} at index ${probe}!`, codeLine:7 }); return steps }
    if (arr[probe] < searchTarget) { for(let i=lo;i<=probe;i++) eliminated.push(i); lo = probe + 1; steps.push({ array:[...arr], low:lo, high:hi, mid:-1, found:-1, eliminated:[...eliminated], target:searchTarget, description:`arr[${probe}]=${arr[probe]} < ${searchTarget} → search right, lo=lo`, codeLine:8 }) }
    else { for(let i=probe;i<=hi;i++) eliminated.push(i); hi = probe - 1; steps.push({ array:[...arr], low:lo, high:hi, mid:-1, found:-1, eliminated:[...eliminated], target:searchTarget, description:`arr[${probe}]=${arr[probe]} > ${searchTarget} → search left, hi=hi`, codeLine:9 }) }
  }
  steps.push({ array:[...arr], low:-1, high:-1, mid:-1, found:-2, eliminated:[...Array.from({length:n},(_,i)=>i)], target:searchTarget, description:`${searchTarget} not found`, codeLine:11 })
  return steps
}