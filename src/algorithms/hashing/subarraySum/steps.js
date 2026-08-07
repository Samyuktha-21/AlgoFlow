export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=3?[...inputArray]:[1,1,1,2,-1,3]
  const k=2, map={0:1}, steps=[]
  let ps=0, count=0
  const addStep=(i,desc,line)=>steps.push({array:[...arr],current:i,highlight:[i>=0?i:-1].filter(x=>x>=0),sorted:[],pointers:[{index:i>=0?i:0,label:'i'}],extra:{prefixSum:ps,k,count,map:JSON.stringify(map)},description:desc,codeLine:line})
  addStep(-1,'Subarray Sum='+k+': use prefix sum hash map',2)
  for(let i=0;i<arr.length;i++){
    ps+=arr[i]
    const need=ps-k
    const found=map[need]||0
    if(found>0) count+=found
    addStep(i,'prefixSum='+ps+'. Need map['+need+']='+found+'. Count='+count,5)
    map[ps]=(map[ps]||0)+1
    addStep(i,'Store prefixSum='+ps+'. map['+ps+']='+map[ps],6)
  }
  addStep(-1,'Total subarrays with sum='+k+': '+count,7)
  steps[steps.length-1].result = `${count} subarrays sum to ${k}`
  return steps
}