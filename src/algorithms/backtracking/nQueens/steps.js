export function generateSteps(inputArray) {
  const n=inputArray&&inputArray.length>=1?Math.min(8,Math.max(4,inputArray[0])):6
  const queens=new Array(n).fill(-1), steps=[]
  function isSafe(row,col){for(let r=0;r<row;r++) if(queens[r]===col||Math.abs(queens[r]-col)===row-r) return false; return true}
  function addStep(row,col,bt,desc,line){
    const board=Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>{if(queens[r]===c)return 1;return 0}))
    if(row>=0&&col>=0) board[row][col]=bt?-1:2
    const conflicts=[]
    steps.push({board,queens:[...queens],n,highlighted:{row:row<0?0:row,col:col<0?0:col},conflicts,backtracking:bt,type:'nqueens',description:desc,codeLine:line,extra:{row,solutions:steps.filter(s=>s.extra&&s.extra.solution).length}})
  }
  let found=0
  function solve(row){
    if(row===n){found++;addStep(-1,-1,false,'Solution '+found+' found!',10);return}
    for(let col=0;col<n&&found<3;col++){
      addStep(row,col,false,'Try Queen at row '+row+', col '+col,11)
      if(isSafe(row,col)){
        queens[row]=col
        addStep(row,col,false,'Safe! Place queen at ('+row+','+col+')',13)
        solve(row+1)
        queens[row]=-1
        if(found<3) addStep(row,col,true,'Backtrack: remove queen from ('+row+','+col+')',15)
      } else {
        addStep(row,col,true,'Conflict! Cannot place at ('+row+','+col+')',12)
      }
    }
  }
  addStep(0,0,false,'N-Queens (N='+n+'): place '+n+' non-attacking queens',4)
  solve(0)
  if(found===0) addStep(-1,-1,false,'No solution exists for N='+n,7)
  return steps
}