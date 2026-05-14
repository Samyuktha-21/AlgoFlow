const DEMO_INSERTS=[5,3,7,1,4,6,8,2]
export function generateSteps(inputArray) {
  const vals=inputArray&&inputArray.length>=2?[...inputArray]:DEMO_INSERTS
  let nodes=[], steps=[], nodeId=0
  const nodeMap={}, visited=[]
  const addStep=(cur,vis,desc,line)=>steps.push({nodes:nodes.map(n=>({...n})),visited:[...vis],current:cur,highlighted:cur>=0?[cur]:[],traversalOrder:[...visited],description:desc,codeLine:line})
  function insert(val,parentId,side){
    addStep(-1,[],'Inserting '+val+' into BST',2)
    let curr=0, par=-1, side2=null
    while(curr<nodes.length){
      const n=nodes[curr]
      addStep(n.id,visited,'Compare '+val+' with node '+n.value+(val<n.value?' → go left':' → go right'),6)
      if(val===n.value){addStep(n.id,visited,'Duplicate '+val+' — skip',7);return}
      par=curr; side2=val<n.value?'left':'right'
      const childId=val<n.value?n.left:n.right
      if(childId===null) break
      curr=nodes.findIndex(x=>x.id===childId)
    }
    const newNode={id:nodeId++,value:val,left:null,right:null,parent:par>=0?nodes[par].id:-1}
    if(par>=0){if(side2==='left')nodes[par].left=newNode.id;else nodes[par].right=newNode.id}
    nodes.push(newNode)
    addStep(newNode.id,visited,'Inserted '+val+' as '+(par>=0?side2+' child of '+nodes[par].value:'root'),9)
  }
  addStep(-1,[],'Build BST by inserting: ['+vals.join(',')+']',2)
  for(const v of vals) insert(v,-1,null)
  addStep(-1,[],'BST complete. Root='+vals[0]+'. Inorder will give sorted order.',10)
  return steps
}