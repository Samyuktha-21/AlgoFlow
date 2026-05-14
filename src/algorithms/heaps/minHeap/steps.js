export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=2?[...inputArray]:[9,5,3,7,1,8,4,6,2]
  const heap=[], steps=[]
  const addStep=(cmp,swp,desc,line)=>steps.push({array:[...heap],heapSize:heap.length,comparing:[...cmp],swapping:[...swp],sorted:[],description:desc,codeLine:line})
  addStep([],'','Min-Heap: parent always ≤ children, minimum at root',2)
  for(const val of arr){
    heap.push(val)
    addStep([heap.length-1],[],'Insert '+val+' at index '+(heap.length-1),4)
    let i=heap.length-1
    while(i>0){
      const par=Math.floor((i-1)/2)
      addStep([i,par],[],'Compare heap['+i+']='+heap[i]+' with parent heap['+par+']='+heap[par],6)
      if(heap[par]>heap[i]){
        addStep([],[i,par],'heap['+par+']='+heap[par]+' > '+heap[i]+' → sift up',7)
        ;[heap[i],heap[par]]=[heap[par],heap[i]]
        i=par
      } else { addStep([],[],'heap['+par+'] ≤ '+heap[i]+' → heap property satisfied',8); break }
    }
    addStep([],[],'Min-heap after inserting '+val+': root='+heap[0],9)
  }
  addStep([],[],'Min-Heap built! Minimum = '+heap[0],10)
  return steps
}