/* Bracket matching, told from the stack's point of view. Brackets close in
   reverse order of opening, which is precisely the discipline a stack
   enforces — so the only bracket a closer may match is the one on top. */
function toBrackets(v) {
  const raw = Array.isArray(v) ? v.join('') : v
  const text = typeof raw === 'string' ? raw : ''
  /* Non-bracket characters are dropped rather than counted as mismatches. */
  const only = text.replace(/[^()[\]{}]/g, '')
  return (only || '{[()]}').slice(0, 20)
}

export function generateSteps(input) {
  const s=toBrackets(input)
  const chars=s.split(''), n=chars.length, stack=[], steps=[]
  const arr=[...chars]
  const addStep=(cur,valid,desc,line)=>steps.push({array:arr,current:cur,stack:[...stack],result:[],highlight:[cur>=0?cur:0],description:desc,codeLine:line,extra:{char:chars[cur]||'',valid,stack:stack.join('')}})
  addStep(-1,true,'Valid Parentheses Stack: check "'+s+'"',2)
  for(let i=0;i<n;i++){
    const c=chars[i]
    if('([{'.includes(c)){stack.push(c);addStep(i,true,'Push "'+c+'". Stack: '+stack.join(''),4)}
    else{
      if(stack.length===0){addStep(i,false,'Empty stack for "'+c+'" → INVALID',6);steps[steps.length-1].result='Invalid';return steps}
      const top=stack.pop()
      const match=(c===')'&&top==='(')||(c===']'&&top==='[')||(c==='}'&&top==='{')
      if(match){addStep(i,true,'"'+c+'" matches "'+top+'". Stack: '+stack.join(''),8)}
      else{addStep(i,false,'"'+c+'" mismatches "'+top+'" → INVALID',9);steps[steps.length-1].result='Invalid';return steps}
    }
  }
  addStep(-1,stack.length===0,'Stack '+(stack.length===0?'empty → VALID':'not empty → INVALID'),11)
  steps[steps.length-1].result = stack.length===0 ? 'Valid' : 'Invalid'
  return steps
}