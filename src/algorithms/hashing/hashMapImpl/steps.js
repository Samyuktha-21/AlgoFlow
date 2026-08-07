export function generateSteps(inputArray) {
  const keys=inputArray&&inputArray.length>=2?[...inputArray]:[12,44,13,88,23,94,11,39,20,16,5]
  const SIZE=11
  const table=Array.from({length:SIZE},()=>[])
  const steps=[]
  const arrView=()=>table.map(b=>b.length?b[0][0]:null).slice(0,SIZE)
  const addStep=(idx,key,op,desc,line)=>steps.push({array:arrView(),current:idx,highlight:[idx],sorted:[],pointers:[],extra:{operation:op,key,bucket:idx},description:desc,codeLine:line})
  addStep(-1,-1,'init','Hash Table (size='+SIZE+'): visualizing key → bucket mapping',2)
  for(const key of keys){
    const idx=((key%SIZE)+SIZE)%SIZE
    addStep(idx,key,'hash','hash('+key+') = '+key+' % '+SIZE+' = '+idx,4)
    if(table[idx].length>0){addStep(idx,key,'collision','Collision at bucket '+idx+'! Chaining with existing key '+table[idx][0][0],6)}
    table[idx].push([key,key])
    addStep(idx,key,'insert','Inserted key='+key+' into bucket '+idx,7)
  }
  addStep(-1,-1,'done','Hash table loaded. Lookup any key in O(1) average',9)
  steps[steps.length-1].result = `${keys.length} keys in ${SIZE} buckets`
  return steps
}