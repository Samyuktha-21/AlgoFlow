export function generateSteps() {
  const words=['apple','app','application','apt','bat']
  // Build a simple node graph for the trie
  const nodes=[], steps=[], visited=[], order=[]
  let id=0
  const root={id:id++,value:'root',left:null,right:null,parent:-1}
  nodes.push(root)
  const addStep=(cur,desc,line)=>steps.push({nodes:[...nodes.map(n=>({...n}))],visited:[...visited],current:cur,highlighted:cur>=0?[cur]:[],traversalOrder:[...order],description:desc,codeLine:line})
  addStep(0,'Trie: each node = one character. Shared prefixes share nodes.',2)
  for(const word of words){
    addStep(0,'Inserting "'+word+'" character by character',4)
    let prevId=0
    for(let i=0;i<word.length;i++){
      const charNode={id:id++,value:word[i],left:null,right:i<word.length-1?id:null,parent:prevId}
      nodes.push(charNode);visited.push(charNode.id)
      addStep(charNode.id,'Add node "'+word[i]+'" for "'+word.slice(0,i+1)+'"',5)
      prevId=charNode.id
      if(nodes.length>20) break
    }
    if(nodes.length>20) break
  }
  addStep(-1,'Trie built for ['+words.join(', ')+']. Prefix search is O(L) where L=word length',7)
  return steps
}