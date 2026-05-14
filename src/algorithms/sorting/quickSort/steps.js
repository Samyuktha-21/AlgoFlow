export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  const sorted = new Set()
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:'Quick Sort — pick pivot, partition, recurse', codeLine:2 })
  function qs(a, low, high) {
    if (low >= high) { sorted.add(low); return }
    const pivotVal = a[high]
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], pivot:high, description:`Pivot = arr[${high}] = ${pivotVal}`, codeLine:3 })
    let i = low - 1
    for (let j = low; j < high; j++) {
      steps.push({ array:[...arr], comparing:[j, high], swapping:[], sorted:[...sorted], pivot:high, description:`Compare arr[${j}]=${a[j]} with pivot ${pivotVal}`, codeLine:5 })
      if (a[j] <= pivotVal) {
        i++
        if (i !== j) {
          steps.push({ array:[...arr], comparing:[], swapping:[i,j], sorted:[...sorted], pivot:high, description:`arr[${j}]=${a[j]} ≤ pivot → swap with arr[${i}]=${a[i]}`, codeLine:6 })
          ;[a[i], a[j]] = [a[j], a[i]]
          arr.splice(0, arr.length, ...a); arr.length = n
          steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], pivot:high, description:`After swap: arr[${i}]=${a[i]}`, codeLine:6 })
        }
      }
    }
    const pi = i + 1
    ;[a[pi], a[high]] = [a[high], a[pi]]
    arr.splice(0, arr.length, ...a); arr.length = n
    sorted.add(pi)
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], pivot:pi, description:`Pivot ${pivotVal} placed at index ${pi}`, codeLine:9 })
    qs(a, low, pi - 1)
    qs(a, pi + 1, high)
  }
  const copy = [...arr]
  qs(copy, 0, n - 1)
  for (let i = 0; i < n; i++) sorted.add(i)
  steps.push({ array:[...copy], comparing:[], swapping:[], sorted:[...sorted], description:`Sorted: [${copy.join(', ')}]`, codeLine:13 })
  return steps
}