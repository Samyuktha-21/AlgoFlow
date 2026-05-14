export function generateSteps(inputArray) {
  const vals=inputArray&&inputArray.length>=2?[...inputArray]:[1,2,3,4,5]
  const queue=[], dequeued=[], steps=[]
  const addStep=(cur,op,desc,line)=>steps.push({array:vals,current:cur,stack:[...queue],result:[...dequeued],highlight:cur>=0?[cur]:[],description:desc,codeLine:line,extra:{op,front:queue[0]||'—'}})
  addStep(-1,'init','Queue (FIFO): enqueue adds to rear, dequeue removes from front',2)
  for(let i=0;i<vals.length;i++){queue.push(vals[i]);addStep(i,'enqueue','enqueue('+vals[i]+'). Queue: ['+queue.join(',')+']',4)}
  while(queue.length>0){const v=queue.shift();dequeued.push(v);addStep(-1,'dequeue','dequeue()='+v+'. Queue: ['+queue.join(',')+']',7)}
  return steps
}