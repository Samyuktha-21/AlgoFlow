import { computeLayout } from '../bfs/steps.js'
const BI_NODES=[{id:0,label:'0'},{id:1,label:'1'},{id:2,label:'2'},{id:3,label:'3'},{id:4,label:'4'},{id:5,label:'5'}]
const BI_EDGES=[{from:0,to:1},{from:0,to:3},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:1,to:4}]
export function generateSteps(){
  const nodes=BI_NODES, edges=BI_EDGES
  const adj={}; nodes.forEach(n=>{adj[n.id]=[]})
  edges.forEach(e=>{adj[e.from].push(e.to);adj[e.to].push(e.from)})
  const positions=computeLayout(nodes,edges)
  const color={}, steps=[], visited=[]
  const addStep=(cur,q,desc,line)=>steps.push({nodes:nodes.map(n=>({...n,...positions[n.id]})),edges:[...edges],visited:[...visited],current:cur,queue:[...q],description:desc,codeLine:line,extra:{bipartite:true}})
  addStep(-1,[],'2-color graph: adjacent nodes must have different colors (0=blue, 1=red)',2)
  color[0]=0; const queue=[0]
  addStep(0,[...queue],'Color node 0 = blue (group 0)',3)
  while(queue.length>0){
    const u=queue.shift()
    visited.push(u)
    addStep(u,[...queue],'Process node '+u+' (color '+color[u]+')',5)
    for(const v of adj[u]){
      if(color[v]===undefined){color[v]=1-color[u];queue.push(v);addStep(v,[...queue],'Color node '+v+' = '+(color[v]===0?'blue':'red')+' (opposite of '+u+')',7)}
      else if(color[v]===color[u]){addStep(u,[...queue],'CONFLICT! Nodes '+u+' and '+v+' are adjacent with same color → NOT BIPARTITE',9);return steps}
    }
  }
  addStep(-1,[],'Graph IS bipartite! Blue set: ['+nodes.filter(n=>color[n.id]===0).map(n=>n.id).join(',')+'], Red set: ['+nodes.filter(n=>color[n.id]===1).map(n=>n.id).join(',')+']',11)
  return steps
}