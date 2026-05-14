export function generateSteps(inputArray) {
  const s='{[()]}'
  const chars=s.split(''), n=chars.length, stack=[], steps=[]
  const arr=chars.map(c=>c.charCodeAt(0))
  const addStep=(cur,valid,desc,line)=>steps.push({array:arr,current:cur,stack:[...stack.map(c=>c.charCodeAt(0))],result:[],highlight:[cur>=0?cur:0],description:desc,codeLine:line,extra:{char:chars[cur]||'',valid,stack:stack.join('')}})
  addStep(-1,true,'Valid Parentheses Stack: check "'+s+'"',2)
  for(let i=0;i<n;i++){
    const c=chars[i]
    if('([{'.includes(c)){stack.push(c);addStep(i,true,'Push "'+c+'". Stack: '+stack.join(''),4)}
    else{
      if(stack.length===0){addStep(i,false,'Empty stack for "'+c+'" → INVALID',6);return steps}
      const top=stack.pop()
      const match=(c===')'&&top==='(')||(c===']'&&top==='[')||(c==='}'&&top==='{')
      if(match){addStep(i,true,'"'+c+'" matches "'+top+'". Stack: '+stack.join(''),8)}
      else{addStep(i,false,'"'+c+'" mismatches "'+top+'" → INVALID',9);return steps}
    }
  }
  addStep(-1,stack.length===0,'Stack '+(stack.length===0?'empty → VALID':'not empty → INVALID'),11)
  return steps
}