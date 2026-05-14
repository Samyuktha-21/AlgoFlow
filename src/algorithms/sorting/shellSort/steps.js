export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`Shell Sort — start with large gap, reduce to 1`, codeLine:2 })
  for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`Gap = ${gap}: applying insertion sort on every ${gap}th element`, codeLine:3 })
    for (let i = gap; i < n; i++) {
      const temp = arr[i]
      let j = i
      steps.push({ array:[...arr], comparing:[i, i-gap], swapping:[], sorted:[], description:`key=${temp} at [${i}], compare with arr[${i-gap}]=${arr[i-gap]} (gap=${gap})`, codeLine:5 })
      while (j >= gap && arr[j - gap] > temp) {
        steps.push({ array:[...arr], comparing:[], swapping:[j, j-gap], sorted:[], description:`Shift arr[${j-gap}]=${arr[j-gap]} right by ${gap}`, codeLine:7 })
        arr[j] = arr[j - gap]
        j -= gap
      }
      arr[j] = temp
      steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`Inserted ${temp} at position ${j}`, codeLine:9 })
    }
  }
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...Array.from({length:n},(_,i)=>i)], description:`Sorted: [${arr.join(', ')}]`, codeLine:11 })
  return steps
}