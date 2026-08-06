export function generateSteps(inputArray) {
  const all=inputArray&&inputArray.length>=3?[...inputArray]:[10,30,5,60]
  /* The recurrence is cubic and every step snapshots the whole n×n table, so
     the full 50 dimensions the validator allows costs hundreds of millions of
     cells — the tab dies before it renders. The grid stops being readable
     well before that, so visualize the first 9 dimensions. */
  const dims=all.slice(0,9)
  const n=dims.length-1
  const dp=Array.from({length:n},()=>new Array(n).fill(0))
  const computed=Array.from({length:n},()=>new Array(n).fill(false))
  const rows=Array.from({length:n},(_,i)=>'A'+(i+1))
  const cols=Array.from({length:n},(_,i)=>'A'+(i+1))
  const steps=[]
  const addStep=(r,c,desc,line)=>steps.push({dp2d:dp.map(row=>[...row]),rows,cols,cell:{row:r,col:c},computed2d:computed.map(row=>[...row]),description:desc,codeLine:line,extra:{minCost:dp[0]?.[n-1]||0}})
  addStep(0,0,'Matrix Chain: minimize multiplications for chain A1×A2×...×An'+(all.length>dims.length?' (showing the first '+dims.length+' of '+all.length+' dimensions)':''),2)
  for(let i=0;i<n;i++){dp[i][i]=0;computed[i][i]=true}
  addStep(0,0,'Diagonal (single matrix): dp[i][i]=0',4)
  for(let len=2;len<=n;len++){
    for(let i=0;i<n-len+1;i++){
      const j=i+len-1
      dp[i][j]=Infinity
      for(let k=i;k<j;k++){
        const cost=dp[i][k]+dp[k+1][j]+dims[i]*dims[k+1]*dims[j+1]
        addStep(i,j,'len='+len+': dp['+i+']['+j+'] try k='+k+' cost='+cost+' vs '+dp[i][j],9)
        if(cost<dp[i][j]) dp[i][j]=cost
      }
      computed[i][j]=true
      addStep(i,j,'dp['+i+']['+j+']='+dp[i][j],10)
    }
  }
  addStep(0,n-1,'Min multiplications = '+dp[0][n-1],13)
  return steps
}