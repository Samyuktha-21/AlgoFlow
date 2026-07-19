const NODES = [
  {id:4,value:4,left:2,right:6,parent:-1},
  {id:2,value:2,left:1,right:3,parent:4},
  {id:6,value:6,left:5,right:7,parent:4},
  {id:1,value:1,left:null,right:null,parent:2},
  {id:3,value:3,left:null,right:null,parent:2},
  {id:5,value:5,left:null,right:null,parent:6},
  {id:7,value:7,left:null,right:null,parent:6}
]
export function generateSteps() {
  const nodes=[...NODES], steps=[], visited=[]
  const map={}; nodes.forEach(n=>{map[n.id]=n})
  const addStep=(cur,balanced,h,desc,line)=>steps.push({nodes:[...nodes],visited:[...visited],current:cur,highlighted:cur>=0?[cur]:[],traversalOrder:[],description:desc,codeLine:line,extra:{balanced,height:h}})
  addStep(-1,true,-1,'Check if tree is balanced: |height(left) - height(right)| ≤ 1 at every node',2)
  function chk(id){
    if(id===null) return 0
    const n=map[id]
    addStep(id,true,-1,'Check node '+n.value,4)
    const l=chk(n.left), r=chk(n.right)
    const diff=Math.abs(l-r)
    const h=1+Math.max(l,r)
    visited.push(id)
    if(diff>1){addStep(id,false,-1,'Node '+n.value+': |'+l+'-'+r+'|='+diff+' > 1 → UNBALANCED!',8);return -1}
    addStep(id,true,h,'Node '+n.value+': left='+l+', right='+r+' → balanced, height='+h,9)
    return h
  }
  const result=chk(4)
  addStep(-1,result!==-1,result,'Tree is '+(result!==-1?'BALANCED':'UNBALANCED'),10)
  return steps
}