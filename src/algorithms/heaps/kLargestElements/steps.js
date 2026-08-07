export function generateSteps(inputArray) {
  /* The LAST number is k; the array is everything before it. */
  const nums=inputArray&&inputArray.length>=2?[...inputArray]:[3,1,7,9,2,5,8,4,6,3]
  const arr=nums.slice(0,-1)
  const k=Math.min(Math.max(1,Math.abs(nums[nums.length-1])),arr.length), steps=[]
  const heap=[]
  function heapifyUp(){let i=heap.length-1;while(i>0){const p=Math.floor((i-1)/2);if(heap[p]>heap[i]){[heap[i],heap[p]]=[heap[p],heap[i]];i=p}else break}}
  function heapifyDown(){let i=0;while(true){let s=i,l=2*i+1,r=2*i+2;if(l<heap.length&&heap[l]<heap[s])s=l;if(r<heap.length&&heap[r]<heap[s])s=r;if(s!==i){[heap[i],heap[s]]=[heap[s],heap[i]];i=s}else break}}
  const addStep=(cur,desc,line)=>steps.push({array:[...arr],current:cur,stack:[...heap],result:[],highlight:[cur<arr.length?cur:-1].filter(x=>x>=0),description:desc,codeLine:line,extra:{k,'heapMin':heap[0]||'—'}})
  addStep(-1,'Find K='+k+' largest elements using a min-heap of size '+k,2)
  for(let i=0;i<arr.length;i++){
    if(heap.length<k){
      heap.push(arr[i]); heapifyUp()
      addStep(i,'Add arr['+i+']='+arr[i]+' to heap (size<k). Heap: ['+heap.join(',')+']',4)
    } else if(arr[i]>heap[0]){
      addStep(i,'arr['+i+']='+arr[i]+' > heap min '+heap[0]+' → replace',6)
      heap[0]=arr[i]; heapifyDown()
      addStep(i,'Updated heap: ['+heap.join(',')+']',7)
    } else {
      addStep(i,'arr['+i+']='+arr[i]+' ≤ heap min '+heap[0]+' → skip',8)
    }
  }
  addStep(-1,'K='+k+' largest elements: ['+[...heap].sort((a,b)=>b-a).join(',')+']',9)
  steps[steps.length-1].result = `${k} largest: ${[...heap].sort((a,b)=>b-a).join(', ')}`
  return steps
}