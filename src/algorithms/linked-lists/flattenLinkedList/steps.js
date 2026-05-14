export function generateSteps(inputArray) {
  const nodes=[{id:0,value:1,next:1,child:null},{id:1,value:2,next:2,child:5},{id:2,value:3,next:null,child:null},{id:5,value:5,next:6,child:null},{id:6,value:6,next:null,child:null}]
  const steps=[]
  const addStep=(hl,desc,line)=>steps.push({nodes:[...nodes],pointers:[],reversed:[...hl],highlighted:[...hl],description:desc,codeLine:line})
  addStep([],'Flatten multilevel: connect child lists inline',2)
  addStep([0,1],'Node 2 has child list [5,6]. Connect after node 2.',4)
  addStep([1,5,6],'Linked child [5,6] after node 2',5)
  addStep([0,1,5,6,2],'Flattened: [1,2,5,6,3]',6)
  return steps
}