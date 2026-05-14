export function generateSteps(inputArray) {
  const vals=inputArray&&inputArray.length>=2?inputArray:[1,2,3,4,5,6]
  const nodes=vals.map((v,i)=>({id:i,value:v,next:i<vals.length-1?i+1:null}))
  // Create cycle: last node points back to index 2
  const cycleAt=2; nodes[nodes.length-1].next=cycleAt
  const n=nodes.length, steps=[], visited=[]
  let slow=0, fast=0
  const addStep=(desc,line)=>{
    const ptrs=[{nodeId:slow,label:'slow',color:'#4ade80'},{nodeId:fast,label:'fast',color:'#f97316'}]
    steps.push({nodes:nodes.map(nd=>({...nd})),pointers:ptrs,reversed:[],highlighted:[slow,fast],description:desc,codeLine:line})
  }
  addStep('Init: slow=fast=head(0). Cycle exists at node '+cycleAt,2)
  let found=false
  for(let step=0;step<n*2+2;step++){
    const nf=nodes[fast]?.next>=0?nodes[fast].next:-1
    const nf2=nf>=0&&nodes[nf]?.next>=0?nodes[nf].next:-1
    if(nf<0||nf2<0){addStep('fast reached null — NO CYCLE',4);return steps}
    slow=nodes[slow].next; fast=nodes[nf].next
    addStep('slow→'+slow+', fast→'+fast,4)
    if(slow===fast){found=true;addStep('slow==fast at node '+slow+' — CYCLE DETECTED!',6);break}
  }
  if(!found) addStep('No cycle found',7)
  return steps
}