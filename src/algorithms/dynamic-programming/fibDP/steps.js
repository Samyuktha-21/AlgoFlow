export function generateSteps(inputArray) {
  const n = inputArray ? inputArray[0] : 8
  const dp = new Array(n + 1).fill(null)
  const computed = new Array(n + 1).fill(false)
  const steps = []
  const addStep=(cur,desc,line)=>steps.push({dp:[...dp],current:cur,computed:[...computed],description:desc,codeLine:line,extra:cur>=0&&dp[cur]!==null?{['fib('+cur+')']:dp[cur]}:{}})
  addStep(-1,'Fibonacci DP: fill dp[0..'+n+'] bottom-up',2)
  dp[0]=0; computed[0]=true
  addStep(0,'Base case: dp[0] = 0',5)
  if(n>=1){dp[1]=1;computed[1]=true;addStep(1,'Base case: dp[1] = 1',5)}
  for(let i=2;i<=n;i++){
    addStep(i,'Computing dp['+i+'] = dp['+(i-1)+']+dp['+(i-2)+'] = '+dp[i-1]+'+'+dp[i-2],7)
    dp[i]=dp[i-1]+dp[i-2]; computed[i]=true
    addStep(i,'dp['+i+'] = '+dp[i],7)
  }
  addStep(-1,'fib('+n+') = '+dp[n],8)
  steps[steps.length-1].result = `fib(${n}) = ${dp[n]}`
  return steps
}