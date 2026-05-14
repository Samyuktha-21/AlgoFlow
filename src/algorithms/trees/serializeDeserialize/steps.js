const NODES=[{id:1,value:1,left:2,right:3,parent:-1},{id:2,value:2,left:null,right:null,parent:1},{id:3,value:3,left:null,right:null,parent:1}]
export function generateSteps(inputArray) {
  const nodes=[...NODES], steps=[], visited=[], order=[]
  const addStep=(cur,desc,line)=>steps.push({nodes:[...nodes],visited:[...visited],current:cur,highlighted:cur>=0?[cur]:[],traversalOrder:[...order],description:desc,codeLine:line})
  addStep(-1,'Serialize: preorder traversal to string "1,2,N,N,3,N,N"',2)
  function ser(id){if(id===null){addStep(-1,'null → serialize as "N"',3);return}
    const n=nodes.find(nd=>nd.id===id);visited.push(id);order.push(n.value)
    addStep(id,'Serialize node '+n.value,4);ser(n.left);ser(n.right)}
  ser(1)
  addStep(-1,'Serialized: "'+order.join(',')+'". Deserialize reverses this preorder string.',6)
  return steps
}