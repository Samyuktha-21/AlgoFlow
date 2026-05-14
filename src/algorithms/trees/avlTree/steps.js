const NODES=[{id:3,value:3,left:2,right:5,parent:-1},{id:2,value:2,left:1,right:null,parent:3},{id:5,value:5,left:4,right:6,parent:3},{id:1,value:1,left:null,right:null,parent:2},{id:4,value:4,left:null,right:null,parent:5},{id:6,value:6,left:null,right:null,parent:5}]
export function generateSteps(inputArray) {
  const nodes=[...NODES], steps=[], visited=[]
  const addStep=(cur,hl,desc,line)=>steps.push({nodes:[...nodes],visited:[...visited],current:cur,highlighted:[...hl],traversalOrder:[],description:desc,codeLine:line})
  addStep(-1,[],'AVL Tree: self-balancing BST. Balance factor = height(left) - height(right). Must be -1, 0, or 1.',2)
  addStep(3,[3],'Check balance at root (3): height(left)=2, height(right)=2, BF=0 ✓',4)
  addStep(2,[2],'Check balance at node 2: BF=1 ✓',5)
  addStep(5,[5],'Check balance at node 5: BF=0 ✓',5)
  addStep(-1,[1,2,3,4,5,6],'AVL Tree is balanced. All nodes have |BF| ≤ 1.',6)
  return steps
}