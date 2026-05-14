export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=2?[...inputArray]:[1,2,2,3,3,3,1,4,2]
  const freq={}, steps=[]
  const addStep=(i,desc,line)=>steps.push({array:[...arr],current:i,highlight:[i],sorted:[],pointers:[{index:i,label:'i'}],extra:{freq:JSON.stringify(freq)},description:desc,codeLine:line})
  addStep(-1,'Count occurrences using a frequency map',2)
  for(let i=0;i<arr.length;i++){
    freq[arr[i]]=(freq[arr[i]]||0)+1
    addStep(i,'arr['+i+']='+arr[i]+' → freq['+arr[i]+']='+freq[arr[i]],4)
  }
  addStep(-1,'Frequency: '+Object.entries(freq).map(([k,v])=>k+'→'+v).join(', '),5)
  return steps
}