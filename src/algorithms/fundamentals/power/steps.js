export function generateSteps(inputArray) {
  const base=inputArray&&inputArray.length>=2?inputArray[0]:2
  const n=inputArray&&inputArray.length>=2?Math.min(inputArray[1],20):10
  const steps=[]
  let x=base, exp=n, result=1
  /* `current` indexes the three cells [result, x, n], so it names the cell
     this step changes — it used to be the loop counter, which walked straight
     off a 3-cell array. */
  const addStep=(cur,desc,line)=>steps.push({array:[result,x,exp],current:cur,highlight:[0,1,2],sorted:[],pointers:[{index:0,label:'result'},{index:1,label:'x'},{index:2,label:'n'}],extra:{result,x:x.toFixed(2),n:exp},description:desc,codeLine:line})
  addStep(-1,'Fast Power: '+base+'^'+n+' using binary exponentiation (O(log n))',2)
  while(exp>0){
    if(exp%2===1){result*=x;addStep(0,'n is odd: result×=x → result='+result.toFixed(2),5)}
    else addStep(2,'n is even: skip multiply',6)
    x*=x; exp=Math.floor(exp/2)
    addStep(1,'Square x='+x.toFixed(2)+', halve n='+exp,7)
  }
  addStep(0,base+'^'+n+' = '+result.toFixed(0),8)
  steps[steps.length-1].result = `${base}^${n} = ${result.toFixed(0)}`
  return steps
}