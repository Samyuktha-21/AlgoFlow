const NODES = [
  {id:4,value:4,left:2,right:6,parent:-1},
  {id:2,value:2,left:1,right:3,parent:4},
  {id:6,value:6,left:5,right:7,parent:4},
  {id:1,value:1,left:null,right:null,parent:2},
  {id:3,value:3,left:null,right:null,parent:2},
  {id:5,value:5,left:null,right:null,parent:6},
  {id:7,value:7,left:null,right:null,parent:6}
]
export function generateSteps(inputArray) {
  const nodes=[...NODES], steps=[], visited=[]
  const map={}; nodes.forEach(n=>{map[n.id]=n})
  const addStep=(cur,desc,line,extra={})=>steps.push({nodes:[...nodes],visited:[...visited],current:cur,highlighted:cur>=0?[cur]:[],traversalOrder:[...visited],description:desc,codeLine:line,extra})
  addStep(-1,'Compute tree height using post-order recursion',2)
  function ht(id){
    if(id===null||id===undefined){addStep(-1,'null node → height = -1',3,{height:-1});return -1}
    const n=map[id]
    addStep(id,'Computing height of node '+n.value,4)
    const lh=ht(n.left)
    const rh=ht(n.right)
    const h=1+Math.max(lh,rh)
    visited.push(id)
    addStep(id,'Node '+n.value+': left='+lh+', right='+rh+' → height='+h,5,{height:h})
    return h
  }
  const totalH=ht(4)
  addStep(-1,'Tree height = '+totalH,6,{height:totalH})
  return steps
}