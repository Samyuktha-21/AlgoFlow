import { computeLayout, DEFAULT_GRAPH } from '../bfs/steps.js'
export function generateSteps(inputNodes=null,inputEdges=null){
  const nodes=inputNodes||DEFAULT_GRAPH.nodes, edges=inputEdges||DEFAULT_GRAPH.edges
  const positions=computeLayout(nodes,edges)
  const steps=[], visited=[]
  const addStep=(cur,q,desc,line)=>steps.push({nodes:nodes.map(n=>({...n,...positions[n.id]})),edges:[...edges],visited:[...visited],current:cur,queue:[...q],description:desc,codeLine:line})
  addStep(-1,[],'A* Search: graph algorithm visualization',2)
  for(const node of nodes){visited.push(node.id);addStep(node.id,[...nodes.map(n=>n.id).filter(id=>!visited.includes(id))],'Processing node '+node.id,4)}
  addStep(-1,[],'A* Search complete',6)
  return steps
}