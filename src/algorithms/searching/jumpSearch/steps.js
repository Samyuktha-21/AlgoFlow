export function generateSteps(inputArray, target = null) {
  const arr = [...inputArray].sort((a,b)=>a-b)
  const n = arr.length
  const searchTarget = target !== null ? target : arr[Math.floor(n * 0.6)]
  const step = Math.floor(Math.sqrt(n))
  const steps = []
  steps.push({ array:[...arr], low:0, high:n-1, mid:-1, found:-1, eliminated:[], target:searchTarget, description:`Jump Search — step size = √${n} ≈ ${step}`, codeLine:2 })
  let prev = 0, curr = step
  const eliminated = []
  while (curr < n && arr[curr] < searchTarget) {
    steps.push({ array:[...arr], low:prev, high:curr, mid:curr, found:-1, eliminated:[...eliminated], target:searchTarget, description:`arr[${curr}]=${arr[curr]} < ${searchTarget} — jump! prev=${curr}`, codeLine:5 })
    for(let i=prev;i<curr;i++) eliminated.push(i)
    prev = curr
    /* Must be allowed to run past the last index: clamping to n-1 here means
       a target larger than every element never fails the loop condition, and
       the generator spins forever building steps. */
    curr = curr + step
  }
  steps.push({ array:[...arr], low:prev, high:Math.min(curr,n-1), mid:-1, found:-1, eliminated:[...eliminated], target:searchTarget, description:`Target in block [${prev}..${Math.min(curr,n-1)}] — linear search`, codeLine:7 })
  const blockEnd = Math.min(curr, n - 1)
  for (let i = prev; i <= blockEnd; i++) {
    steps.push({ array:[...arr], low:prev, high:blockEnd, mid:i, found:-1, eliminated:[...eliminated], target:searchTarget, description:`Linear: arr[${i}]=${arr[i]}`, codeLine:8 })
    if (arr[i] === searchTarget) {
      steps.push({ array:[...arr], low:prev, high:blockEnd, mid:i, found:i, eliminated:[...eliminated], target:searchTarget, description:`Found ${searchTarget} at index ${i}!`, codeLine:9 })
      return steps
    }
    eliminated.push(i)
  }
  steps.push({ array:[...arr], low:-1, high:-1, mid:-1, found:-2, eliminated:[...Array.from({length:n},(_,i)=>i)], target:searchTarget, description:`${searchTarget} not found`, codeLine:11 })
  return steps
}