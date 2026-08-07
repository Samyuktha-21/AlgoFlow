export function generateSteps(inputArray) {
  /* The LAST number is the amount and the rest are denominations. A coin of
     zero or negative value has no meaning here (and would make dp[a-c] index
     backwards), and a non-positive amount leaves no table at all — both used
     to produce NaN on screen. */
  const nums = inputArray && inputArray.length > 1 ? inputArray.map(v=>Math.trunc(v)) : [1,5,6,9,11]
  const coins = [...new Set(nums.slice(0,-1).map(v=>Math.abs(v)).filter(v=>v>0))].sort((a,b)=>a-b)
  const amount = Math.min(Math.max(1, Math.abs(nums[nums.length-1])), 60)
  if (!coins.length) coins.push(1)
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
  steps[steps.length-1].result = `Min coins = ${dp[amount]>=INF?-1:dp[amount]}`
  return steps
}