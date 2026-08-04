export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=3?[...inputArray]:[3,4,5,2,1]
  const target=Math.min(9,arr.reduce((a,b)=>a+b,0))
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
  return steps
}