export function generateSteps(inputArray) {
  const vals = inputArray && inputArray.length >= 2 ? inputArray : [1,2,3,4,5]
  const nodes = vals.map((v,i)=>({id:i,value:v,next:i<vals.length-1?i+1:null}))
  const steps = []
  const addStep=(ns,ptrs,rev,desc,line)=>steps.push({nodes:ns.map(nd=>({...nd})),pointers:ptrs,reversed:[...rev],highlighted:ptrs.map(p=>p.nodeId),description:desc,codeLine:line})
  let prev=-1, curr=0, reversed=[]
  addStep([...nodes],[{nodeId:curr,label:'curr',color:'#fbbf24'},{nodeId:null,label:'prev',color:'#a78bfa'}],[],'Initialize prev=null, curr=head (node 0)',2)
  while(curr>=0){
    const node=nodes[curr]
    const nxtId=node.next
    addStep([...nodes],[{nodeId:curr,label:'curr'},{nodeId:prev<0?null:prev,label:'prev'}],[...reversed],'Save next='+( nxtId>=0?nxtId:'null')+', reverse curr.next',4)
    node.next=prev<0?null:prev
    reversed.push(curr)
    addStep([...nodes],[{nodeId:curr,label:'curr'},{nodeId:prev<0?null:prev,label:'prev'}],[...reversed],'Reversed: node '+curr+'.next → '+(prev<0?'null':prev),6)
    prev=curr; curr=nxtId||(-1)
    if(curr>=0) addStep([...nodes],[{nodeId:curr,label:'curr'},{nodeId:prev,label:'prev'}],[...reversed],'Advance: prev='+prev+', curr='+curr,7)
  }
  addStep([...nodes],[{nodeId:prev,label:'head'}],[...reversed],'Reversed! New head = node '+prev,9)
  return steps
}