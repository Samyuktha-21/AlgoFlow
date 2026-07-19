export function generateSteps() {
  const l1=[{id:0,value:1,next:2},{id:2,value:3,next:5},{id:5,value:5,next:null}]
  const l2=[{id:1,value:2,next:4},{id:4,value:4,next:6},{id:6,value:6,next:null}]
  const nodes=[...l1,...l2], merged=[], steps=[]
  const map={}; nodes.forEach(n=>{map[n.id]=n})
  let p1=0, p2=1
  const addStep=(hl,desc,line)=>steps.push({nodes:[...nodes],pointers:[{nodeId:p1,label:'p1'},{nodeId:p2,label:'p2'}],reversed:[...merged],highlighted:[...hl],description:desc,codeLine:line})
  addStep([],'Merge two sorted lists L1=[1,3,5] and L2=[2,4,6]',2)
  while(p1!==null&&p2!==null){
    const n1=map[p1], n2=map[p2]
    addStep([p1,p2],'Compare p1='+n1.value+' and p2='+n2.value,4)
    if(n1.value<=n2.value){merged.push(p1);addStep([p1],'Take '+n1.value+' from L1. Merged: ['+merged.map(id=>map[id].value).join(',')+']',5);p1=n1.next}
    else{merged.push(p2);addStep([p2],'Take '+n2.value+' from L2. Merged: ['+merged.map(id=>map[id].value).join(',')+']',7);p2=n2.next}
  }
  let rem=p1!==null?p1:p2
  while(rem!==null){merged.push(rem);rem=map[rem].next}
  addStep([...merged],'Merged: ['+merged.map(id=>map[id].value).join(',')+']',9)
  return steps
}