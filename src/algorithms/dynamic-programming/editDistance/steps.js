/* Levenshtein edit distance. Every cell answers one question: how many edits
   turn the first i characters of one string into the first j of the other?
   When the two characters match there is nothing to pay, so the answer is the
   diagonal; otherwise it is one edit on top of the cheapest of delete (above),
   insert (left) or replace (diagonal). */
function toText(v, fallback) {
  const raw = Array.isArray(v) ? v.join('') : v
  const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  /* The grid is (m+1)x(n+1) and every step snapshots it, so long strings turn
     the trace into thousands of near-identical frames. */
  return (s || fallback).slice(0, 10)
}

export function generateSteps(aInput, bInput) {
  const s1=toText(aInput,'HORSE'), s2=toText(bInput,'ROS')
  const m=s1.length, n=s2.length
  const dp=Array.from({length:m+1},(_,i)=>{const r=new Array(n+1).fill(0);r[0]=i;return r})
  for(let j=0;j<=n;j++) dp[0][j]=j
  const computed=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0||j===0))
  const rows=['',...s1.split('')], cols=['',...s2.split('')]
  const steps=[]
  const addStep=(r,c,desc,line)=>steps.push({dp2d:dp.map(row=>[...row]),rows,cols,cell:{row:r,col:c},computed2d:computed.map(row=>[...row]),description:desc,codeLine:line,extra:{EditDist:dp[m]?.[n]||0}})
  addStep(0,0,'Edit Distance: "'+s1+'" → "'+s2+'". Init boundaries.',2)
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      const match=s1[i-1]===s2[j-1]
      addStep(i,j,match?'Match "'+s1[i-1]+'" — dp['+i+']['+j+']=dp['+(i-1)+']['+(j-1)+']='+dp[i-1][j-1]:'No match — min(del='+dp[i-1][j]+', ins='+dp[i][j-1]+', rep='+dp[i-1][j-1]+')',6)
      dp[i][j]=match?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])
      computed[i][j]=true
      addStep(i,j,'dp['+i+']['+j+']='+dp[i][j],7)
    }
  }
  addStep(m,n,'Edit distance = '+dp[m][n]+' operations',9)
  steps[steps.length-1].result = `Edit distance = ${dp[m][n]}`
  return steps
}