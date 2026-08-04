import { computeLayout } from '../bfs/steps.js'
const NODES=[{id:0,label:'0'},{id:1,label:'1'},{id:2,label:'2'},{id:3,label:'3'},{id:4,label:'4'}]
const ALL_EDGES=[{from:0,to:1,weight:2},{from:0,to:3,weight:6},{from:1,to:2,weight:3},{from:1,to:3,weight:8},{from:1,to:4,weight:5},{from:2,to:4,weight:7},{from:3,to:4,weight:9}]
export function generateSteps(){
  const edges=[...ALL_EDGES].sort((a,b)=>a.weight-b.weight)
  const parent=NODES.map(n=>n.id)
  const positions=computeLayout(NODES,edges)
  const steps=[], mstEdges=[], visited=[]
  function find(x){while(parent[x]!==x)parent[x]=parent[parent[x]],x=parent[x];return x}
  function unite(a,b){const ra=find(a),rb=find(b);if(ra===rb)return false;parent[ra]=rb;return true}
  const addStep=(desc,line)=>steps.push({nodes:NODES.map(n=>({...n,...positions[n.id]})),edges:ALL_EDGES,visited:[...visited],current:-1,queue:[],description:desc,codeLine:line,extra:{mstCost:mstEdges.reduce((s,e)=>s+(e.weight||0),0),mstEdges:mstEdges.length}})
  addStep('Kruskal MST: sort edges by weight, add if no cycle',11)
  addStep('Sorted edges: '+edges.map(e=>e.from+'−'+e.to+'('+e.weight+')').join(', '),12)
  for(const e of edges){
    addStep('Try edge '+e.from+'−'+e.to+' weight='+e.weight,6)
    if(unite(e.from,e.to)){
      mstEdges.push(e); visited.push(e.from); if(!visited.includes(e.to)) visited.push(e.to)
      addStep('Add to MST! '+e.from+'−'+e.to+' (cost='+e.weight+'). Total='+mstEdges.reduce((s,x)=>s+x.weight,0),16)
      if(mstEdges.length===NODES.length-1){addStep('MST complete with '+(NODES.length-1)+' edges!',17);break}
    } else addStep('Skip: would create cycle',7)
  }
  return steps
}