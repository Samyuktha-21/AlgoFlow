export function generateSteps(inputArray) {
  const k=inputArray&&inputArray[0]>=1?Math.min(inputArray[0],4):2
  const n=inputArray&&inputArray[1]>=2?Math.min(inputArray[1],30):14
  const dp=Array.from({length:n+1},()=>new Array(k+1).fill(0))
  const computed=Array.from({length:n+1},()=>new Array(k+1).fill(false))
  const rows=Array.from({length:n+1},(_,i)=>'m='+i)
  const cols=Array.from({length:k+1},(_,i)=>i+'egg'+(i===1?'':'s'))
  const steps=[]
  const addStep=(r,c,desc,line)=>steps.push({dp2d:dp.map(row=>[...row]),rows,cols,cell:{row:r,col:c},computed2d:computed.map(row=>[...row]),description:desc,codeLine:line,extra:{k,n,answer:'?'}})
  addStep(0,0,'Egg Drop: '+k+' eggs, '+n+' floors. Find min moves.',2)
  let m=0
  while(dp[m][k]<n){
    m++
    for(let j=1;j<=k;j++){
      dp[m][j]=dp[m-1][j-1]+dp[m-1][j]+1
      computed[m][j]=true
      addStep(m,j,'dp['+m+']['+j+'] = dp['+(m-1)+']['+(j-1)+']+dp['+(m-1)+']['+j+']+1 = '+(dp[m-1][j-1])+'+'+(dp[m-1][j])+'+1='+dp[m][j],9)
    }
    addStep(m,k,'With '+m+' moves and '+k+' eggs: can test dp['+m+']['+k+']='+dp[m][k]+' floors',6)
    if(dp[m][k]>=n){addStep(m,k,'dp['+m+']['+k+']='+dp[m][k]+' >= '+n+' → answer is '+m+' moves!',11);break}
  }
  return steps
}