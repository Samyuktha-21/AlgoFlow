export function generateSteps(inputArray) {
  let intervals=[[1,3],[2,6],[8,10],[15,18],[9,12]]
  if(inputArray&&inputArray.length>=4&&inputArray.length%2===0){intervals=[];for(let i=0;i<inputArray.length;i+=2)intervals.push([inputArray[i],inputArray[i+1]])}
  intervals.sort((a,b)=>a[0]-b[0])
  const n=intervals.length, steps=[], sorted=[]
  const addStep=(cur,hl,desc,line)=>steps.push({array:intervals.map(iv=>iv[0]*100+iv[1]),current:cur,highlight:[...hl],sorted:[...sorted],pointers:[{index:cur,label:'cur'}],description:desc,codeLine:line,extra:{mergedCount:sorted.length}})
  addStep(-1,[],'Merge intervals: sorted by start. Intervals: '+intervals.map(iv=>'['+iv.join(',')+']').join(' '),4)
  const merged=[...intervals[0]]
  sorted.push(0)
  addStep(0,[0],'Start with ['+merged.join(',')+']',6)
  for(let i=1;i<n;i++){
    addStep(i,[i],'Check ['+intervals[i].join(',')+'] vs current ['+merged.join(',')+']',8)
    if(intervals[i][0]<=merged[1]){
      const old=merged[1]; merged[1]=Math.max(merged[1],intervals[i][1])
      sorted.push(i)
      addStep(i,[...sorted],'Overlap! Extend end: max('+old+','+intervals[i][1]+')='+merged[1],9)
    } else {
      addStep(i,[i],'No overlap → push ['+merged.join(',')+'] and start new merge',11)
    }
  }
  addStep(-1,sorted,'Merged intervals complete',16)
  return steps
}