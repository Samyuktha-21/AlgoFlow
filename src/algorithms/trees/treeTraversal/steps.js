// Default BST nodes for demo
const DEFAULT_NODES=[
  {id:4,value:4,left:2,right:6,parent:-1},
  {id:2,value:2,left:1,right:3,parent:4},
  {id:6,value:6,left:5,right:7,parent:4},
  {id:1,value:1,left:null,right:null,parent:2},
  {id:3,value:3,left:null,right:null,parent:2},
  {id:5,value:5,left:null,right:null,parent:6},
  {id:7,value:7,left:null,right:null,parent:6},
]
export function generateSteps(inputArray) {
  const nodes=[...DEFAULT_NODES]
  const steps=[], visited=[], order=[]
  const addStep=(cur,vis,desc,line)=>steps.push({nodes:[...nodes],visited:[...vis],current:cur,highlighted:[cur],traversalOrder:[...order],description:desc,codeLine:line})
  const nodeMap={}; nodes.forEach(n=>{nodeMap[n.id]=n})
  addStep(-1,[],'Inorder traversal: Left → Root → Right (gives sorted order for BST)',2)
  function inorder(id){
    if(id===null||id===undefined) return
    const n=nodeMap[id]; if(!n) return
    inorder(n.left)
    visited.push(id); order.push(n.value)
    addStep(id,[...visited],'Visit node '+n.value+' | Order so far: ['+order.join(',')+']',4)
    inorder(n.right)
  }
  inorder(4)
  addStep(-1,[...visited],'Inorder complete: ['+order.join(',')+'] — sorted ascending for BST',6)
  return steps
}