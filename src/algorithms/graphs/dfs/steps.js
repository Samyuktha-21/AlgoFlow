import { computeLayout, DEFAULT_GRAPH } from '../bfs/steps.js'
export function generateSteps(inputNodes=null, inputEdges=null, startNode=0) {
  const nodes = inputNodes || DEFAULT_GRAPH.nodes
  const edges = inputEdges || DEFAULT_GRAPH.edges
  const adj = {}
  nodes.forEach(n=>{adj[n.id]=[]})
  edges.forEach(e=>{adj[e.from].push(e.to);adj[e.to].push(e.from)})
  Object.keys(adj).forEach(k=>adj[k].sort((a,b)=>b-a))
  const positions = computeLayout(nodes, edges)
  const steps = [], visited = new Set(), stack = []
  const addStep=(vis,cur,stk,desc,line)=>steps.push({nodes:nodes.map(n=>({...n,...positions[n.id]})),edges:[...edges],visited:[...vis],current:cur,queue:[...stk],description:desc,codeLine:line})
  addStep([],null,[],'DFS from node '+startNode+' using a stack',2)
  stack.push(startNode)
  addStep([],null,[...stack],'Push start node '+startNode+' onto stack',3)
  while(stack.length>0){
    const node=stack.pop()
    if(visited.has(node)){addStep([...visited],node,[...stack],'Node '+node+' already visited — skip',5);continue}
    visited.add(node)
    addStep([...visited],node,[...stack],'Visit node '+node,6)
    const nbrs=adj[node]||[]
    for(const nb of nbrs){
      if(!visited.has(nb)){stack.push(nb);addStep([...visited],node,[...stack],'Push unvisited neighbor '+nb,9)}
      else addStep([...visited],node,[...stack],'Neighbor '+nb+' already visited',9)
    }
  }
  addStep([...visited],null,[],'DFS complete. Order: '+[...visited].join(' → '),11)
  return steps
}