export function generateSteps(inputArray) {
  const vals=inputArray&&inputArray.length>=2?[...inputArray]:[5,1,3,9,2,7,4]
  const heap=[], steps=[]
  function heapifyUp(){let i=heap.length-1;while(i>0){const p=Math.floor((i-1)/2);if(heap[p]>heap[i]){[heap[i],heap[p]]=[heap[p],heap[i]];i=p}else break}}
  function heapifyDown(){let i=0;while(true){let s=i,l=2*i+1,r=2*i+2;if(l<heap.length&&heap[l]<heap[s])s=l;if(r<heap.length&&heap[r]<heap[s])s=r;if(s===i)break;[heap[i],heap[s]]=[heap[s],heap[i]];i=s}}
  const addStep=(cur,desc,line)=>steps.push({array:[...vals],current:cur,stack:[...heap],result:[],extra:{min:heap[0]||'—',size:heap.length},description:desc,codeLine:line})
  addStep(-1,'Priority Queue (min-heap): smallest element always at front',2)
  for(let i=0;i<vals.length;i++){heap.push(vals[i]);heapifyUp();addStep(i,'push('+vals[i]+'). Min='+heap[0],4)}
  while(heap.length>0){const m=heap[0];const last=heap.pop();if(heap.length>0){heap[0]=last;heapifyDown()}addStep(-1,'poll()='+m+'. New min='+(heap.length>0?heap[0]:'empty'),7)}
  addStep(-1,'Priority queue emptied (elements processed by priority)',8)
  return steps
}