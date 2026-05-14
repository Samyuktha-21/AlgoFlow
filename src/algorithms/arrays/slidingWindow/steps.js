export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=4?[...inputArray]:[1,3,-1,-3,5,3,6,7]
  const k=3, n=arr.length
  const deque=[], result=[]
  const steps=[]
  const addStep=(i,desc,line)=>steps.push({array:[...arr],window:{start:Math.max(0,i-k+1),end:i},current:i,pointers:[{index:i,label:'i'}],highlight:[...deque],sorted:[],extra:{dequeVals:deque.map(di=>arr[di]).join(','),k,maxSoFar:deque.length>0?arr[deque[0]]:'-'},description:desc,codeLine:line})
  addStep(-1,'Sliding Window Max (k='+k+'): use deque to track max',2)
  for(let i=0;i<n;i++){
    addStep(i,'Processing index '+i+', value='+arr[i],4)
    while(deque.length>0&&deque[0]<i-k+1){addStep(i,'Remove front index '+deque[0]+' (outside window)',5);deque.shift()}
    while(deque.length>0&&arr[deque[deque.length-1]]<=arr[i]){addStep(i,'Remove rear '+arr[deque[deque.length-1]]+' ≤ '+arr[i],6);deque.pop()}
    deque.push(i)
    addStep(i,'Push index '+i+' to deque. Front='+arr[deque[0]]+' (window max)',7)
    if(i>=k-1){result.push(arr[deque[0]]);addStep(i,'Window ['+Math.max(0,i-k+1)+'..'+i+'] max='+arr[deque[0]],9)}
  }
  addStep(-1,'Sliding window maxima: ['+result.join(',')+']',10)
  return steps
}