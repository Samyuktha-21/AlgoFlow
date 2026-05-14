export function generateSteps(inputArray) {
  const rawInput = inputArray && inputArray.length >= 2 ? inputArray : [2,0,2,1,1,0,1,2,0]
  const arr = rawInput.map(v=>v%3)
  const n = arr.length, steps = []
  let lo=0, mid=0, hi=n-1
  const addStep=(action,desc,line)=>{
    const highlight=[], sorted=[]
    for(let i=0;i<lo;i++) sorted.push(i)
    for(let i=hi+1;i<n;i++) sorted.push(i)
    steps.push({array:[...arr],pointers:[{index:lo,label:'lo'},{index:mid,label:'mid'},{index:hi,label:'hi'}],highlight:[mid],sorted,description:desc,codeLine:line})
  }
  addStep(null,'Dutch Flag: [0s | 1s | 2s] with lo='+lo+', mid='+mid+', hi='+hi,2)
  while(mid<=hi){
    if(arr[mid]===0){
      addStep('swap','arr[mid]=0 → swap(arr[lo]='+arr[lo]+', arr[mid]='+arr[mid]+'), lo++, mid++',5)
      ;[arr[lo],arr[mid]]=[arr[mid],arr[lo]]; lo++; mid++
      addStep('done','After swap',6)
    } else if(arr[mid]===1){
      addStep('skip','arr[mid]=1 → mid++ (1s in place)',8)
      mid++
    } else {
      addStep('swap','arr[mid]=2 → swap(arr[mid]='+arr[mid]+', arr[hi]='+arr[hi]+'), hi--',10)
      ;[arr[mid],arr[hi]]=[arr[hi],arr[mid]]; hi--
      addStep('done','After swap (no mid++ — recheck)',10)
    }
  }
  const allSorted=Array.from({length:n},(_,i)=>i)
  steps.push({array:[...arr],pointers:[],highlight:[],sorted:allSorted,description:'Sorted: ['+arr.join(',')+']',codeLine:12})
  return steps
}