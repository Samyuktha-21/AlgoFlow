export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=2?[...inputArray]:[2,7,11,15,4,3]
  const target=9, map={}, steps=[]
  const addStep=(cur,found,desc,line)=>steps.push({array:[...arr],current:cur,highlight:found?[found[0],found[1]]:[cur],sorted:found?[found[0],found[1]]:[],pointers:[{index:cur,label:'i'}],extra:{target,mapSize:Object.keys(map).length},description:desc,codeLine:line})
  addStep(-1,null,'Two Sum (hash): find indices summing to '+target,2)
  for(let i=0;i<arr.length;i++){
    const comp=target-arr[i]
    addStep(i,null,'i='+i+', arr[i]='+arr[i]+', complement='+target+'-'+arr[i]+'='+comp,4)
    if(map[comp]!==undefined){addStep(i,[map[comp],i],'Found! arr['+map[comp]+']+arr['+i+'] = '+comp+'+'+arr[i]+'='+target,5);steps[steps.length-1].result='Indices ['+map[comp]+', '+i+']';return steps}
    map[arr[i]]=i
    addStep(i,null,'Not found. Store {'+arr[i]+':'+i+'} in map',6)
  }
  addStep(-1,null,'No pair found',8)
  steps[steps.length-1].result = 'No pair sums to '+target
  return steps
}