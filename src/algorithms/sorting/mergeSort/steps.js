export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:'Merge Sort — divide array, sort halves, merge back', codeLine:2 })
  function mergeSort(a, l, r, depth) {
    if (l >= r) return
    const m = Math.floor((l + r) / 2)
    steps.push({ array:[...arr], comparing:[l,r], swapping:[], sorted:[], highlight:[...Array.from({length:r-l+1},(_,i)=>l+i)], description:`Divide [${l}..${r}] → [${l}..${m}] + [${m+1}..${r}]`, codeLine:3 })
    mergeSort(a, l, m, depth+1)
    mergeSort(a, m+1, r, depth+1)
    // Merge
    const L = a.slice(l, m+1), R = a.slice(m+1, r+1)
    let i=0, j=0, k=l
    while (i < L.length && j < R.length) {
      steps.push({ array:[...arr], comparing:[l+i, m+1+j], swapping:[], sorted:[], description:`Merge: compare ${L[i]} and ${R[j]}, take ${Math.min(L[i],R[j])}`, codeLine:12 })
      if (L[i] <= R[j]) a[k++] = L[i++]
      else a[k++] = R[j++]
      arr.splice(0, arr.length, ...a.concat(arr.slice(a.length)))
      arr.length = n
      for (let x=0;x<n;x++) arr[x] = a[x] !== undefined ? a[x] : arr[x]
    }
    while (i < L.length) a[k++] = L[i++]
    while (j < R.length) a[k++] = R[j++]
    for (let x=l;x<=r;x++) arr[x] = a[x]
    const sortedRange = Array.from({length:r-l+1},(_,i)=>l+i)
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:sortedRange, description:`Merged [${l}..${r}]: [${arr.slice(l,r+1).join(',')}]`, codeLine:16 })
  }
  const copy = [...arr]
  mergeSort(copy, 0, n-1, 0)
  steps.push({ array:[...copy], comparing:[], swapping:[], sorted:[...Array.from({length:n},(_,i)=>i)], description:`Sorted: [${copy.join(', ')}]`, codeLine:17 })
  return steps
}