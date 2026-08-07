export function generateSteps(inputArray) {
  const n=inputArray&&inputArray[0]>=2?inputArray[0]:37
  const arr=Array.from({length:Math.floor(Math.sqrt(n))+1},(_,i)=>i===0?n:i)
  const steps=[], tried=[]
  const addStep=(i,div,desc,line)=>steps.push({array:arr,current:i,highlight:[...(div>0?[div]:[]),(i>=0?i:-1)].filter(x=>x>=0),sorted:[...(arr.indexOf(div)>=0?[arr.indexOf(div)]:[])],pointers:[],extra:{n,divisor:div,isPrime:tried.length===0||div===0},description:desc,codeLine:line})
  addStep(-1,0,'Check if '+n+' is prime: test divisors 2 to √'+n+'≈'+Math.floor(Math.sqrt(n)),2)
  if(n<2){addStep(-1,0,n+' < 2 → not prime',3);steps[steps.length-1].result=n+' is not prime';return steps}
  if(n===2){addStep(-1,0,'2 is prime (special case)',4);steps[steps.length-1].result='2 is prime';return steps}
  if(n%2===0){addStep(-1,2,n+' is even → not prime',5);steps[steps.length-1].result=n+' is not prime';return steps}
  for(let i=3;i*i<=n;i+=2){
    addStep(arr.indexOf(i),i,'Test: '+n+' ÷ '+i+' = '+( n%i===0?n/i:'not divisible'),7)
    if(n%i===0){addStep(arr.indexOf(i),i,n+' is divisible by '+i+' → NOT PRIME',8);steps[steps.length-1].result=n+' is not prime';return steps}
    tried.push(i)
  }
  addStep(-1,0,'No divisors found up to √'+n+' → '+n+' IS PRIME',10)
  steps[steps.length-1].result = n+' is prime'
  return steps
}