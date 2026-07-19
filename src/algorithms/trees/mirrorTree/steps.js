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
  const nodes=JSON.parse(JSON.stringify(NODES))
  const map={}; nodes.forEach(n=>{map[n.id]=n})
  const steps=[], visited=[]
  const addStep=(cur,desc,line)=>steps.push({nodes:nodes.map(n=>({...n})),visited:[...visited],current:cur,highlighted:cur>=0?[cur]:[],traversalOrder:[],description:desc,codeLine:line})
  addStep(-1,'Mirror tree: swap left↔right children at every node',2)
  function doMirror(id){
    if(id===null) return
    const n=map[id]
    addStep(id,'Visit node '+n.value+', swapping children',4)
    const tmp=n.left; n.left=n.right; n.right=tmp
    addStep(id,'Swapped: left='+n.left+', right='+n.right,5)
    visited.push(id)
    doMirror(n.left)
    doMirror(n.right)
  }
  doMirror(4)
  addStep(-1,'Mirror complete! Tree is now inverted',7)
  return steps
}