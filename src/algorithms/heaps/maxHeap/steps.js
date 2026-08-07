export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=2?[...inputArray]:[3,1,6,5,2,4,8,7]
  const n=arr.length, steps=[]
  const addStep=(cmp,swp,desc,line)=>steps.push({array:[...arr],heapSize:n,comparing:[...cmp],swapping:[...swp],sorted:[],description:desc,codeLine:line})
  addStep([],'','Build Max-Heap from ['+arr.join(',')+']',2)
  function heapify(a,size,i){
    let lg=i, l=2*i+1, r=2*i+2
    addStep([i,...(l<size?[l]:[]),...(r<size?[r]:[])],[],'Heapify at '+i+': compare with children '+( l<size?l:'-')+','+( r<size?r:'-'),9)
    if(l<size&&a[l]>a[lg]) lg=l
    if(r<size&&a[r]>a[lg]) lg=r
    if(lg!==i){
      addStep([],[i,lg],'Swap: a['+i+']='+a[i]+' < a['+lg+']='+a[lg],12)
      ;[a[i],a[lg]]=[a[lg],a[i]]
      for(let x=0;x<n;x++) arr[x]=a[x]
      addStep([],[],  'After swap: a['+i+']='+arr[i],13)
      heapify(a,size,lg)
    }
  }
  const copy=[...arr]
  for(let i=Math.floor(n/2)-1;i>=0;i--){
    addStep([i],[],'Start heapify at index '+i+' (last non-leaf area)',7)
    heapify(copy,n,i)
  }
  addStep([],[],  'Max-Heap built! Root (max) = '+arr[0],14)
  steps[steps.length-1].result = `Max = ${arr[0]}`
  return steps
}