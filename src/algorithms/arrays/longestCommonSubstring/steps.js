export function generateSteps(inputArray) {
  const s1='ABCBDAB', s2='BDCAB'
  const m=s1.length, n=s2.length
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0))
  const computed=Array.from({length:m+1},()=>new Array(n+1).fill(false))
  const rows=['',...s1.split('')], cols=['',...s2.split('')]
  let maxLen=0, maxCell={row:0,col:0}
  const steps=[]
  const addStep=(r,c,desc,line)=>steps.push({dp2d:dp.map(row=>[...row]),rows:rows.slice(0,m+1),cols:cols.slice(0,n+1),cell:{row:r,col:c},computed2d:computed.map(row=>[...row]),description:desc,codeLine:line,extra:{maxLen}})
  addStep(0,0,'Longest Common Substring: dp[i][j]=length of common substr ending at s1[i],s2[j]',2)
  for(let i=1;i<=m;i++){for(let j=1;j<=n;j++){
    const match=s1[i-1]===s2[j-1]
    dp[i][j]=match?dp[i-1][j-1]+1:0
    computed[i][j]=true
    if(dp[i][j]>maxLen){maxLen=dp[i][j];maxCell={row:i,col:j}}
    addStep(i,j,(match?'Match '+s1[i-1]+': dp['+i+']['+j+']='+dp[i][j]:'No match: dp['+i+']['+j+']=0'),5)
  }}
  addStep(maxCell.row,maxCell.col,'Longest common substring length = '+maxLen,7)
  return steps
}