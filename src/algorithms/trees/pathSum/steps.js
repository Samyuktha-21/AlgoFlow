const NODES = [{id:4,value:4,left:2,right:6,parent:-1},{id:2,value:2,left:1,right:3,parent:4},{id:6,value:6,left:5,right:7,parent:4},{id:1,value:1,left:null,right:null,parent:2},{id:3,value:3,left:null,right:null,parent:2},{id:5,value:5,left:null,right:null,parent:6},{id:7,value:7,left:null,right:null,parent:6}]
export function generateSteps(inputArray) {
  const target=10, nodes=[...NODES], steps=[], visited=[]
  const map={}; nodes.forEach(n=>{map[n.id]=n})
  const addStep=(cur,sum,desc,line)=>steps.push({nodes:[...nodes],visited:[...visited],current:cur,highlighted:cur>=0?[cur]:[],traversalOrder:[],description:desc,codeLine:line,extra:{target,remainingSum:sum}})
  addStep(-1,target,'Path Sum: find root-to-leaf path summing to '+target,2)
  function dfs(id,rem){
    if(id===null) return false
    const n=map[id]
    visited.push(id)
    addStep(id,rem-n.value,'Visit '+n.value+'. Remaining='+rem+'-'+n.value+'='+(rem-n.value),4)
    if(n.left===null&&n.right===null){
      if(rem===n.value){addStep(id,0,'Leaf! Remaining='+n.value+'-'+n.value+'=0 → PATH FOUND!',5);return true}
      addStep(id,rem-n.value,'Leaf but sum mismatch → backtrack',6); return false
    }
    const found=dfs(n.left,rem-n.value)||dfs(n.right,rem-n.value)
    if(!found) addStep(id,rem,'No path through '+n.value+', backtrack',7)
    return found
  }
  const result=dfs(4,target)
  addStep(-1,0,'Path sum '+target+(result?' EXISTS':' does NOT exist'),8)
  return steps
}