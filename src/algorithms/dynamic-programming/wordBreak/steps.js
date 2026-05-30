export function generateSteps(inputStr) {
  const raw = typeof inputStr==='string'?inputStr:'leetcode,leet,code'
  const parts = raw.split(',')
  const s = (parts[0]||'leetcode').toLowerCase().trim()
  const dict = parts.length>1 ? parts.slice(1).map(w=>w.trim().toLowerCase()).filter(Boolean) : ['leet','code','lee','t']
  const n=s.length, dp=new Array(n+1).fill(false), computed=new Array(n+1).fill(false)
  dp[0]=true; computed[0]=true
  const steps=[]
  const mk=(cur,desc)=>({dp:[...dp],current:cur,computed:[...computed],description:desc,extra:{s,dict}})
  steps.push(mk(0,`Word Break: can "${s}" be split using ${JSON.stringify(dict)}? dp[i]=true if s[0..i-1] is segmentable.`))
  for(let i=1;i<=n;i++){
    for(let j=0;j<i;j++){
      const word=s.substring(j,i),inDict=dict.includes(word)
      if(dp[j]&&inDict){
        dp[i]=true;computed[i]=true
        steps.push(mk(i,`dp[${j}]=true AND "${word}" in dict → dp[${i}]=true ✓`))
        break
      } else {
        steps.push(mk(i,!dp[j]?`dp[${j}]=false, skip`:`"${word}" not in dict, try next`))
      }
    }
    if(!computed[i]){computed[i]=true;steps.push(mk(i,`No valid split for "${s.substring(0,i)}" → dp[${i}]=false`))}
  }
  steps.push(mk(n,dp[n]?`"${s}" CAN be segmented ✓`:`"${s}" CANNOT be segmented ✗`))
  return steps
}