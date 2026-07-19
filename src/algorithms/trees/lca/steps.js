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
  const p=1, q=3
  const nodes=[...NODES], steps=[], visited=[]
  const map={}; nodes.forEach(n=>{map[n.id]=n})
  const addStep=(cur,desc,line)=>steps.push({nodes:[...nodes],visited:[...visited],current:cur,highlighted:cur>=0?[cur,p,q].filter(x=>x>=0):[p,q],traversalOrder:[...visited],description:desc,codeLine:line,extra:{p,q}})
  addStep(-1,'Find LCA of nodes '+p+' and '+q,2)
  function lcaFn(id){
    if(id===null){addStep(-1,'null → return null',3);return null}
    const n=map[id]
    if(n.id===p||n.id===q){visited.push(id);addStep(id,'Found target node '+n.value+' → return it',3);return id}
    addStep(id,'Search at node '+n.value,4)
    const l=lcaFn(n.left), r=lcaFn(n.right)
    if(l!==null&&r!==null){visited.push(id);addStep(id,'Both children found → node '+n.value+' is LCA!',6);return id}
    const res=l!==null?l:r
    if(res!==null){visited.push(id);addStep(id,'Propagate result '+res+' up from node '+n.value,7)}
    return res
  }
  const result=lcaFn(4)
  addStep(result,'LCA of '+p+' and '+q+' = node '+result,8)
  return steps
}