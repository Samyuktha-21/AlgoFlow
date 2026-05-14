export function generateSteps(inputArray, target = null) {
  const arr = [...inputArray]
  const searchTarget = target !== null ? target : arr[Math.floor(arr.length * 0.5)]
  const n = arr.length, steps = []
  steps.push({ array:[...arr], low:-1, high:-1, mid:-1, found:-1, eliminated:[], target:searchTarget, description:`Linear Search for ${searchTarget} in [${arr.join(', ')}]`, codeLine:2 })
  const eliminated = []
  for (let i = 0; i < n; i++) {
    steps.push({ array:[...arr], low:-1, high:-1, mid:i, found:-1, eliminated:[...eliminated], target:searchTarget, description:`Check arr[${i}] = ${arr[i]}`, codeLine:3 })
    if (arr[i] === searchTarget) {
      steps.push({ array:[...arr], low:-1, high:-1, mid:i, found:i, eliminated:[...eliminated], target:searchTarget, description:`Found! arr[${i}] = ${searchTarget} at index ${i}`, codeLine:4 })
      return steps
    }
    eliminated.push(i)
    steps.push({ array:[...arr], low:-1, high:-1, mid:-1, found:-1, eliminated:[...eliminated], target:searchTarget, description:`${arr[i]} ≠ ${searchTarget} — move to next`, codeLine:5 })
  }
  steps.push({ array:[...arr], low:-1, high:-1, mid:-1, found:-2, eliminated:[...Array.from({length:n},(_,i)=>i)], target:searchTarget, description:`${searchTarget} not found in array`, codeLine:6 })
  return steps
}