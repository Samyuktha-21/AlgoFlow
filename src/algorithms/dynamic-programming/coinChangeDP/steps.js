export function generateSteps(inputArray) {
  const coins = inputArray && inputArray.length > 1 ? inputArray.slice(0,-1) : [1,5,6,9]
  const amount = inputArray && inputArray.length > 1 ? inputArray[inputArray.length-1] : 11
  const INF = amount + 1
  const dp = new Array(amount + 1).fill(INF)
  const computed = new Array(amount + 1).fill(false)
  dp[0] = 0; computed[0] = true
  const steps = []
  const addStep=(cur,desc,line)=>steps.push({dp:[...dp.map(v=>v>=INF?null:v)],current:cur,computed:[...computed],description:desc,codeLine:line,extra:{coins:coins.join(','),target:amount}})
  addStep(0,'Init: dp[0]=0, all others=∞. Coins: ['+coins.join(',')+'], Target: '+amount,5)
  for(let i=1;i<=amount;i++){
    addStep(i,'Computing dp['+i+']',7)
    for(const c of coins){
      if(c<=i){
        const cand=dp[i-c]+1
        addStep(i,'Coin '+c+': dp['+(i-c)+']+1='+cand+' vs dp['+i+']='+( dp[i]>=INF?'∞':dp[i]),9)
        if(cand<dp[i]){dp[i]=cand;addStep(i,'Update dp['+i+']='+dp[i],9)}
      }
    }
    computed[i]=true
    addStep(i,'dp['+i+']='+( dp[i]>=INF?'-1 (impossible)':dp[i]),9)
  }
  addStep(-1,'Min coins for '+amount+': '+(dp[amount]>=INF?'-1':dp[amount]),10)
  return steps
}