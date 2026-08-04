export function generateSteps() {
  const weights=[10,20,30], values=[60,100,120], W=50, n=weights.length
  const dp=Array.from({length:n+1},()=>new Array(W+1).fill(0))
  const computed2d=Array.from({length:n+1},()=>new Array(W+1).fill(false))
  const rows=['(none)',...weights.map((w,i)=>'Item'+(i+1)+'(w='+w+',v='+values[i]+')')]
  const cols=Array.from({length:W+1},(_,i)=>i)
  const steps=[]
  const addStep=(r,c,desc,line)=>steps.push({dp2d:dp.map(row=>[...row]),rows,cols:cols.slice(0,W+1),cell:{row:r,col:c},computed2d:computed2d.map(row=>[...row]),description:desc,codeLine:line,extra:{MaxValue:dp[r]?.[W]||0}})
  addStep(0,0,'Initialize dp[0][w]=0 for all w (no items = 0 value)',3)
  for(let w=0;w<=W;w++){dp[0][w]=0;computed2d[0][w]=true}
  for(let i=1;i<=n;i++){
    const wi=weights[i-1], vi=values[i-1]
    for(let w=0;w<=W;w++){
      addStep(i,w,'Item '+i+'(w='+wi+',v='+vi+'), capacity='+w,5)
      if(wi>w){dp[i][w]=dp[i-1][w];addStep(i,w,'Weight '+wi+'>'+w+': skip → dp['+i+']['+w+']='+dp[i][w],6)}
      else{const take=dp[i-1][w-wi]+vi,skip=dp[i-1][w];dp[i][w]=Math.max(take,skip);addStep(i,w,'Take='+take+', Skip='+skip+' → dp['+i+']['+w+']='+dp[i][w],8)}
      computed2d[i][w]=true
    }
  }
  addStep(n,W,'Max value: dp['+n+']['+W+']='+dp[n][W],11)
  return steps
}