export function generateSteps(inputArray) {
  const n=inputArray&&inputArray[0]>=5?Math.min(inputArray[0],20):15
  const arr=Array.from({length:n},(_,i)=>i+1), steps=[], sorted=[]
  const addStep=(i,label,desc,line)=>steps.push({array:[...arr],current:i,highlight:[i],sorted:[...sorted],pointers:[{index:i,label}],description:desc,codeLine:line,extra:{value:label}})
  addStep(-1,'start','FizzBuzz 1 to '+n+': Fizz(÷3), Buzz(÷5), FizzBuzz(÷15)',2)
  for(let i=0;i<n;i++){
    const v=arr[i]
    if(v%15===0){sorted.push(i);addStep(i,'FB',v+' ÷ 15 = 0 → FizzBuzz',3)}
    else if(v%3===0){sorted.push(i);addStep(i,'F',v+' ÷ 3 = 0 → Fizz',5)}
    else if(v%5===0){sorted.push(i);addStep(i,'B',v+' ÷ 5 = 0 → Buzz',7)}
    else addStep(i,String(v),v+' → print '+v,9)
  }
  steps[steps.length-1].result = `FizzBuzz to ${n}`
  return steps
}