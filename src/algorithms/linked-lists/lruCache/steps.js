export function generateSteps() {
  const cap=3, ops=[['put',1,1],['put',2,2],['put',3,3],['get',1],['put',4,4],['get',2]]
  const cache=[], nodes=[], steps=[]
  let id=0
  function makeNode(k,v){return{id:id++,value:k+'→'+v,next:null,key:k,val:v}}
  const addStep=(op,desc,line)=>steps.push({nodes:[...nodes.map(n=>({...n}))],pointers:[],reversed:[],highlighted:nodes.map(n=>n.id),description:desc,codeLine:line,extra:{op,cacheSize:cache.length,cap}})
  addStep('init','LRU Cache (cap='+cap+'): Most Recent ← [cache] → Least Recent',2)
  for(const op of ops){
    if(op[0]==='put'){
      const [,k,v]=op
      const exist=cache.findIndex(e=>e.key===k)
      if(exist>=0){cache.splice(exist,1);nodes.splice(exist,1)}
      else if(cache.length>=cap){const evicted=cache.pop();nodes.pop();addStep('evict','Evict LRU: key='+evicted.key,6)}
      const nd=makeNode(k,v)
      cache.unshift({key:k,val:v})
      nodes.unshift(nd)
      // fix next pointers
      for(let i=0;i<nodes.length-1;i++) nodes[i].next=nodes[i+1].id
      if(nodes.length>0) nodes[nodes.length-1].next=null
      addStep('put','put('+k+','+v+'). Cache: ['+cache.map(e=>e.key).join('→')+']',5)
    } else {
      const [,k]=op
      const idx=cache.findIndex(e=>e.key===k)
      if(idx>=0){
        const nd=cache.splice(idx,1)[0]; const n=nodes.splice(idx,1)[0]
        cache.unshift(nd); nodes.unshift(n)
        addStep('get','get('+k+')='+nd.val+'. Move to front.',9)
      } else addStep('get','get('+k+')=-1 (not in cache)',10)
    }
  }
  return steps
}