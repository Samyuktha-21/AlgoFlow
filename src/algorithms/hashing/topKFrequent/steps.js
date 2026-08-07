export function generateSteps(inputArray) {
  /* The LAST number is k; the array is everything before it. */
  const nums=inputArray&&inputArray.length>=2?[...inputArray]:[1,1,1,2,2,3,3,3,4,2]
  const arr=nums.slice(0,-1)
  const distinct=new Set(arr).size
  const k=Math.min(Math.max(1,Math.abs(nums[nums.length-1])),distinct), freq={}, steps=[]
  const addStep=(cur,desc,line)=>steps.push({array:[...arr],current:cur,highlight:[cur>=0?cur:-1].filter(x=>x>=0),sorted:[],pointers:[],extra:{k,freq:JSON.stringify(freq)},description:desc,codeLine:line})
  addStep(-1,'Top K Frequent: count frequencies, extract top k',2)
  for(let i=0;i<arr.length;i++){freq[arr[i]]=(freq[arr[i]]||0)+1;addStep(i,'freq['+arr[i]+']='+freq[arr[i]],4)}
  const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1])
  const topK=sorted.slice(0,k).map(([v])=>parseInt(v))
  addStep(-1,'Top '+k+' frequent: ['+topK.join(',')+'] with freqs ['+topK.map(v=>freq[v]).join(',')+']',6)
  steps[steps.length-1].result = `Top ${k}: ${topK.join(', ')}`
  return steps
}