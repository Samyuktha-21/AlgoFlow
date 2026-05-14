export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=3?[...inputArray]:[1,2,3,4,5,6,7]
  let k=3%arr.length
  const n=arr.length, a=[...arr], steps=[]
  const addStep=(hl,desc,line)=>steps.push({array:[...a],highlight:[...hl],sorted:[],pointers:[],description:desc,codeLine:line,extra:{k}})
  addStep([],'Rotate array right by k='+k+': three reversal technique',2)
  function rev(l,r){
    while(l<r){
      addStep([l,r],'Swap a['+l+']='+a[l]+' and a['+r+']='+a[r],6)
      ;[a[l],a[r]]=[a[r],a[l]]; l++; r--
    }
  }
  addStep([],'Step 1: Reverse entire array [0..'+( n-1)+']',3); rev(0,n-1); addStep([...Array.from({length:n},(_,i)=>i)],'After full reverse: ['+a.join(',')+']',3)
  addStep([],'Step 2: Reverse first k='+k+' elements [0..'+(k-1)+']',4); rev(0,k-1); addStep([...Array.from({length:k},(_,i)=>i)],'After first-k reverse: ['+a.join(',')+']',4)
  addStep([],'Step 3: Reverse remaining ['+k+'..'+(n-1)+']',5); rev(k,n-1); addStep([...Array.from({length:n},(_,i)=>i)],'Rotated: ['+a.join(',')+']',5)
  return steps
}