export function generateSteps(inputArray) {
  const base=inputArray&&inputArray.length>=2?inputArray[0]:2
  const n=inputArray&&inputArray.length>=2?Math.min(inputArray[1],20):10
  const arr=new Array(Math.floor(Math.log2(n))+2).fill(0)
  const steps=[]
  let x=base, exp=n, result=1, step=0
  const addStep=(desc,line)=>steps.push({array:[result,x,exp],current:step,highlight:[0,1,2],sorted:[],pointers:[{index:0,label:'result'},{index:1,label:'x'},{index:2,label:'n'}],extra:{result,x:x.toFixed(2),n:exp},description:desc,codeLine:line})
  addStep('Fast Power: '+base+'^'+n+' using binary exponentiation (O(log n))',2)
  while(exp>0){
    if(exp%2===1){result*=x;addStep('n is odd: result×=x → result='+result.toFixed(2),5)}
    else addStep('n is even: skip multiply',6)
    x*=x; exp=Math.floor(exp/2); step++
    addStep('Square x='+x.toFixed(2)+', halve n='+exp,7)
  }
  addStep(base+'^'+n+' = '+result.toFixed(0),8)
  return steps
}