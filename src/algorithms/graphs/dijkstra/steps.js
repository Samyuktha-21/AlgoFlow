import { computeLayout } from '../bfs/steps.js'
const DEFAULT_WEIGHTED = {
  nodes:[{id:0,label:'0'},{id:1,label:'1'},{id:2,label:'2'},{id:3,label:'3'},{id:4,label:'4'},{id:5,label:'5'}],
  edges:[{from:0,to:1,weight:4},{from:0,to:2,weight:1},{from:2,to:1,weight:2},{from:1,to:3,weight:1},{from:2,to:3,weight:5},{from:3,to:4,weight:3},{from:4,to:5,weight:2}]
}
export function generateSteps(inputNodes=null,inputEdges=null,startNode=0){
  const nodes=inputNodes||DEFAULT_WEIGHTED.nodes, edges=inputEdges||DEFAULT_WEIGHTED.edges
  const positions=computeLayout(nodes,edges)
  const adj={}; nodes.forEach(n=>{adj[n.id]=[]});
  edges.forEach(e=>{adj[e.from].push({to:e.to,w:e.weight||1});adj[e.to].push({to:e.from,w:e.weight||1})})
  const dist={}, visited=new Set(), steps=[]
  nodes.forEach(n=>{dist[n.id]=n.id===startNode?0:Infinity})
  /* Same reasoning as bellmanFord: show the glyph, not the JS value. */
  const show=v=>(v===Infinity?'∞':v)
  const makeStep=(cur,queue,desc,line)=>steps.push({nodes:nodes.map(n=>({...n,...positions[n.id]})),edges:[...edges],visited:[...visited],current:cur,queue:[...queue],distances:{...dist},description:desc,codeLine:line})
  const pq=[[0,startNode]]
  makeStep(null,[startNode],'Initialize: dist['+startNode+']=0, all others=∞',3)
  while(pq.length>0){
    pq.sort((a,b)=>a[0]-b[0])
    const [du,u]=pq.shift()
    if(visited.has(u)){makeStep(u,[...pq.map(x=>x[1])],'Node '+u+' already fully processed — skip',14);continue}
    visited.add(u)
    makeStep(u,[...pq.map(x=>x[1])],'Visit node '+u+' with dist='+du,15)
    for(const {to:v,w} of adj[u]||[]){
      const nd=du+w
      makeStep(u,[...pq.map(x=>x[1])],'Check: can we reach node '+v+' faster via '+u+'? Current best: '+show(dist[v])+'. New path via '+u+': '+du+'+'+w+'='+nd+(nd<dist[v]?' ✅ '+nd+'<'+show(dist[v])+' — update!':' ✗ no improvement'),17)
      if(nd<dist[v]){dist[v]=nd;pq.push([nd,v]);makeStep(u,[...pq.map(x=>x[1])],'Update dist['+v+']='+nd,18)}
    }
  }
  /* An unreachable node keeps Infinity — real, but it belongs on screen as the
     glyph, and a disconnected graph makes that the common case. */
  const unreached=nodes.filter(n=>dist[n.id]===Infinity).length
  makeStep(null,[],'Dijkstra complete. Shortest distances: '+nodes.map(n=>n.id+'→'+show(dist[n.id])).join(', ')
    +(unreached?` — ${unreached} node${unreached>1?'s are':' is'} unreachable from the start.`:''),23)
  return steps
}