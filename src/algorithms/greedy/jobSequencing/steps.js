export function generateSteps() {
  const jobs=[{id:0,profit:100,deadline:2},{id:1,profit:19,deadline:1},{id:2,profit:27,deadline:2},{id:3,profit:25,deadline:1},{id:4,profit:15,deadline:3}]
  jobs.sort((a,b)=>b.profit-a.profit)
  const maxD=Math.max(...jobs.map(j=>j.deadline))
  const slot=new Array(maxD+1).fill(-1), arr=jobs.map(j=>j.profit), steps=[], sorted=[]
  const addStep=(i,j,desc,line)=>steps.push({array:arr,current:i,highlight:[i],sorted:[...sorted],pointers:[],extra:{scheduled:sorted.length,profit:sorted.reduce((s,idx)=>s+jobs[idx].profit,0)},description:desc,codeLine:line})
  addStep(-1,-1,'Job Sequencing: sort by profit, place in latest available slot',2)
  for(let i=0;i<jobs.length;i++){
    const job=jobs[i]
    addStep(i,-1,'Job profit='+job.profit+', deadline='+job.deadline+': find slot',4)
    let scheduled=false
    for(let j=job.deadline;j>=1;j--){
      if(slot[j]===-1){slot[j]=i;sorted.push(i);scheduled=true;addStep(i,j,'Scheduled at slot '+j+'. Profit+='+job.profit,6);break}
    }
    if(!scheduled) addStep(i,-1,'No free slot ≤ '+job.deadline+' → skip',7)
  }
  const total=sorted.reduce((s,i)=>s+jobs[i].profit,0)
  addStep(-1,-1,'Scheduled '+sorted.length+' jobs with total profit='+total,8)
  return steps
}