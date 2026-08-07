import { computeLayout, DEFAULT_GRAPH } from '../bfs/steps.js'
export function generateSteps(inputNodes=null,inputEdges=null){
  const nodes=inputNodes||DEFAULT_GRAPH.nodes, edges=inputEdges||DEFAULT_GRAPH.edges
  const positions=computeLayout(nodes,edges)
  /* parent/rank are keyed by node ID, not by position. They used to be plain
     arrays indexed with e.from — fine while ids happened to be 0..n-1, but
     "5-9, 9-12" is a legal edge list and parent[5] was simply undefined, so
     every root printed as "undefined". */
  const n=nodes.length
  const parent=new Map(nodes.map(nd=>[nd.id,nd.id])), rank=new Map(nodes.map(nd=>[nd.id,0]))
  const steps=[]
  const find=(x)=>{if(parent.get(x)!==x){parent.set(x,find(parent.get(x)))};return parent.get(x)}
  const parentView=()=>nodes.slice(0,Math.min(n,12)).map(nd=>nd.id+'→'+parent.get(nd.id)).join(', ')
  const addStep=(vis,cur,desc,line)=>steps.push({nodes:nodes.map(nd=>({...nd,...positions[nd.id]})),edges:[...edges],visited:[...vis],current:cur,queue:[],description:desc,codeLine:line})
  addStep([],-1,'Initialize: each node is its own set. parent: '+parentView(),5)
  const visited=[]
  for(const e of edges){
    const rx=find(e.from), ry=find(e.to)
    addStep([...visited],e.from,'Union('+e.from+','+e.to+'): find roots → '+rx+' and '+ry,12)
    if(rx===ry){addStep([...visited],e.from,'Same root '+rx+' → CYCLE detected in edge ('+e.from+','+e.to+')',12);continue}
    if(rank.get(rx)<rank.get(ry)) parent.set(rx,ry); else if(rank.get(rx)>rank.get(ry)) parent.set(ry,rx); else{parent.set(ry,rx);rank.set(rx,rank.get(rx)+1)}
    visited.push(e.from); if(!visited.includes(e.to)) visited.push(e.to)
    addStep([...visited],-1,'Merged sets. parent: '+parentView(),16)
  }
  addStep([...visited],-1,'Union-Find operations complete',17)
  return steps
}