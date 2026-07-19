export function generateSteps() {
  const items=[{w:10,v:60},{w:20,v:100},{w:30,v:120}].map(it=>({...it,r:it.v/it.w}))
  items.sort((a,b)=>b.r-a.r)
  let W=50
  const arr=items.map(it=>it.v), steps=[], sorted=[], selected=[]
  const addStep=(cur,hl,desc,line)=>steps.push({array:arr,current:cur,highlight:[...hl],sorted:[...sorted],pointers:[{index:cur,label:'item'}],extra:{W,totalValue:selected.reduce((s,{frac,v})=>s+frac*v,0).toFixed(1)},description:desc,codeLine:line})
  addStep(-1,[],'Fractional Knapsack: items sorted by value/weight ratio (highest first)',2)
  for(let i=0;i<items.length;i++){
    const it=items[i]
    addStep(i,[i],'Item: w='+it.w+', v='+it.v+', ratio='+it.r.toFixed(2)+'. Remaining W='+W,5)
    if(W>=it.w){selected.push({frac:1,v:it.v});sorted.push(i);W-=it.w;addStep(i,[i],'Take entire item (v='+it.v+'). W left='+W,6)}
    else if(W>0){const f=W/it.w;selected.push({frac:f,v:it.v});sorted.push(i);addStep(i,[i],'Take '+( f*100).toFixed(0)+'% (v='+( f*it.v).toFixed(1)+'). W left=0',8);W=0;break}
    else {addStep(i,[],'Knapsack full',9);break}
  }
  const totalV=selected.reduce((s,{frac,v})=>s+frac*v,0)
  addStep(-1,sorted,'Total value = '+totalV.toFixed(1),10)
  return steps
}