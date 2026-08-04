import { computeLayout } from '../bfs/steps.js'
export function generateSteps(inputNodes=null,inputEdges=null,src=0){
  const nodes=inputNodes||[{id:0,label:'A'},{id:1,label:'B'},{id:2,label:'C'},{id:3,label:'D'},{id:4,label:'E'}]
  const edges=inputEdges||[{from:0,to:1,weight:6},{from:0,to:2,weight:7},{from:1,to:3,weight:5},{from:2,to:1,weight:-4},{from:3,to:4,weight:-3},{from:4,to:1,weight:2}]
  const V=nodes.length, dist={}, positions=computeLayout(nodes,edges)
  nodes.forEach(n=>{dist[n.id]=n.id===src?0:Infinity})
  const steps=[], visited=[]
  const addStep=(vis,desc,line)=>steps.push({nodes:nodes.map(n=>({...n,...positions[n.id]})),edges:[...edges],visited:[...vis],current:-1,queue:[],distances:{...dist},description:desc,codeLine:line})
  addStep([],'Bellman-Ford: relax all edges V-1 = '+(V-1)+' times',3)
  for(let i=0;i<V-1;i++){
    addStep([...visited],'Pass '+(i+1)+' of '+(V-1)+': relax all edges',7)
    for(const e of edges){
      if(dist[e.from]!==Infinity){
        const nd=dist[e.from]+(e.weight||1)
        addStep([...visited],'Relax '+e.from+'→'+e.to+': '+dist[e.from]+'+'+(e.weight||1)+'='+nd+' vs dist['+e.to+']='+dist[e.to],10)
        if(nd<dist[e.to]){dist[e.to]=nd;if(!visited.includes(e.to))visited.push(e.to);addStep([...visited],'Update dist['+e.to+']='+nd,11)}
      }
    }
  }
  addStep([...visited],'Bellman-Ford complete. Distances: '+nodes.map(n=>n.id+'='+dist[n.id]).join(', '),17)
  return steps
}