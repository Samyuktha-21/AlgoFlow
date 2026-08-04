export function generateSteps(inputArray) {
  const coins=[25,10,5,1]
  const amount=inputArray&&inputArray[0]>0?inputArray[0]:67
  const arr=[...coins], steps=[], sorted=[], used=[]
  let rem=amount
  const addStep=(i,cnt,desc,line)=>steps.push({array:arr,current:i,highlight:[i],sorted:[...sorted],pointers:[{index:i,label:'coin'}],extra:{remaining:rem,total:used.reduce((s,u)=>s+u.count,0)},description:desc,codeLine:line})
  addStep(-1,-1,'Coin Change (Greedy): make '+amount+'¢ using ['+coins.join(',')+']',2)
  for(let i=0;i<coins.length;i++){
    const cnt=Math.floor(rem/coins[i])
    addStep(i,cnt,'Coin '+coins[i]+'¢: '+rem+'÷'+coins[i]+'='+cnt+' coins',5)
    if(cnt>0){used.push({coin:coins[i],count:cnt});sorted.push(i);rem-=cnt*coins[i];addStep(i,cnt,'Use '+cnt+'×'+coins[i]+'¢ = '+(cnt*coins[i])+'¢. Remaining='+rem,6)}
  }
  addStep(-1,-1,'Total coins: '+used.map(u=>u.count+'×'+u.coin+'¢').join(' + '),8)
  return steps
}