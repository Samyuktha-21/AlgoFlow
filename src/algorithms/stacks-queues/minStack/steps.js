export function generateSteps(inputArray) {
  const ops=inputArray&&inputArray.length>=2?[...inputArray]:[5,3,7,2,4,1,6]
  const stack=[], minStack=[], steps=[]
  const addStep=(op,val,desc,line)=>steps.push({array:ops,current:ops.indexOf(val),stack:[...stack],stack2:[...minStack],stack2Label:'Min Stack',result:[],extra:{min:minStack.length>0?minStack[minStack.length-1]:'—',op},description:desc,codeLine:line})
  addStep('init',-1,'Min Stack: push/pop/getMin all O(1). Two stacks: main + min tracker.',2)
  for(const val of ops){
    const newMin=minStack.length===0?val:Math.min(val,minStack[minStack.length-1])
    stack.push(val); minStack.push(newMin)
    addStep('push',val,'push('+val+'): min stack top = min('+val+',prev_min)='+newMin+'. Current min='+newMin,4)
  }
  while(stack.length>0){
    addStep('getMin',stack[stack.length-1],'getMin()='+minStack[minStack.length-1]+', top()='+stack[stack.length-1],7)
    stack.pop(); minStack.pop()
    addStep('pop',stack[stack.length-1]||0,'pop(). New min='+(minStack.length>0?minStack[minStack.length-1]:'empty'),8)
  }
  steps[steps.length-1].result = `${ops.length} ops, final min = ${minStack.length?minStack[minStack.length-1]:'empty'}`
  return steps
}