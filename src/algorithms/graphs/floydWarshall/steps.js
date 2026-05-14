import { computeLayout } from '../bfs/steps.js'
const V=4
const INIT_DIST=[[0,3,999,7],[8,0,2,999],[5,999,0,1],[2,999,999,0]]
const NODES=[{id:0,label:'0'},{id:1,label:'1'},{id:2,label:'2'},{id:3,label:'3'}]
const EDGES=[{from:0,to:1,weight:3},{from:0,to:3,weight:7},{from:1,to:0,weight:8},{from:1,to:2,weight:2},{from:2,to:0,weight:5},{from:2,to:3,weight:1},{from:3,to:0,weight:2}]
export function generateSteps(){
  const dist=INIT_DIST.map(r=>[...r])
  const computed=Array.from({length:V},()=>new Array(V).fill(false))
  const positions=computeLayout(NODES,EDGES)
  const steps=[]
  const addStep=(i,j,k,desc,line)=>steps.push({dp2d:dist.map(r=>[...r].map(v=>v>=999?'∞':v)),rows:['0','1','2','3'],cols:['0','1','2','3'],cell:{row:i,col:j},computed2d:computed.map(r=>[...r]),description:desc,codeLine:line,extra:{k:k>=0?'via '+k:'init'},nodes:NODES.map(n=>({...n,...positions[n.id]})),edges:EDGES,visited:[],current:-1,queue:[]})
  addStep(0,0,-1,'Initialize dist matrix. 0 on diagonal, ∞ for no edge, edge weight otherwise.',2)
  for(let i=0;i<V;i++) for(let j=0;j<V;j++) computed[0][0]=true
  for(let k=0;k<V;k++){
    addStep(0,0,k,'Intermediate vertex k='+k+': check if going through '+k+' improves any path',3)
    for(let i=0;i<V;i++){
      for(let j=0;j<V;j++){
        if(dist[i][k]+dist[k][j]<dist[i][j]){
          const old=dist[i][j]>=999?'∞':dist[i][j]
          addStep(i,j,k,'dist['+i+']['+j+']='+old+' > dist['+i+']['+k+']+dist['+k+']['+j+']='+(dist[i][k]+dist[k][j])+' → update',5)
          dist[i][j]=dist[i][k]+dist[k][j]
          computed[i][j]=true
          addStep(i,j,k,'Updated dist['+i+']['+j+']='+dist[i][j],5)
        }
      }
    }
  }
  addStep(0,0,-1,'All-pairs shortest paths computed!',7)
  return steps
}