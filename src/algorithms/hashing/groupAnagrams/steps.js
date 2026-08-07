/* Group words that are anagrams of each other. The whole problem is choosing
   a key that is identical for anagrams and different for everything else —
   sorting each word's letters does exactly that, so one pass and a hash map
   is enough. Comparing every pair would be quadratic.

   Input: words separated by commas or spaces. */
function toWords(input) {
  const raw = Array.isArray(input) ? input.join(',') : input
  const text = typeof raw === 'string' ? raw : ''
  const words = text.split(/[,\s]+/).map(w => w.trim().toLowerCase()).filter(Boolean)
  return (words.length ? words : ['eat','tea','tan','ate','nat','bat']).slice(0, 10)
}

export function generateSteps(input) {
  const words=toWords(input)
  const arr=[...words]
  const map={}, groups={}, steps=[]
  const addStep=(cur,key,desc,line)=>steps.push({array:arr,current:cur,highlight:[cur],stack:Object.keys(map),result:[],extra:{key,groups:Object.values(groups).length},description:desc,codeLine:line})
  addStep(-1,'','Group anagrams by using the sorted letters of each word as a hash key — anagrams sort to the same string, nothing else does.',2)
  words.forEach((w,i)=>{
    const key=w.split('').sort().join('')
    addStep(i,key,'Word "'+w+'" → sorted key "'+key+'"',4)
    if(!groups[key]) groups[key]=[]
    groups[key].push(w)
    map[key]=(map[key]||0)+1
    addStep(i,key,'Added "'+w+'" to group "'+key+'". Groups so far: '+JSON.stringify(groups),5)
  })
  const summary=Object.values(groups).map(v=>'['+v.join(', ')+']').join(' ')
  addStep(-1,'','Grouped into '+Object.keys(groups).length+' set(s): '+summary,7)
  steps[steps.length-1].result=summary
  return steps
}