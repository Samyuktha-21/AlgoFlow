export function generateSteps(inputArray) {
  const n=inputArray&&inputArray[0]>=3?Math.min(inputArray[0],6):4
  const k=inputArray&&inputArray[1]>=1?Math.min(inputArray[1],3):2
  const steps=[], results=[], current=[]
  function addStep(start,bt,desc,line){
    const board=Array.from({length:Math.max(k,2)},(_,r)=>Array.from({length:n},(_,c)=>r===0?c+1:current[c]!==undefined?current[c]:0))
    steps.push({board,n,highlighted:{row:0,col:start-1},conflicts:[],backtracking:bt,type:'nqueens',description:desc,codeLine:line,extra:{current:current.join(','),results:results.length}})
  }
  let limit=60
  function bt(start){
    if(current.length===k){results.push([...current]);addStep(start,false,'Combination: ['+current.join(',')+'] ('+results.length+' found)',9);return}
    if(steps.length>limit) return
    for(let i=start;i<=n-(k-current.length)+1;i++){
      current.push(i); addStep(i,false,'Choose '+i+'. Current: ['+current.join(',')+']',11)
      bt(i+1)
      current.pop(); addStep(i,true,'Skip/backtrack '+i,13)
    }
  }
  addStep(1,false,'C('+n+','+k+'): combinations of '+k+' from [1..'+n+']',3)
  bt(1)
  addStep(1,false,'All '+results.length+' combinations found',6)
  steps[steps.length-1].result = `${results.length} combinations`
  return steps
}