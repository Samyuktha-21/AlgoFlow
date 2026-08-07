export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=4?[...inputArray]:[1,1,1,2,2,3,3,3,4]
  const k=2, freq={}, steps=[]
  const addStep=(cur,desc,line)=>steps.push({array:[...arr],current:cur,highlight:[cur>=0?cur:-1].filter(x=>x>=0),sorted:[],pointers:[],extra:{k,freq:JSON.stringify(freq)},description:desc,codeLine:line})
  addStep(-1,'Top K Frequent: count frequencies, extract top k',2)
  for(let i=0;i<arr.length;i++){freq[arr[i]]=(freq[arr[i]]||0)+1;addStep(i,'freq['+arr[i]+']='+freq[arr[i]],4)}
  const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1])
  const topK=sorted.slice(0,k).map(([v])=>parseInt(v))
  addStep(-1,'Top '+k+' frequent: ['+topK.join(',')+'] with freqs ['+topK.map(v=>freq[v]).join(',')+']',6)
  steps[steps.length-1].result = `Top ${k}: ${topK.join(', ')}`
  return steps
}