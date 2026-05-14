export function generateSteps(inputArray) {
  const s='leetcode', dict=['leet','code','lee','t']
  const n=s.length, dp=new Array(n+1).fill(false), computed=new Array(n+1).fill(false)
  dp[0]=true; computed[0]=true
  const steps=[]
  const addStep=(cur,desc,line)=>steps.push({dp:[...dp].map(v=>v?1:0),current:cur,computed:[...computed],description:desc,codeLine:line,extra:{string:s,result:dp[n]?'YES':'?'}})
  addStep(0,'Word Break "'+s+'" with dict ['+dict.join(',')+']',2)
  for(let i=1;i<=n;i++){
    addStep(i,'Check dp['+i+'] for "'+s.slice(0,i)+'"',4)
    for(let j=0;j<i;j++){
      const word=s.slice(j,i)
      const inDict=dict.includes(word)
      addStep(i,'j='+j+': word "'+word+'" '+(inDict?'✓ in dict':'✗ not in dict')+', dp['+j+']='+dp[j],5)
      if(dp[j]&&inDict){dp[i]=true;computed[i]=true;addStep(i,'dp['+i+']=true! "'+s.slice(0,j)+'" + "'+word+'"',6);break}
    }
    if(!dp[i]){computed[i]=true;addStep(i,'dp['+i+']=false',7)}
  }
  addStep(n,'"'+s+'" can'+(dp[n]?'':'not')+' be segmented into dict words',8)
  return steps
}