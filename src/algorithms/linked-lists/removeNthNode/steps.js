const NODES = [{id:0,value:1,next:1},{id:1,value:2,next:2},{id:2,value:3,next:3},{id:3,value:4,next:4},{id:4,value:5,next:null}]
export function generateSteps() {
  const nodes=JSON.parse(JSON.stringify(NODES)), n=2
  const map={}; nodes.forEach(nd=>{map[nd.id]=nd})
  const steps=[], removed=[]
  let fast=0, slow=0
  const addStep=(desc,line)=>steps.push({nodes:nodes.map(nd=>({...nd})),pointers:[{nodeId:slow,label:'slow'},{nodeId:fast,label:'fast'}],reversed:[],highlighted:[slow,fast],description:desc,codeLine:line,extra:{n}})
  addStep('Remove '+n+'th from end. Advance fast by n='+n+' steps',2)
  for(let i=0;i<n;i++){fast=map[fast].next;addStep('Fast advanced to '+( fast!==null?map[fast].value:'null'),3)}
  addStep('Now move both until fast reaches end',5)
  while(map[fast].next!==null){slow=map[slow].next;fast=map[fast].next;addStep('slow='+map[slow].value+', fast='+map[fast].value,6)}
  const target=map[slow].next
  addStep('Remove node '+map[target].value+' ('+n+'th from end)',8)
  removed.push(target)
  map[slow].next=map[target].next
  addStep('Done! Node '+map[target].value+' removed. List: ['+nodes.filter(nd=>!removed.includes(nd.id)).map(nd=>nd.value).join(',')+']',9)
  return steps
}