export function generateSteps(inputArray) {
  const vals=inputArray&&inputArray.length>=2?[...inputArray]:[1,2,3,4,5]
  const stack=[], steps=[]
  const addStep=(cur,op,desc,line)=>steps.push({array:vals,current:cur,stack:[...stack],result:[],highlight:cur>=0?[cur]:[],description:desc,codeLine:line,extra:{op,top:stack.length-1}})
  addStep(-1,'init','Stack (LIFO): push adds to top, pop removes from top',2)
  for(let i=0;i<vals.length;i++){stack.push(vals[i]);addStep(i,'push','push('+vals[i]+'). Stack top='+vals[i],4)}
  while(stack.length>0){const v=stack.pop();addStep(-1,'pop','pop()='+v+'. Stack size='+stack.length,7)}
  addStep(-1,'done','Stack is empty',9)
  return steps
}