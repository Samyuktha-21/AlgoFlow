export function generateSteps(inputArray) {
  const lists=[[1,4,7],[2,5,8],[3,6,9]]
  const heap=[], result=[], steps=[]
  // Initialize heap with first elements
  lists.forEach((l,i)=>{if(l.length>0)heap.push({val:l[0],list:i,idx:0})})
  heap.sort((a,b)=>a.val-b.val)
  const addStep=(desc,line)=>steps.push({array:result.length>0?[...result]:[0],current:result.length-1,stack:[...heap.map(h=>h.val)],result:[...result],extra:{heapMin:heap[0]?.val||'—',merged:result.join(',')},description:desc,codeLine:line})
  addStep('Merge K Sorted Lists: init heap with first element of each list',2)
  while(heap.length>0&&result.length<20){
    const min=heap.shift(); result.push(min.val)
    addStep('Extract min='+min.val+' from list '+min.list,5)
    const next=lists[min.list][min.idx+1]
    if(next!==undefined){heap.push({val:next,list:min.list,idx:min.idx+1});heap.sort((a,b)=>a.val-b.val);addStep('Push next='+next+' from list '+min.list,6)}
  }
  addStep('Merged: ['+result.join(',')+']',8)
  return steps
}