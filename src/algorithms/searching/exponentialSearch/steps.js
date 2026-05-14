export function generateSteps(inputArray, target = null) {
  const arr = [...inputArray].sort((a,b)=>a-b)
  const n = arr.length
  const searchTarget = target !== null ? target : arr[Math.floor(n * 0.6)]
  const steps = [], eliminated = []
  steps.push({ array:[...arr], low:0, high:n-1, mid:-1, found:-1, eliminated:[], target:searchTarget, description:`Exponential Search: double index until arr[i] > ${searchTarget}`, codeLine:2 })
  if (arr[0] === searchTarget) { steps.push({ array:[...arr], low:0, high:0, mid:0, found:0, eliminated:[], target:searchTarget, description:`Found at index 0!`, codeLine:3 }); return steps }
  let i = 1
  while (i < n && arr[i] <= searchTarget) {
    steps.push({ array:[...arr], low:0, high:i, mid:i, found:-1, eliminated:[...eliminated], target:searchTarget, description:`arr[${i}]=${arr[i]} ≤ ${searchTarget} → double to ${i*2}`, codeLine:6 })
    for(let k=Math.floor(i/2);k<i;k++) eliminated.push(k)
    i *= 2
  }
  const lo = Math.floor(i/2), hi = Math.min(i, n-1)
  steps.push({ array:[...arr], low:lo, high:hi, mid:-1, found:-1, eliminated:[...eliminated], target:searchTarget, description:`Range found: [${lo}..${hi}] — now binary search`, codeLine:7 })
  let low = lo, high = hi
  while (low <= high) {
    const mid = low + Math.floor((high-low)/2)
    steps.push({ array:[...arr], low:low, high:high, mid, found:-1, eliminated:[...eliminated], target:searchTarget, description:`Binary: mid=${mid}, arr[mid]=${arr[mid]}`, codeLine:9 })
    if (arr[mid] === searchTarget) { steps.push({ array:[...arr], low, high, mid, found:mid, eliminated:[...eliminated], target:searchTarget, description:`Found ${searchTarget} at index ${mid}!`, codeLine:10 }); return steps }
    if (arr[mid] < searchTarget) { for(let k=low;k<=mid;k++) eliminated.push(k); low = mid+1 } else { for(let k=mid;k<=high;k++) eliminated.push(k); high = mid-1 }
  }
  steps.push({ array:[...arr], low:-1, high:-1, mid:-1, found:-2, eliminated:[...Array.from({length:n},(_,i)=>i)], target:searchTarget, description:`${searchTarget} not found`, codeLine:12 })
  return steps
}