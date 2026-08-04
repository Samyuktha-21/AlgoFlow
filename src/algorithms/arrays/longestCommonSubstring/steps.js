export function generateSteps(s1Input, s2Input) {
  const s1=(typeof s1Input==='string'?s1Input:'ABCBDAB').toUpperCase()
  const s2=(typeof s2Input==='string'?s2Input:'BDCAB').toUpperCase()
  const m=s1.length,n=s2.length
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0))
  const computed=Array.from({length:m+1},()=>new Array(n+1).fill(false))
  const steps=[]
  let maxLen=0,endAt=0
  const mk=(r,c,desc,codeLine)=>({dp2d:dp.map(row=>[...row]),rows:['',...s1.split('')],cols:['',...s2.split('')],cell:{row:r,col:c},computed2d:computed.map(row=>[...row]),description:desc,extra:{maxLen,substring:s1.substring(endAt-maxLen,endAt)},codeLine})
  steps.push(mk(0,0,`Longest Common Substring of "${s1}" and "${s2}". Substrings must be CONTIGUOUS (unlike LCS).`,2))
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      const match=s1[i-1]===s2[j-1]
      if(match){
        dp[i][j]=dp[i-1][j-1]+1;computed[i][j]=true
        if(dp[i][j]>maxLen){maxLen=dp[i][j];endAt=i}
        steps.push(mk(i,j,`Match "${s1[i-1]}" → dp[${i}][${j}]=${dp[i][j]}. Longest so far: "${s1.substring(endAt-maxLen,endAt)}"`,8))
      } else {
        dp[i][j]=0;computed[i][j]=true
        // Java leaves dp[i][j] at its default 0, so the char comparison itself
        // (line 7) is the only line this branch actually executes.
        steps.push(mk(i,j,`No match "${s1[i-1]}"≠"${s2[j-1]}" → dp[${i}][${j}]=0 (streak breaks)`,7))
      }
    }
  }
  steps.push(mk(m,n,`Result: "${s1.substring(endAt-maxLen,endAt)}" (length ${maxLen})`,12))
  return steps
}