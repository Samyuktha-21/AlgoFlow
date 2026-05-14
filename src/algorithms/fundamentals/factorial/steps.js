export function generateSteps(inputArray) {
  const n=inputArray&&inputArray[0]>=1?Math.min(inputArray[0],10):8
  const arr=new Array(n+1).fill(0), computed=new Array(n+1).fill(false)
  const steps=[]
  const addStep=(cur,desc,line)=>steps.push({array:[...arr],current:cur,highlight:[cur],sorted:computed.map((v,i)=>v?i:-1).filter(i=>i>=0),pointers:[{index:cur,label:'i'}],description:desc,codeLine:line,extra:{result:arr[n]||1}})
  arr[0]=1; computed[0]=true
  addStep(0,'0! = 1 (base case)',2)
  for(let i=1;i<=n;i++){addStep(i,i+'! = '+i+' × '+(i-1)+'! = '+i+' × '+arr[i-1],4);arr[i]=i*arr[i-1];computed[i]=true;addStep(i,i+'! = '+arr[i],4)}
  addStep(n,n+'! = '+arr[n],5)
  return steps
}