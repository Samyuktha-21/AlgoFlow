export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=2?[...inputArray]:[1,2,3,4,5,6]
  const n=arr.length
  const prefix=new Array(n).fill(null)
  const computed=new Array(n).fill(false)
  const steps=[]
  const addStep=(cur,desc,line)=>steps.push({array:[...arr],array2:[...prefix],array2Label:'Prefix Sum Array',current:cur,highlight:[cur],sorted:[],pointers:[{index:cur,label:'i'}],description:desc,codeLine:line,extra:{rangeEx:'range[1..3]='+( prefix[3]!==null&&prefix[0]!==null?prefix[3]-prefix[0]:'?')}})
  addStep(0,'Build prefix sum: prefix[i] = arr[0]+...+arr[i]',2)
  prefix[0]=arr[0]; computed[0]=true
  addStep(0,'prefix[0] = arr[0] = '+arr[0],3)
  for(let i=1;i<n;i++){
    addStep(i,'prefix['+i+'] = prefix['+(i-1)+']+arr['+i+'] = '+prefix[i-1]+'+'+arr[i]+'='+(prefix[i-1]+arr[i]),5)
    prefix[i]=prefix[i-1]+arr[i]; computed[i]=true
    addStep(i,'prefix['+i+'] = '+prefix[i],5)
  }
  addStep(-1,'Done! Range sum[l..r] = prefix[r] - prefix[l-1]. Example: [1..3]='+(prefix[3]-prefix[0]),6)
  steps[steps.length-1].result = `Prefix sums: ${prefix.join(', ')}`
  return steps
}