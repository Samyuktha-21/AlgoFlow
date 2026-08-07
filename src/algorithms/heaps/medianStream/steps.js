export function generateSteps(inputArray) {
  const nums=inputArray&&inputArray.length>=3?[...inputArray]:[5,15,1,3,2,8,7,9]
  const maxH=[], minH=[], steps=[]
  const addStep=(i,desc,line)=>steps.push({array:[...nums],current:i,stack:[...maxH.slice().sort((a,b)=>b-a)],stack2:[...minH.slice().sort((a,b)=>a-b)],stackLabel:'MaxHeap (lower)',stack2Label:'MinHeap (upper)',result:[],extra:{median:maxH.length>0?(maxH.length>minH.length?maxH[0]:( maxH[0]+minH[0])/2):'-'},description:desc,codeLine:line})
  addStep(-1,'Median Stream: two heaps keep lower/upper halves balanced',2)
  for(let i=0;i<nums.length;i++){
    maxH.push(nums[i]); maxH.sort((a,b)=>b-a)
    addStep(i,'Push '+nums[i]+' to max-heap',4)
    if(maxH.length>0){minH.push(maxH.shift()); minH.sort((a,b)=>a-b)}
    addStep(i,'Move max-heap top to min-heap',5)
    if(maxH.length<minH.length){maxH.push(minH.shift()); maxH.sort((a,b)=>b-a)}
    const med=maxH.length>minH.length?maxH[0]:(maxH[0]+minH[0])/2
    addStep(i,'Median='+med+'. maxH=['+maxH.join(',')+'], minH=['+minH.join(',')+']',7)
  }
  steps[steps.length-1].result = `Final median = ${maxH.length>minH.length?maxH[0]:(maxH[0]+minH[0])/2}`
  return steps
}