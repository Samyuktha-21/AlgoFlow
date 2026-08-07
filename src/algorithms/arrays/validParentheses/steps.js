/* Bracket matching with a stack. The stack is the right structure because
   brackets close in reverse order of opening — the only bracket a closer can
   legally match is the most recent unclosed one, which is exactly the top. */
function toBrackets(v) {
  const raw = Array.isArray(v) ? v.join('') : v
  const text = typeof raw === 'string' ? raw : ''
  /* Anything that is not a bracket is dropped rather than treated as a
     mismatch, so "f(x[0])" checks the brackets people meant. */
  const only = text.replace(/[^()[\]{}]/g, '')
  return (only || '({[]})').slice(0, 20)
}

export function generateSteps(input) {
  const s=toBrackets(input)
  const chars=s.split(''), n=chars.length
  const arr=[...chars]
  const stack=[], steps=[]
  const addStep=(cur,valid,desc,line)=>steps.push({array:arr,current:cur,stack:[...stack],result:valid?[]:[-1],highlight:[cur],description:desc,codeLine:line,extra:{char:chars[cur]||'',valid,stack:stack.join('')}})
  addStep(-1,true,'Valid Parentheses: check "'+s+'" using a stack',4)
  let valid=true
  for(let i=0;i<n;i++){
    const c=chars[i]
    if('([{'.includes(c)){stack.push(c);addStep(i,true,'Open bracket "'+c+'" → push. Stack: '+stack.join(''),6)}
    else{
      if(stack.length===0){addStep(i,false,'Close "'+c+'" with empty stack → INVALID',8);valid=false;break}
      const top=stack[stack.length-1]
      const match=(c===')'&&top==='(')||(c===']'&&top==='[')||(c==='}'&&top==='{')
      stack.pop()
      if(match){addStep(i,true,'"'+c+'" matches "'+top+'" → pop. Stack: '+stack.join(''),9)}
      else{addStep(i,false,'"'+c+'" does NOT match "'+top+'" → INVALID',10);valid=false;break}
    }
  }
  if(valid) addStep(-1,stack.length===0,'Stack '+(stack.length===0?'empty → VALID':'not empty → INVALID'),15)
  steps[steps.length-1].result = `${valid && stack.length===0 ? 'Valid' : 'Invalid'}`
  return steps
}