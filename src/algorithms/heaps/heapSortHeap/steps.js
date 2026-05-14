export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=2?[...inputArray]:[4,10,3,5,1,8,7,2]
  const n=arr.length, sorted=[], steps=[]
  const addStep=(cmp,swp,s,desc,line)=>steps.push({array:[...arr],heapSize:n-s,comparing:[...cmp],swapping:[...swp],sorted:[...sorted],description:desc,codeLine:line})
  function heapify(a,size,i){
    let lg=i,l=2*i+1,r=2*i+2
    addStep([i,...(l<size?[l]:[]),...(r<size?[r]:[])],[],sorted.length,'Heapify at '+i+': check children',4)
    if(l<size&&a[l]>a[lg])lg=l
    if(r<size&&a[r]>a[lg])lg=r
    if(lg!==i){addStep([],[i,lg],sorted.length,'Swap a['+i+']='+a[i]+' and a['+lg+']='+a[lg],5)
      ;[a[i],a[lg]]=[a[lg],a[i]]; heapify(a,size,lg)}
  }
  addStep([],[],0,'Build max-heap from array',2)
  for(let i=Math.floor(n/2)-1;i>=0;i--) heapify(arr,n,i)
  addStep([],[],0,'Max-heap built. Root='+arr[0]+'. Now extract max repeatedly.',6)
  for(let i=n-1;i>0;i--){
    addStep([],[0,i],n-1-i,'Extract max '+arr[0]+' → swap with end',8)
    ;[arr[0],arr[i]]=[arr[i],arr[0]]
    sorted.push(i)
    heapify(arr,i,0)
  }
  sorted.push(0)
  addStep([],[],n,'Sorted: ['+arr.join(',')+']',10)
  return steps
}