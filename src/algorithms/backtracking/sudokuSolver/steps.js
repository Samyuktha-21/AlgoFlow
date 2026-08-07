/* Sudoku by backtracking: walk to the first empty cell, try each digit that
   does not already clash on its row, column or 3x3 box, and recurse. A dead
   end means undoing the last placement and trying the next digit — which is
   the only way to escape a choice that looked legal at the time.

   Input: 9 rows of 9 digits, 0 for an empty cell, rows separated by "/". */
const PUZZLE=[
    [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]
]

export function generateSteps(inputGrid) {
  /* Anything that is not a full 9x9 board cannot be a Sudoku, so a
     mis-shaped grid falls back rather than half-solving something. */
  const usable = Array.isArray(inputGrid) && inputGrid.length === 9
    && inputGrid.every(r => Array.isArray(r) && r.length === 9)
  const source = usable ? inputGrid : PUZZLE
  const board=source.map(r=>r.map(v=>(v>=1&&v<=9?v:0)))
  const steps=[], filled=[]
  function isValid(r,c,d){
    for(let i=0;i<9;i++){if(board[r][i]===d||board[i][c]===d)return false}
    const br=3*Math.floor(r/3), bc=3*Math.floor(c/3)
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(board[br+i][bc+j]===d)return false
    return true
  }
  function addStep(r,c,bt,desc,line){
    const b=board.map(row=>[...row])
    steps.push({board:b,highlighted:{row:r,col:c},conflicts:[],backtracking:bt,type:'sudoku',description:desc,codeLine:line,extra:{attempts:steps.length,filled:filled.length}})
  }
  const blanks=board.flat().filter(v=>v===0).length
  addStep(0,0,false,'Solve this Sudoku: '+blanks+' empty cell'+(blanks===1?'':'s')+'. Try 1-9 in each, backtracking whenever a digit clashes.',2)
  /* A hard 9x9 needs thousands of placements, which is a playback nobody
     watches; the default puzzle below solves in a few dozen. The cap is high
     enough for a real solve and the final step says so when it is hit. */
  const limit=3000
  function solve(){
    for(let r=0;r<9;r++)for(let c=0;c<9;c++){
      if(board[r][c]===0){
        for(let d=1;d<=9;d++){
          if(isValid(r,c,d)){
            board[r][c]=d; filled.push({r,c})
            addStep(r,c,false,'Place '+d+' at ('+r+','+c+')',7)
            if(steps.length>limit) return true
            if(solve()) return true
            board[r][c]=0; filled.pop()
            addStep(r,c,true,'Backtrack: remove '+d+' from ('+r+','+c+')',9)
          }
        }
        return false
      }
    }
    addStep(-1,-1,false,'Sudoku SOLVED!',15)
    return true
  }
  solve()
  const remaining=board.flat().filter(v=>v===0).length
  steps[steps.length-1].result = remaining===0
    ? 'Solved — '+blanks+' cells filled'
    : remaining+' cells left when the trace stopped'
  return steps
}