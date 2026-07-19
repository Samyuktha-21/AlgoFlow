export function generateSteps(inputArray) {
  let a=inputArray&&inputArray.length>=2?inputArray[0]:48, b=inputArray&&inputArray.length>=2?inputArray[1]:18
  const steps=[]
  const addStep=(vals,desc,line)=>steps.push({array:[...vals],current:0,highlight:[0,1],sorted:[],pointers:[{index:0,label:'a'},{index:1,label:'b'}],description:desc,codeLine:line,extra:{gcd:vals[1]===0?vals[0]:'?'}})
  addStep([a,b],'Euclid GCD('+a+','+b+'): repeatedly compute a mod b',2)
  while(b!==0){
    const r=a%b
    addStep([a,b,r],'a='+a+', b='+b+' → '+a+' mod '+b+'='+r,3)
    a=b; b=r
    addStep([a,b],'New: a='+a+', b='+b,4)
  }
  addStep([a,0],'b=0, GCD='+a,5)
  return steps
}