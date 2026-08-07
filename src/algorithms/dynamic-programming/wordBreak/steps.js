export function generateSteps(inputStr) {
  const raw = typeof inputStr==='string'?inputStr:'leetcode,leet,code'
  const parts = raw.split(',')
  const s = (parts[0]||'leetcode').toLowerCase().trim()
  const dict = parts.length>1 ? parts.slice(1).map(w=>w.trim().toLowerCase()).filter(Boolean) : ['leet','code','lee','t']
  const n=s.length, dp=new Array(n+1).fill(false), computed=new Array(n+1).fill(false)
  dp[0]=true; computed[0]=true
  const steps=[]
  const mk=(cur,desc,codeLine)=>({dp:[...dp],current:cur,computed:[...computed],description:desc,extra:{s,dict},codeLine})
  steps.push(mk(0,`Word Break: can "${s}" be split using ${JSON.stringify(dict)}? dp[i]=true if s[0..i-1] is segmentable.`,7))
  for(let i=1;i<=n;i++){
    for(let j=0;j<i;j++){
      const word=s.substring(j,i),inDict=dict.includes(word)
      if(dp[j]&&inDict){
        dp[i]=true;computed[i]=true
        steps.push(mk(i,`dp[${j}]=true AND "${word}" in dict → dp[${i}]=true ✓`,10))
        break
      } else {
        steps.push(mk(i,!dp[j]?`dp[${j}]=false, skip`:`"${word}" not in dict, try next`,10))
      }
    }
    // Java leaves dp[i] at its default false — no statement runs, so the outer
    // loop line (java 8) is the honest anchor for "this index found nothing".
    if(!computed[i]){computed[i]=true;steps.push(mk(i,`No valid split for "${s.substring(0,i)}" → dp[${i}]=false`,8))}
  }
  steps.push(mk(n,dp[n]?`"${s}" CAN be segmented ✓`:`"${s}" CANNOT be segmented ✗`,11))
  /* How far the DP got is the interesting part when the answer is "no". */
  const reachable = dp.filter(Boolean).length - 1
  steps[steps.length-1].result = `"${s}" ${dp[n]?'can':'cannot'} be segmented (${reachable} of ${n} prefixes reachable)`
  return steps
}