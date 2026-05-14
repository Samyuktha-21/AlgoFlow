export function generateSteps(inputArray) {
  const n=inputArray&&inputArray[0]>=2?Math.min(inputArray[0],12):10
  const arr=new Array(n+1).fill(null), computed=new Array(n+1).fill(false)
  const steps=[]
  const addStep=(cur,desc,line)=>steps.push({array:[...arr.map(v=>v===null?0:v)],current:cur,highlight:[cur],sorted:computed.map((v,i)=>v?i:-1).filter(i=>i>=0),pointers:[{index:cur,label:'n'}],description:desc,codeLine:line,extra:{fib_n:arr[n]||'?'}})
  arr[0]=0; arr[1]=1; computed[0]=computed[1]=true
  addStep(0,'F(0)=0, F(1)=1',2)
  addStep(1,'F(1)=1',2)
  for(let i=2;i<=n;i++){addStep(i,'F('+i+')=F('+(i-1)+')+F('+(i-2)+')='+arr[i-1]+'+'+arr[i-2]+'='+(arr[i-1]+arr[i-2]),4);arr[i]=arr[i-1]+arr[i-2];computed[i]=true;addStep(i,'F('+i+')='+arr[i],4)}
  addStep(-1,'Fibonacci('+n+')='+arr[n],5)
  return steps
}