export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=3?[...inputArray]:[10,9,2,5,3,7,101,18]
  const n=arr.length
  const dp=new Array(n).fill(1)
  const computed=new Array(n).fill(false)
  const steps=[]
  const addStep=(cur,desc,line)=>steps.push({dp:[...dp],current:cur,computed:[...computed],description:desc,codeLine:line,extra:{LIS:Math.max(...dp),array:arr.join(',')}})
  addStep(-1,'LIS: dp[i]=length of LIS ending at index i. Array: ['+arr.join(',')+']',3)
  computed[0]=true; addStep(0,'Base: dp[0]=1 (single element)',6)
  let maxLen=1
  for(let i=1;i<n;i++){
    addStep(i,'Computing dp['+i+'] for arr['+i+']='+arr[i],8)
    for(let j=0;j<i;j++){
      if(arr[j]<arr[i]){
        addStep(i,'arr['+j+']='+arr[j]+' < arr['+i+']='+arr[i]+' → dp['+i+']=max('+dp[i]+',dp['+j+']+1)='+Math.max(dp[i],dp[j]+1),10)
        dp[i]=Math.max(dp[i],dp[j]+1)
      }
    }
    computed[i]=true; maxLen=Math.max(maxLen,dp[i])
    addStep(i,'dp['+i+']='+dp[i]+'. Current LIS length: '+maxLen,12)
  }
  addStep(-1,'LIS length = '+maxLen,14)
  return steps
}