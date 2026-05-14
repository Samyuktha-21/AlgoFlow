export function generateSteps(inputArray) {
  const s='hello', arr=s.split('').map(c=>c.charCodeAt(0)-96)
  const a=[...arr], n=a.length, steps=[]
  let l=0, r=n-1
  const chars=s.split('')
  const addStep=(hl,desc,line)=>steps.push({array:[...a],current:l,pointers:[{index:l,label:'L'},{index:r,label:'R'}],highlight:[...hl],sorted:[],description:desc,codeLine:line,extra:{word:chars.join('')}})
  addStep([],'Reverse "'+s+'": swap from both ends',2)
  while(l<r){
    addStep([l,r],'Swap "'+chars[l]+'" at ['+l+'] and "'+chars[r]+'" at ['+r+']',4)
    ;[a[l],a[r]]=[a[r],a[l]];[chars[l],chars[r]]=[chars[r],chars[l]]
    addStep([l,r],'After swap: "'+chars.join('"'),4)
    l++; r--
  }
  addStep([],'Reversed: "'+chars.join('')+'"',6)
  return steps
}