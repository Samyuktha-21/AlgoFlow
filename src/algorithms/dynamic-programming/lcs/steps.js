export function generateSteps(inputArray) {
  const s1='ABCBDAB', s2='BDCAB'
  const m=s1.length, n=s2.length
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0))
  const computed=Array.from({length:m+1},()=>new Array(n+1).fill(false))
  const rows=['',...s1.split('')], cols=['',...s2.split('')]
  const steps=[]
  const addStep=(r,c,desc,line)=>steps.push({dp2d:dp.map(row=>[...row]),rows:rows.slice(0,m+1),cols:cols.slice(0,n+1),cell:{row:r,col:c},computed2d:computed.map(row=>[...row]),description:desc,codeLine:line,extra:{LCS_len:dp[m]?.[n]||0}})
  addStep(0,0,'LCS of "'+s1+'" and "'+s2+'". Build dp table.',2)
  for(let i=0;i<=m;i++) for(let j=0;j<=n;j++) if(i===0||j===0){dp[i][j]=0;computed[i][j]=true}
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      const match=s1[i-1]===s2[j-1]
      addStep(i,j,(match?'Match! s1['+i+']=s2['+j+']="'+s1[i-1]+'" → dp['+i+']['+j+']=dp['+(i-1)+']['+(j-1)+']+1='+( dp[i-1][j-1]+1):'No match: max(dp['+(i-1)+']['+j+']='+dp[i-1][j]+', dp['+i+']['+(j-1)+']='+dp[i][j-1]+')'),5)
      dp[i][j]=match?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1])
      computed[i][j]=true
      addStep(i,j,'dp['+i+']['+j+']='+dp[i][j],6)
    }
  }
  addStep(m,n,'LCS length = dp['+m+']['+n+'] = '+dp[m][n],8)
  return steps
}