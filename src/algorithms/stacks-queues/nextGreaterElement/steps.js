export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=2?[...inputArray]:[4,5,2,25,10,8]
  const n=arr.length, result=new Array(n).fill(-1), steps=[]
  const stack=[]
  const addStep=(cur,desc,line)=>steps.push({array:[...arr],current:cur,stack:[...stack.map(i=>arr[i])],result:[...result],highlighted:stack.slice(-1),description:desc,codeLine:line})
  addStep(-1,'Init: empty stack, result=[-1]. Scan left to right.',2)
  for(let i=0;i<n;i++){
    addStep(i,'Process arr['+i+']='+arr[i],5)
    while(stack.length>0&&arr[stack[stack.length-1]]<arr[i]){
      const top=stack.pop()
      result[top]=arr[i]
      addStep(i,'arr['+top+']='+arr[top]+' < '+arr[i]+' → NGE['+top+']='+arr[i],7)
    }
    stack.push(i)
    addStep(i,'Push index '+i+' onto stack',9)
  }
  addStep(-1,'Remaining in stack have no NGE → -1. Result: ['+result.join(',')+']',11)
  return steps
}