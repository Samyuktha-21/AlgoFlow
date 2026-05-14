export function generateSteps(inputArray) {
  const words=['eat','tea','tan','ate','nat','bat']
  const arr=words.map(w=>w.charCodeAt(0))
  const map={}, groups={}, steps=[]
  const addStep=(cur,key,desc,line)=>steps.push({array:arr,current:cur,highlight:[cur],stack:Object.keys(map),result:[],extra:{key,groups:Object.values(groups).length},description:desc,codeLine:line})
  addStep(-1,'','Group Anagrams: use sorted string as hash key',2)
  words.forEach((w,i)=>{
    const key=w.split('').sort().join('')
    addStep(i,key,'Word "'+w+'" → sorted key "'+key+'"',4)
    if(!groups[key]) groups[key]=[]
    groups[key].push(w)
    map[key]=(map[key]||0)+1
    addStep(i,key,'Added "'+w+'" to group "'+key+'". Groups so far: '+JSON.stringify(groups),5)
  })
  addStep(-1,'','Grouped: '+Object.entries(groups).map(([k,v])=>k+'=['+v.join(',')+']').join(', '),7)
  return steps
}