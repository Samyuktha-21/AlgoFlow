export function generateSteps(inputArray) {
  const price=[1,5,8,9,10,17,17,20]
  const n=Math.min(inputArray&&inputArray[0]>=2?inputArray[0]:6, price.length)
  const dp=new Array(n+1).fill(0), computed=new Array(n+1).fill(false)
  computed[0]=true
  const steps=[]
  const addStep=(cur,desc,line)=>steps.push({dp:[...dp],current:cur,computed:[...computed],description:desc,codeLine:line,extra:{maxRevenue:dp[n]||0,n}})
  addStep(0,'Rod Cutting: dp[i]=max revenue for rod of length i. Prices: ['+price.slice(0,n).join(',')+']',2)
  for(let i=1;i<=n;i++){
    addStep(i,'Computing dp['+i+']: try all cuts 1..'+i,4)
    for(let j=1;j<=i;j++){
      const cand=price[j-1]+dp[i-j]
      addStep(i,'Cut at '+j+': price['+j+']='+price[j-1]+'+dp['+(i-j)+']='+dp[i-j]+'='+cand+' vs dp['+i+']='+dp[i],5)
      if(cand>dp[i]) dp[i]=cand
    }
    computed[i]=true
    addStep(i,'dp['+i+']='+dp[i],6)
  }
  addStep(n,'Max revenue for rod length '+n+' = '+dp[n],7)
  return steps
}