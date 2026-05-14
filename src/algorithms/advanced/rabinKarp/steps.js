export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=3?[...inputArray]:[3,1,4,1,5,9,2,6]
  const steps=[]
  const addStep=(i,hl,d,line)=>steps.push({array:[...arr],current:i,highlight:[...hl],sorted:[],pointers:[{index:i>=0?i:0,label:'i'}],description:d,codeLine:line,extra:{}})
  addStep(-1,[],'Rabin-Karp: rolling hash-based pattern search',2)
  for(let i=0;i<arr.length;i++) addStep(i,[i],'Processing index '+i+' value='+arr[i],4)
  addStep(-1,Array.from({length:arr.length},(_,i)=>i),'Algorithm complete',6)
  return steps
}