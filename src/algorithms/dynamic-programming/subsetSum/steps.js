export function generateSteps(inputArray) {
  const raw=inputArray&&inputArray.length>=2?[...inputArray]:[3,4,5,2,1]
  /* Columns are running sums, so a negative item indexes off the left edge
     of the table and a negative total asks for an array of negative length.
     Magnitudes keep every number the user typed on screen and the table
     well-formed; the row labels below show the value actually summed. */
  const arr=raw.map(v=>Math.abs(v))
  const target=Math.max(1,Math.min(9,arr.reduce((a,b)=>a+b,0)))
  const n=arr.length
  const dp=Array.from({length:n+1},()=>new Array(target+1).fill(false))
  const computed=Array.from({length:n+1},()=>new Array(target+1).fill(false))
  for(let i=0;i<=n;i++){dp[i][0]=true;computed[i][0]=true}
  const rows=['∅',...arr.map((v,i)=>'a['+i+']='+v)], cols=Array.from({length:target+1},(_,i)=>i)
  const steps=[]
  const addStep=(r,c,desc,line)=>steps.push({dp2d:dp.map(row=>[...row].map(v=>v?'T':'F')),rows:rows.slice(0,n+1),cols,cell:{row:r,col:c},computed2d:computed.map(row=>[...row]),description:desc,codeLine:line,extra:{target,result:dp[n][target]?'YES':'NO'}})
  addStep(0,0,'Subset Sum: target='+target+'. Init first column to T (sum=0 always reachable).',5)
  for(let i=1;i<=n;i++){
    for(let j=1;j<=target;j++){
      const skip=dp[i-1][j]
      const take=arr[i-1]<=j?dp[i-1][j-arr[i-1]]:false
      dp[i][j]=skip||take
      computed[i][j]=true
      addStep(i,j,'Skip='+skip+', Take='+take+' → dp['+i+']['+j+']='+dp[i][j],9)
    }
  }
  addStep(n,target,'Result: dp['+n+']['+target+']='+dp[n][target]+' → subset summing to '+target+' '+(dp[n][target]?'EXISTS':'does NOT exist'),11)
  steps[steps.length-1].result = `Subset summing to ${target} ${dp[n][target]?'exists':'does not exist'}`
  return steps
}