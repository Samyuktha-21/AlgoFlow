import { computeLayout } from '../bfs/steps.js'
const CYCLE_NODES=[{id:0,label:'0'},{id:1,label:'1'},{id:2,label:'2'},{id:3,label:'3'},{id:4,label:'4'}]
const CYCLE_EDGES=[{from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:1},{from:0,to:4}]
export function generateSteps(){
  const nodes=CYCLE_NODES, edges=CYCLE_EDGES
  const adj={}; nodes.forEach(n=>{adj[n.id]=[]})
  edges.forEach(e=>adj[e.from].push(e.to))
  const positions=computeLayout(nodes,edges)
  const steps=[], visited=new Set(), recStack=new Set()
  const addStep=(cur,desc,line)=>steps.push({nodes:nodes.map(n=>({...n,...positions[n.id]})),edges:[...edges],visited:[...visited],current:cur,queue:[...recStack],description:desc,codeLine:line,extra:{cycleFound:false}})
  addStep(-1,'Cycle Detection: track recursion stack for back edges',2)
  let cycleFound=false
  function dfs(v){
    visited.add(v); recStack.add(v)
    addStep(v,'Visit node '+v+'. RecStack: ['+[...recStack].join(',')+']',5)
    for(const u of adj[v]){
      if(!visited.has(u)){
        addStep(u,'Explore unvisited neighbor '+u,8)
        if(dfs(u)){cycleFound=true;return true}
      } else if(recStack.has(u)){
        steps.push({...steps[steps.length-1],extra:{cycleFound:true}})
        addStep(v,'CYCLE DETECTED: edge '+v+'→'+u+' is a back edge! Node '+u+' in recursion stack',9)
        cycleFound=true; return true
      } else addStep(v,'Node '+u+' visited but not in stack — not a cycle',10)
    }
    recStack.delete(v)
    addStep(v,'Backtrack from '+v+'. RecStack: ['+[...recStack].join(',')+']',12)
    return false
  }
  for(const n of nodes) if(!visited.has(n.id)) dfs(n.id)
  addStep(-1,cycleFound?'CYCLE EXISTS in this graph!':'No cycle detected',14)
  return steps
}