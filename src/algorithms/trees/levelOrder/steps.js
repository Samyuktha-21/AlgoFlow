const NODES = [
  {id:4,value:4,left:2,right:6,parent:-1},
  {id:2,value:2,left:1,right:3,parent:4},
  {id:6,value:6,left:5,right:7,parent:4},
  {id:1,value:1,left:null,right:null,parent:2},
  {id:3,value:3,left:null,right:null,parent:2},
  {id:5,value:5,left:null,right:null,parent:6},
  {id:7,value:7,left:null,right:null,parent:6}
]
export function generateSteps() {
  const nodes=[...NODES], steps=[], visited=[], order=[]
  const map={}; nodes.forEach(n=>{map[n.id]=n})
  const addStep=(cur,q,desc,line)=>steps.push({nodes:[...nodes],visited:[...visited],current:cur,highlighted:cur>=0?[cur]:[],traversalOrder:[...order],description:desc,codeLine:line,extra:{queue:q.slice()}})
  addStep(-1,[],'Level Order: visit all nodes level by level using a queue',2)
  const queue=[nodes[0].id]
  addStep(-1,[...queue],'Enqueue root: '+nodes[0].value,3)
  while(queue.length>0){
    const id=queue.shift()
    const n=map[id]
    visited.push(id); order.push(n.value)
    addStep(id,[...queue],'Visit node '+n.value+' | Level order: ['+order.join(',')+']',6)
    if(n.left!=null){queue.push(n.left);addStep(id,[...queue],'Enqueue left child '+map[n.left].value,8)}
    if(n.right!=null){queue.push(n.right);addStep(id,[...queue],'Enqueue right child '+map[n.right].value,9)}
  }
  addStep(-1,[],'Level order complete: ['+order.join(' → ')+']',11)
  return steps
}