export function generateSteps(inputArray) {
  const s='anagram', t='nagaram'
  const freq=new Array(26).fill(0)
  const arr=s.split('').map(c=>c.charCodeAt(0)-96)
  const arr2=t.split('').map(c=>c.charCodeAt(0)-96)
  const steps=[]
  const addStep=(i,which,desc,line)=>steps.push({array:which===1?arr:arr2,current:i,highlight:[i],sorted:[],pointers:[{index:i,label:'i'}],description:desc,codeLine:line,extra:{s,t,match:freq.every(x=>x===0)?'YES':'NO'}})
  addStep(-1,'Anagram check: "'+s+'" vs "'+t+'"',2)
  for(let i=0;i<s.length;i++){freq[arr[i]-1]++;addStep(i,1,'Count '+s[i]+': freq['+s[i]+']='+freq[arr[i]-1],4)}
  for(let i=0;i<t.length;i++){freq[arr2[i]-1]--;addStep(i,2,'Subtract '+t[i]+': freq['+t[i]+']='+freq[arr2[i]-1],5)}
  const isAnagram=freq.every(x=>x===0)
  addStep(-1,1,'"'+s+'" and "'+t+'" are '+(isAnagram?'ANAGRAMS':'NOT anagrams'),6)
  return steps
}