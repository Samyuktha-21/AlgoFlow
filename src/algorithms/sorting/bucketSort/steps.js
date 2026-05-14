export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  const max = Math.max(...arr), min = Math.min(...arr)
  const range = max - min + 1
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`Bucket Sort — ${n} elements into ${n} buckets`, codeLine:2 })
  const buckets = Array.from({length:n}, ()=>[])
  for (let i=0; i<n; i++) {
    const bi = Math.min(n-1, Math.floor(((arr[i]-min)/range)*n))
    buckets[bi].push(arr[i])
    steps.push({ array:[...arr], comparing:[i], swapping:[], sorted:[], current:i, description:`arr[${i}]=${arr[i]} → bucket ${bi}`, codeLine:5 })
  }
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`Buckets filled. Sorting each bucket...`, codeLine:7 })
  for (const b of buckets) b.sort((a,b)=>a-b)
  let sorted = [], idx = 0
  for (const b of buckets) for (const v of b) {
    arr[idx] = v
    sorted.push(idx++)
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...sorted], description:`Place ${v} from bucket → position ${idx-1}`, codeLine:9 })
  }
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[...Array.from({length:n},(_,i)=>i)], description:`Sorted: [${arr.join(', ')}]`, codeLine:10 })
  return steps
}