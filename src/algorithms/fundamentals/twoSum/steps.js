export function generateSteps(inputArray) {
  const sorted=[...(inputArray&&inputArray.length>=2?inputArray:[1,2,4,6,8,9,14,15])].sort((a,b)=>a-b)
  const target=sorted[Math.floor(sorted.length/4)]+sorted[Math.floor(sorted.length*3/4)]
  const n=sorted.length, steps=[]
  let left=0, right=n-1
  const addStep=(desc,line)=>steps.push({array:[...sorted],pointers:[{index:left,label:'L'},{index:right,label:'R'}],highlight:[left,right],sorted:[],extra:{target,sum:sorted[left]+sorted[right]},description:desc,codeLine:line})
  addStep('Two Pointers: find pair summing to '+target,2)
  while(left<right){
    const sum=sorted[left]+sorted[right]
    addStep('L='+left+'('+sorted[left]+'), R='+right+'('+sorted[right]+'), sum='+sum,4)
    if(sum===target){addStep('Found! '+sorted[left]+'+'+sorted[right]+'='+target+' at ['+left+','+right+']',5);steps[steps.length-1].result='Indices ['+left+', '+right+']';return steps}
    else if(sum<target){addStep(sum+' < '+target+' → L++',7);left++}
    else{addStep(sum+' > '+target+' → R--',8);right--}
  }
  addStep('No pair found summing to '+target,10)
  steps[steps.length-1].result = 'No pair sums to '+target
  return steps
}