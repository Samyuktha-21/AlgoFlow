import { computeLayout, DEFAULT_GRAPH } from '../bfs/steps.js'
export function generateSteps(inputNodes=null,inputEdges=null){
  const nodes=inputNodes||DEFAULT_GRAPH.nodes, edges=inputEdges||DEFAULT_GRAPH.edges
  const positions=computeLayout(nodes,edges)
  const n=nodes.length, parent=nodes.map(nd=>nd.id), rank=new Array(n).fill(0)
  const steps=[]
  const find=(x)=>{if(parent[x]!==x){parent[x]=find(parent[x])};return parent[x]}
  const addStep=(vis,cur,desc,line)=>steps.push({nodes:nodes.map(nd=>({...nd,...positions[nd.id]})),edges:[...edges],visited:[...vis],current:cur,queue:[],description:desc,codeLine:line})
  addStep([],-1,'Initialize: each node is its own set. parent='+JSON.stringify(parent.slice(0,Math.min(n,12))),5)
  const visited=[]
  for(const e of edges){
    const rx=find(e.from), ry=find(e.to)
    addStep([...visited],e.from,'Union('+e.from+','+e.to+'): find roots → '+rx+' and '+ry,12)
    if(rx===ry){addStep([...visited],e.from,'Same root '+rx+' → CYCLE detected in edge ('+e.from+','+e.to+')',12);continue}
    if(rank[rx]<rank[ry]) parent[rx]=ry; else if(rank[rx]>rank[ry]) parent[ry]=rx; else{parent[ry]=rx;rank[rx]++}
    visited.push(e.from); if(!visited.includes(e.to)) visited.push(e.to)
    addStep([...visited],-1,'Merged sets. parent='+JSON.stringify(parent.slice(0,Math.min(n,12))),16)
  }
  addStep([...visited],-1,'Union-Find operations complete',17)
  return steps
}