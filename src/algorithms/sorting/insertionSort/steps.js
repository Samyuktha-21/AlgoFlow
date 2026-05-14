export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  const sorted = [0]
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], description:'Insertion Sort — build sorted portion left to right', codeLine:3 })
  for (let i = 1; i < n; i++) {
    const key = arr[i]
    steps.push({ array:[...arr], comparing:[i], swapping:[], sorted:[...sorted], current:i, description:`Pick key = arr[${i}] = ${key}`, codeLine:4 })
    let j = i - 1
    let shifted = false
    while (j >= 0 && arr[j] > key) {
      steps.push({ array:[...arr], comparing:[j, j+1], swapping:[], sorted:[...sorted], description:`arr[${j}]=${arr[j]} > ${key} → shift right`, codeLine:6 })
      arr[j + 1] = arr[j]
      steps.push({ array:[...arr], comparing:[], swapping:[j+1], sorted:[...sorted], description:`Shifted arr[${j}] to position ${j+1}`, codeLine:7 })
      j--
      shifted = true
    }
    arr[j + 1] = key
    sorted.push(i)
    const msg = shifted ? `Insert ${key} at position ${j+1}` : `${key} already in correct position`
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], description:msg, codeLine:9 })
  }
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...arr.map((_,i)=>i)], description:`Sorted: [${arr.join(', ')}]`, codeLine:10 })
  return steps
}