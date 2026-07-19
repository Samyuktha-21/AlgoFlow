export function generateSteps() {
  const PUZZLE=[
    [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]
  ]
  const board=PUZZLE.map(r=>[...r])
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
  addStep(0,0,false,'Solve Sudoku: try digits 1-9 in each empty cell, backtrack on conflict',2)
  let limit=80
  function solve(){
    for(let r=0;r<9;r++)for(let c=0;c<9;c++){
      if(board[r][c]===0){
        for(let d=1;d<=9;d++){
          if(isValid(r,c,d)){
            board[r][c]=d; filled.push({r,c})
            addStep(r,c,false,'Place '+d+' at ('+r+','+c+')',6)
            if(steps.length>limit) return true
            if(solve()) return true
            board[r][c]=0; filled.pop()
            addStep(r,c,true,'Backtrack: remove '+d+' from ('+r+','+c+')',9)
          }
        }
        return false
      }
    }
    addStep(-1,-1,false,'Sudoku SOLVED!',11)
    return true
  }
  solve()
  return steps
}