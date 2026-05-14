export function generateSteps(inputArray) {
  const cap=6, vals=inputArray&&inputArray.length>=2?[...inputArray]:[1,2,3,4,5]
  const buf=new Array(cap).fill(0)
  let fr=0,re=0,sz=0
  const steps=[]
  const addStep=(op,val,desc,line)=>steps.push({array:[...buf],current:re,stack:[...buf.slice(0,sz)],result:[],highlight:[fr,re].filter((v,i,a)=>a.indexOf(v)===i),description:desc,codeLine:line,extra:{front:fr,rear:re,size:sz,cap}})
  addStep('init',0,'Circular Queue (cap='+cap+'): front='+fr+', rear='+re,2)
  for(const v of vals){
    if(sz<cap){buf[re]=v;re=(re+1)%cap;sz++;addStep('enq',v,'enqueue('+v+'). rear→'+re+', size='+sz,5)}
    else addStep('full',v,'Queue full! Cannot enqueue '+v,6)
  }
  for(let i=0;i<3&&sz>0;i++){
    const v=buf[fr];fr=(fr+1)%cap;sz--;
    addStep('deq',v,'dequeue()='+v+'. front→'+fr+', size='+sz,9)
  }
  return steps
}