export function generateSteps() {
  const s='({[]})'
  const chars=s.split(''), n=chars.length
  const arr=chars.map(c=>c.charCodeAt(0))
  const stack=[], steps=[]
  const addStep=(cur,valid,desc,line)=>steps.push({array:arr,current:cur,stack:[...stack.map(c=>c.charCodeAt(0))],result:valid?[]:[-1],highlight:[cur],description:desc,codeLine:line,extra:{char:chars[cur]||'',valid,stack:stack.join('')}})
  addStep(-1,true,'Valid Parentheses: check "'+s+'" using a stack',2)
  let valid=true
  for(let i=0;i<n;i++){
    const c=chars[i]
    if('([{'.includes(c)){stack.push(c);addStep(i,true,'Open bracket "'+c+'" → push. Stack: '+stack.join(''),3)}
    else{
      if(stack.length===0){addStep(i,false,'Close "'+c+'" with empty stack → INVALID',6);valid=false;break}
      const top=stack[stack.length-1]
      const match=(c===')'&&top==='(')||(c===']'&&top==='[')||(c==='}'&&top==='{')
      stack.pop()
      if(match){addStep(i,true,'"'+c+'" matches "'+top+'" → pop. Stack: '+stack.join(''),7)}
      else{addStep(i,false,'"'+c+'" does NOT match "'+top+'" → INVALID',8);valid=false;break}
    }
  }
  if(valid) addStep(-1,stack.length===0,'Stack '+(stack.length===0?'empty → VALID':'not empty → INVALID'),10)
  return steps
}