export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=4?[...inputArray]:[1,3,5,7,9,11]
  const n=arr.length
  const dp=new Array(4*n).fill(0)
  const computed=new Array(4*n).fill(false)
  const steps=[]
  const addStep=(cur,desc,line)=>steps.push({dp:[...dp.slice(0,Math.min(15,4*n))],current:cur,computed:[...computed.slice(0,Math.min(15,4*n))],description:desc,codeLine:line,extra:{array:arr.join(',')}})
  addStep(-1,'Segment Tree: build for range sum queries. Array: ['+arr.join(',')+']',2)
  function build(nd,s,e){
    if(s===e){dp[nd]=arr[s];computed[nd]=true;addStep(nd,'Leaf dp['+nd+']=arr['+s+']='+arr[s],4);return}
    const m=Math.floor((s+e)/2)
    build(2*nd+1,s,m); build(2*nd+2,m+1,e)
    dp[nd]=dp[2*nd+1]+dp[2*nd+2]; computed[nd]=true
    addStep(nd,'Internal dp['+nd+']=dp['+(2*nd+1)+']+dp['+(2*nd+2)+']='+dp[nd],6)
  }
  build(0,0,n-1)
  addStep(0,'Segment tree built! Range sum [0,'+( n-1)+'] = '+dp[0],7)
  return steps
}