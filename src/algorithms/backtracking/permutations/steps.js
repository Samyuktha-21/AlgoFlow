export function generateSteps(inputArray) {
  /* n! grows fast enough that six values already overflow the step budget, so
     longer input is TRUNCATED rather than discarded — the old code fell back
     to [1,2,3] whenever the input was not 2-5 long, so typing eight numbers
     silently showed the permutations of something else. */
  const all = Array.isArray(inputArray) && inputArray.length >= 2 ? [...inputArray] : [1, 2, 3]
  const nums = all.slice(0, 5)
  const n=nums.length, steps=[], results=[]
  const used=new Array(n).fill(false), path=[]
  function addStep(bt,desc,line){
    const board=Array.from({length:Math.max(n,3)},(_,r)=>Array.from({length:n},(_,c)=>r===0?nums[c]:r===1&&path[c]!==undefined?path[c]:0))
    steps.push({board,n,highlighted:{row:1,col:path.length-1},conflicts:[],backtracking:bt,type:'nqueens',description:desc,codeLine:line,extra:{results:results.length,current:path.join(',') || '[]'}})
  }
  addStep(false,'Permutations of ['+nums.join(',')+'] using backtracking'+(all.length>n?' (first '+n+' of '+all.length+' values)':''),4)
  let limit=60
  function bt(){
    if(path.length===n){
      results.push([...path])
      addStep(false,'Permutation found: ['+path.join(',')+'] ('+results.length+' so far)',9)
      return
    }
    for(let i=0;i<n&&steps.length<limit;i++){
      if(!used[i]){
        used[i]=true; path.push(nums[i])
        addStep(false,'Choose '+nums[i]+'. Path: ['+path.join(',')+']',12)
        bt()
        used[i]=false; path.pop()
        addStep(true,'Backtrack. Path: ['+path.join(',')+']',14)
      }
    }
  }
  bt()
  addStep(false,'All permutations generated: '+results.length+' total',6)
  steps[steps.length-1].result = `${results.length} permutations`
  return steps
}