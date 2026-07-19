export function generateSteps(inputArray) {
  const arr=inputArray&&inputArray.length>=3?[...inputArray]:[100,4,200,1,3,2,5,6]
  const set=new Set(arr), steps=[]
  let best=0, bestStart=0
  const addStep=(cur,hl,desc,line)=>steps.push({array:[...arr],current:cur,highlight:[...hl],sorted:[],pointers:[],extra:{longest:best,set:set.size},description:desc,codeLine:line})
  addStep(-1,[],'Longest Consecutive: put all in set, find sequence starts',2)
  for(const n of set){
    if(!set.has(n-1)){
      addStep(arr.indexOf(n),[arr.indexOf(n)],''+n+' is sequence start ('+( n-1)+' not in set)',5)
      let c=1
      while(set.has(n+c)){addStep(arr.indexOf(n+c),[arr.indexOf(n+c)],''+( n+c)+' in set → streak='+( c+1),6);c++}
      if(c>best){best=c;bestStart=n}
      addStep(arr.indexOf(n),[],'Streak from '+n+': length='+c+'. Best='+best,7)
    }
  }
  addStep(-1,[],'Longest consecutive sequence: '+bestStart+' to '+(bestStart+best-1)+', length='+best,8)
  return steps
}