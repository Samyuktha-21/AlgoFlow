/**
 * Generates step-by-step bubble sort visualization data.
 * Each step describes exactly what's happening visually and which code line is active.
 */
export function generateSteps(inputArray) {
  const arr = [...inputArray]
  const n = arr.length
  const steps = []

  const addStep = (array, comparing, swapping, sorted, description, codeLine) => {
    steps.push({
      array: [...array],
      comparing: [...comparing],
      swapping: [...swapping],
      sorted: [...sorted],
      description,
      codeLine,
    })
  }

  const sortedSet = new Set()

  addStep(arr, [], [], [], `Starting Bubble Sort on [${arr.join(', ')}]`, 3)

  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false

    addStep(arr, [], [], [...sortedSet], `Pass ${i + 1}: Scanning from index 0 to ${n - i - 2}`, 4)

    for (let j = 0; j < n - i - 1; j++) {
      // Highlight comparison
      addStep(arr, [j, j + 1], [], [...sortedSet],
        `Comparing arr[${j}] = ${arr[j]} and arr[${j + 1}] = ${arr[j + 1]}`, 7)

      if (arr[j] > arr[j + 1]) {
        // Show swap decision
        addStep(arr, [], [j, j + 1], [...sortedSet],
          `${arr[j]} > ${arr[j + 1]} → Swapping`, 8)

        // Do the swap
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swappedInPass = true

        // Show result after swap
        addStep(arr, [], [j, j + 1], [...sortedSet],
          `Swapped → arr[${j}] = ${arr[j]}, arr[${j + 1}] = ${arr[j + 1]}`, 10)
      } else {
        addStep(arr, [], [], [...sortedSet],
          `${arr[j]} ≤ ${arr[j + 1]} → No swap needed`, 7)
      }
    }

    // Mark the last element of this pass as sorted
    sortedSet.add(n - 1 - i)
    addStep(arr, [], [], [...sortedSet],
      `End of pass ${i + 1}: ${arr[n - 1 - i]} is now in its correct position`, 13)

    if (!swappedInPass) {
      // Fill remaining as sorted
      for (let k = 0; k < n; k++) sortedSet.add(k)
      addStep(arr, [], [], [...sortedSet],
        'No swaps in this pass — array is already sorted! Stopping early.', 13)
      break
    }
  }

  // Mark everything sorted if not already
  for (let k = 0; k < n; k++) sortedSet.add(k)
  addStep(arr, [], [], [...sortedSet], `Array sorted: [${arr.join(', ')}]`, 14)

  return steps
}
