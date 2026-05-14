export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  const sorted = []
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:'Starting Selection Sort — find minimum, swap to front each pass', codeLine:3 })
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    steps.push({ array:[...arr], comparing:[i], swapping:[], sorted:[...sorted], current:i, description:`Pass ${i+1}: searching for minimum in range [${i}..${n-1}]`, codeLine:4 })
    for (let j = i + 1; j < n; j++) {
      steps.push({ array:[...arr], comparing:[minIdx,j], swapping:[], sorted:[...sorted], description:`Compare arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}`, codeLine:6 })
      if (arr[j] < arr[minIdx]) {
        minIdx = j
        steps.push({ array:[...arr], comparing:[minIdx], swapping:[], sorted:[...sorted], description:`New minimum: arr[${minIdx}]=${arr[minIdx]}`, codeLine:7 })
      }
    }
    if (minIdx !== i) {
      steps.push({ array:[...arr], comparing:[], swapping:[i,minIdx], sorted:[...sorted], description:`Swap minimum arr[${minIdx}]=${arr[minIdx]} with arr[${i}]=${arr[i]}`, codeLine:10 })
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
      steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], description:`After swap: arr[${i}]=${arr[i]}`, codeLine:10 })
    }
    sorted.push(i)
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], description:`arr[${i}]=${arr[i]} placed correctly`, codeLine:12 })
  }
  sorted.push(n - 1)
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], description:`Sorted: [${arr.join(', ')}]`, codeLine:13 })
  return steps
}