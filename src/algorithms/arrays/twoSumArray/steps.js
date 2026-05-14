export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=2?[...inputArray]:[2,7,11,15,4,3]
  const target=9, map={}, steps=[]
  const addStep=(cur,found,desc,line)=>steps.push({array:[...arr],current:cur,highlight:found?[found[0],found[1]]:[cur],sorted:found?[found[0],found[1]]:[],pointers:[{index:cur,label:'i'}],extra:{target,map:JSON.stringify(map)},description:desc,codeLine:line})
  addStep(-1,null,'Two Sum: target='+target+'. Use hash map for O(n)',2)
  for(let i=0;i<arr.length;i++){
    const comp=target-arr[i]
    addStep(i,null,'i='+i+': arr[i]='+arr[i]+', complement='+comp,4)
    if(map[comp]!==undefined){addStep(i,[map[comp],i],'Found! indices ['+map[comp]+','+i+'] sum to '+target,5);return steps}
    map[arr[i]]=i
    addStep(i,null,'Store {'+arr[i]+':'+i+'}',6)
  }
  addStep(-1,null,'No pair found',7)
  return steps
}