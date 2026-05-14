/**
 * Generates step-by-step binary search visualization data.
 * Input array MUST be sorted. The function sorts it automatically.
 */
export function generateSteps(inputArray, target = null) {
  const arr = [...inputArray].sort((a, b) => a - b)
  const n = arr.length

  // Default target: some element in the middle-ish for good demo
  const searchTarget = target !== null ? target : arr[Math.floor(n * 0.6)]

  const steps = []

  const addStep = (low, high, mid, found, eliminated, description, codeLine) => {
    steps.push({
      array: [...arr],
      low,
      high,
      mid,
      found,
      eliminated: [...eliminated],
      target: searchTarget,
      description,
      codeLine,
    })
  }

  addStep(-1, -1, -1, -1, [],
    `Binary Search for target = ${searchTarget} in sorted array [${arr.join(', ')}]`, 3)

  let low = 0
  let high = n - 1
  const eliminated = []

  addStep(low, high, -1, -1, eliminated,
    `Initialize: low = ${low}, high = ${high}`, 3)

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2)

    addStep(low, high, mid, -1, eliminated,
      `mid = ${low} + (${high} − ${low}) / 2 = ${mid}  →  arr[${mid}] = ${arr[mid]}`, 6)

    if (arr[mid] === searchTarget) {
      addStep(low, high, mid, mid, eliminated,
        `arr[${mid}] = ${arr[mid]} == ${searchTarget}  →  Target FOUND at index ${mid}!`, 8)
      return steps
    } else if (arr[mid] < searchTarget) {
      addStep(low, high, mid, -1, eliminated,
        `arr[${mid}] = ${arr[mid]} < ${searchTarget}  →  Search RIGHT half`, 10)
      // Eliminate left side
      for (let i = low; i <= mid; i++) eliminated.push(i)
      low = mid + 1
      addStep(low, high, -1, -1, eliminated,
        `Set low = ${mid} + 1 = ${low}`, 11)
    } else {
      addStep(low, high, mid, -1, eliminated,
        `arr[${mid}] = ${arr[mid]} > ${searchTarget}  →  Search LEFT half`, 13)
      // Eliminate right side
      for (let i = mid; i <= high; i++) eliminated.push(i)
      high = mid - 1
      addStep(low, high, -1, -1, eliminated,
        `Set high = ${mid} − 1 = ${high}`, 14)
    }
  }

  // Not found
  const allEliminated = arr.map((_, i) => i)
  addStep(low, high, -1, -2, allEliminated,
    `low (${low}) > high (${high})  →  Target ${searchTarget} NOT FOUND in array`, 16)

  return steps
}
