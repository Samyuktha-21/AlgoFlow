export function generateSteps(inputArray) {
  const arr = [...inputArray], n = arr.length, steps = []
  const max = Math.max(...arr)
  let digits = 0; let tmp = max; while(tmp > 0){digits++;tmp=Math.floor(tmp/10)}
  steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`Radix Sort — ${digits} digit pass(es) on ${n} elements`, codeLine:2 })
  function countingPass(a, exp) {
    const expName = exp===1?'ones':exp===10?'tens':exp===100?'hundreds':'exp='+exp
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`Pass on ${expName} digit`, codeLine:4 })
    const cnt = new Array(10).fill(0)
    for (let v of a) cnt[Math.floor(v/exp)%10]++
    for (let i=1;i<10;i++) cnt[i]+=cnt[i-1]
    const out = new Array(n)
    for (let i=n-1;i>=0;i--) out[--cnt[Math.floor(a[i]/exp)%10]] = a[i]
    for (let i=0;i<n;i++){ a[i]=out[i]; arr[i]=out[i] }
    steps.push({ array:[...arr], comparing:[], swapping:[], sorted:[], description:`After ${expName} sort: [${arr.join(', ')}]`, codeLine:7 })
  }
  const copy = [...arr]
  for (let exp=1; Math.floor(max/exp)>0; exp*=10) countingPass(copy, exp)
  steps.push({ array:[...copy], comparing:[], swapping:[], sorted:[...Array.from({length:n},(_,i)=>i)], description:`Sorted: [${copy.join(', ')}]`, codeLine:9 })
  return steps
}