export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  const sorted = []
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:'Heap Sort — builds a Max-Heap (parent always LARGER than children), then extracts the max repeatedly. Max-Heap rule: every parent ≥ its children.', codeLine:2 })
  function heapify(a, size, i) {
    let largest = i, l = 2*i+1, r = 2*i+2
    steps.push({ array:[...arr], comparing:[i, ...(l<size?[l]:[]), ...(r<size?[r]:[])], swapping:[], sorted:[...sorted], description:`Heapify at ${i}: check children ${l<size?l:'-'}, ${r<size?r:'-'}`, codeLine:3 })
    if (l < size && a[l] > a[largest]) largest = l
    if (r < size && a[r] > a[largest]) largest = r
    if (largest !== i) {
      steps.push({ array:[...arr], comparing:[], swapping:[i,largest], sorted:[...sorted], description:`Heap property violated! arr[${i}]=${a[i]} < arr[${largest}]=${a[largest]} — parent must be larger. Swapping to restore Max-Heap.`, codeLine:6 })
      ;[a[i], a[largest]] = [a[largest], a[i]]
      for(let x=0;x<n;x++) arr[x]=a[x]
      heapify(a, size, largest)
    }
  }
  const copy = [...arr]
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:'Phase 1: Build max-heap (bottom-up)', codeLine:10 })
  for (let i = Math.floor(n/2) - 1; i >= 0; i--) heapify(copy, n, i)
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:'Max-heap built! Root is maximum element', codeLine:11 })
  for (let i = n - 1; i > 0; i--) {
    steps.push({ array:[...arr], comparing:[], swapping:[0,i], sorted:[...sorted], description:`Extract max ${copy[0]} — swap with position ${i}`, codeLine:13 })
    ;[copy[0], copy[i]] = [copy[i], copy[0]]
    sorted.push(i)
    for(let x=0;x<n;x++) arr[x]=copy[x]
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], description:`arr[${i}]=${copy[i]} sorted. Heapify remaining ${i} elements`, codeLine:14 })
    heapify(copy, i, 0)
  }
  sorted.push(0)
  steps.push({ array:[...copy], comparing:[], swapping:[], sorted:[...Array.from({length:n},(_,i)=>i)], description:`Sorted: [${copy.join(', ')}]`, codeLine:15 })
  return steps
}