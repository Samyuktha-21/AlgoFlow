export function generateSteps(inputArray) {
  const arr = inputArray && inputArray.length >= 2 ? [...inputArray] : [-2,1,-3,4,-1,2,1,-5,4]
  const n = arr.length, steps = []
  let maxSum=arr[0], curSum=arr[0], winStart=0, bestStart=0, bestEnd=0
  const addStep=(cur,ws,we,bs,be,desc,line)=>steps.push({array:[...arr],current:cur,window:{start:ws,end:we},highlight:[...Array.from({length:we-ws+1},(_,i)=>ws+i)],sorted:[...Array.from({length:be-bs+1},(_,i)=>bs+i)],pointers:[{index:cur,label:'i'},{index:ws,label:'ws'},{index:bs,label:'best'}],extra:{currentSum:curSum,maxSum},description:desc,codeLine:line})
  addStep(0,0,0,0,0,'Init: currentSum=maxSum=arr[0]='+arr[0],2)
  for(let i=1;i<n;i++){
    const extend=curSum+arr[i]
    addStep(i,winStart,i,bestStart,bestEnd,'i='+i+': extend='+extend+', restart='+arr[i],5)
    if(arr[i]>curSum+arr[i]){curSum=arr[i];winStart=i;addStep(i,winStart,i,bestStart,bestEnd,'Restart: currentSum='+arr[i],6)}
    else{curSum+=arr[i];addStep(i,winStart,i,bestStart,bestEnd,'Extend: currentSum='+curSum,7)}
    if(curSum>maxSum){maxSum=curSum;bestStart=winStart;bestEnd=i;addStep(i,winStart,i,bestStart,bestEnd,'New max! maxSum='+maxSum+' range['+bestStart+'..'+bestEnd+']',9)}
  }
  addStep(n-1,bestStart,bestEnd,bestStart,bestEnd,'Max subarray sum='+maxSum+' at ['+bestStart+'..'+bestEnd+']',11)
  return steps
}