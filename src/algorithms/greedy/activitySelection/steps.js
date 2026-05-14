export function generateSteps(inputArray) {
  const defaultActs=[{s:1,e:2},{s:3,e:4},{s:0,e:6},{s:5,e:7},{s:8,e:9},{s:5,e:9}]
  const acts=defaultActs.map((a,i)=>({...a,id:i}))
  acts.sort((a,b)=>a.e-b.e)
  const arr=acts.map(a=>a.e), steps=[], selected=[], sorted=[]
  const addStep=(cur,desc,line)=>steps.push({array:[...arr],current:cur,highlight:[...selected.map(i=>acts.findIndex(a=>a.id===i))],sorted:[...sorted],pointers:[],extra:{selected:selected.join(','),lastEnd:selected.length?acts.find(a=>a.id===selected[selected.length-1]).e:-1},description:desc,codeLine:line})
  addStep(-1,'Activities sorted by finish time: '+acts.map(a=>'['+a.s+','+a.e+']').join(' '),2)
  let lastEnd=-1
  acts.forEach((act,i)=>{
    addStep(i,'Check activity ['+act.s+','+act.e+']: start '+act.s+(act.s>=lastEnd?' >= ':' < ')+lastEnd,5)
    if(act.s>=lastEnd){selected.push(act.id);lastEnd=act.e;sorted.push(i);addStep(i,'Select! New lastEnd='+lastEnd,7)}
    else addStep(i,'Skip — overlaps with last selected activity',9)
  })
  addStep(-1,'Max activities: '+selected.length+'. Selected: '+acts.filter(a=>selected.includes(a.id)).map(a=>'['+a.s+','+a.e+']').join(' '),11)
  return steps
}