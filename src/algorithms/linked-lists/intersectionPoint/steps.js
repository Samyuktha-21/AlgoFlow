export function generateSteps(inputArray) {
  // L1: 1->2->3->6->7, L2: 4->5->6->7 (intersect at node id=6)
  const nodes=[{id:1,value:1,next:2},{id:2,value:2,next:3},{id:3,value:3,next:6},{id:4,value:4,next:5},{id:5,value:5,next:6},{id:6,value:6,next:7},{id:7,value:7,next:null}]
  const map={}; nodes.forEach(n=>{map[n.id]=n})
  let p1=1, p2=4, steps=[]
  const addStep=(desc,line)=>steps.push({nodes:[...nodes],pointers:[{nodeId:p1,label:'p1',color:'#60a5fa'},{nodeId:p2,label:'p2',color:'#f87171'}],reversed:[],highlighted:[p1,p2],description:desc,codeLine:line})
  addStep('Find intersection: both pointers walk same total distance',2)
  for(let step=0;step<20;step++){
    if(p1===p2){addStep('p1===p2 at node '+( p1!==null?map[p1].value:'null')+' → '+(p1?'INTERSECTION FOUND!':'No intersection'),5);break}
    addStep('p1='+( p1?map[p1].value:'null')+', p2='+( p2?map[p2].value:'null')+' (not equal, advance)',3)
    p1=p1?map[p1].next:4  // redirect p1 to headB
    p2=p2?map[p2].next:1  // redirect p2 to headA
    if(p1===null&&p2===null){addStep('Both null → no intersection',6);break}
  }
  return steps
}