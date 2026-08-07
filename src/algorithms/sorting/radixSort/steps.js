export function generateSteps(inputArray) {
  /* Digit extraction on a negative number gives a negative bucket index, so
     LSD radix sort cannot handle negatives directly. Shifting everything up by
     the minimum keeps every value non-negative; the shift is undone before the
     values are shown, so the array on screen is always the user's own. */
  const raw = [...inputArray]
  const min = Math.min(...raw)
  const shift = min < 0 ? -min : 0
  const arr = raw.map(v => v + shift), n = arr.length, steps = []
  const view = a => a.map(v => v - shift)
  const max = Math.max(...arr)
  let digits = 0; let tmp = max; while(tmp > 0){digits++;tmp=Math.floor(tmp/10)}
  if (digits === 0) digits = 1
  steps.push({ array:view(arr), comparing:[], swapping:[], sorted:[], description:`Radix Sort — ${digits} digit pass(es) on ${n} elements`, codeLine:2 })
  function countingPass(a, exp) {
    const expName = exp===1?'ones':exp===10?'tens':exp===100?'hundreds':'exp='+exp
    steps.push({ array:view(arr), comparing:[], swapping:[], sorted:[], description:`Pass on ${expName} digit`, codeLine:4 })
    const cnt = new Array(10).fill(0)
    for (let v of a) cnt[Math.floor(v/exp)%10]++
    for (let i=1;i<10;i++) cnt[i]+=cnt[i-1]
    const out = new Array(n)
    for (let i=n-1;i>=0;i--) out[--cnt[Math.floor(a[i]/exp)%10]] = a[i]
    for (let i=0;i<n;i++){ a[i]=out[i]; arr[i]=out[i] }
    steps.push({ array:view(arr), comparing:[], swapping:[], sorted:[], description:`After ${expName} sort: [${view(arr).join(', ')}]`, codeLine:7 })
  }
  const copy = [...arr]
  for (let exp=1; Math.floor(max/exp)>0; exp*=10) countingPass(copy, exp)
  steps.push({ array:view(copy), comparing:[], swapping:[], sorted:[...Array.from({length:n},(_,i)=>i)], description:`Sorted: [${view(copy).join(', ')}]`, codeLine:9 })
  return steps
}