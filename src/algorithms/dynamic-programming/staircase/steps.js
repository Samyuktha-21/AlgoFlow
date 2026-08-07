export function generateSteps(inputArray) {
  const n=inputArray&&inputArray[0]>=2?Math.min(inputArray[0],12):8
  const dp=new Array(n+1).fill(null)
  const computed=new Array(n+1).fill(false)
  dp[0]=1; dp[1]=1; computed[0]=computed[1]=true
  const steps=[]
  const addStep=(cur,desc,line)=>steps.push({dp:[...dp],current:cur,computed:[...computed],description:desc,codeLine:line,extra:{n,ways:dp[n]||'?'}})
  addStep(-1,'Staircase (n='+n+'): dp[i] = ways to reach stair i',2)
  addStep(1,'Base: dp[1]=1 (one way: single step)',5)
  addStep(2,'Base: dp[2]=2 (1+1 or 2)',5)
  dp[2]=2; computed[2]=true
  for(let i=3;i<=n;i++){
    addStep(i,'dp['+i+'] = dp['+(i-1)+']+dp['+(i-2)+'] = '+dp[i-1]+'+'+dp[i-2]+'='+(dp[i-1]+dp[i-2]),6)
    dp[i]=dp[i-1]+dp[i-2]; computed[i]=true
    addStep(i,'dp['+i+'] = '+dp[i]+' ways to reach stair '+i,6)
  }
  addStep(-1,'Ways to climb '+n+' stairs = '+dp[n],7)
  steps[steps.length-1].result = `${dp[n]} ways`
  return steps
}