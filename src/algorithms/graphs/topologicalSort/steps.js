import { computeLayout } from '../bfs/steps.js'
const DEFAULT_DAG = {
  nodes:[{id:0,label:'0'},{id:1,label:'1'},{id:2,label:'2'},{id:3,label:'3'},{id:4,label:'4'},{id:5,label:'5'}],
  edges:[{from:5,to:2},{from:5,to:0},{from:4,to:0},{from:4,to:1},{from:2,to:3},{from:3,to:1}]
}
export function generateSteps(inputNodes=null,inputEdges=null){
  const nodes=inputNodes||DEFAULT_DAG.nodes, edges=inputEdges||DEFAULT_DAG.edges
  const positions=computeLayout(nodes,edges)
  const adj={},inDeg={};
  nodes.forEach(n=>{adj[n.id]=[];inDeg[n.id]=0})
  edges.forEach(e=>{adj[e.from].push(e.to);inDeg[e.to]++})
  const steps=[], queue=[], visited=[], result=[]
  const addStep=(cur,q,desc,line)=>steps.push({nodes:nodes.map(n=>({...n,...positions[n.id]})),edges:[...edges],visited:[...visited],current:cur,queue:[...q],description:desc,codeLine:line})
  addStep(null,[],'Compute in-degrees: '+nodes.map(n=>n.id+'='+inDeg[n.id]).join(', '),2)
  nodes.forEach(n=>{if(inDeg[n.id]===0){queue.push(n.id)}})
  addStep(null,[...queue],'Enqueue zero in-degree nodes: ['+queue.join(',')+']',5)
  while(queue.length>0){
    const u=queue.shift()
    visited.push(u); result.push(u)
    addStep(u,[...queue],'Process '+u+'. Order so far: ['+result.join(',')+']',8)
    for(const v of adj[u]){
      inDeg[v]--
      addStep(u,[...queue],'Decrease in-degree['+v+']='+inDeg[v],10)
      if(inDeg[v]===0){queue.push(v);addStep(u,[...queue],'in-degree['+v+']=0 → enqueue',11)}
    }
  }
  addStep(null,[],'Topological order: '+result.join(' → '),13)
  return steps
}