const NODES = [{id:0,value:1,next:1},{id:1,value:2,next:2},{id:2,value:3,next:3},{id:3,value:4,next:4},{id:4,value:5,next:null}]
export function generateSteps(inputArray) {
  const nodes=[...NODES], steps=[]
  const map={}; nodes.forEach(n=>{map[n.id]=n})
  let slow=0, fast=0
  const addStep=(desc,line)=>steps.push({nodes:[...nodes],pointers:[{nodeId:slow,label:'slow',color:'#4ade80'},{nodeId:fast,label:'fast',color:'#f97316'}],reversed:[],highlighted:[slow,fast],description:desc,codeLine:line})
  addStep('Find Middle: slow moves 1 step, fast moves 2 steps',2)
  while(fast!==null&&fast!==undefined&&map[fast].next!==null){
    addStep('slow='+map[slow].value+', fast='+map[fast].value,4)
    slow=map[slow].next
    const fn=map[fast].next
    fast=fn!==null?map[fn].next:null
    addStep('After step: slow→'+( slow!==null?map[slow].value:'null')+', fast→'+(fast!==null?map[fast].value:'null'),5)
  }
  addStep('Middle node found: value='+map[slow].value,7)
  return steps
}