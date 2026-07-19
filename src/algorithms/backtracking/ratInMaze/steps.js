export function generateSteps() {
  const MAZE=[[1,0,0,0],[1,1,0,1],[0,1,0,0],[0,1,1,1]]
  const n=4, board=MAZE.map(r=>[...r])
  const vis=Array.from({length:n},()=>new Array(n).fill(0))
  const steps=[], solutions=[]
  const DR=[1,-1,0,0],DC=[0,0,-1,1],DIRS='DULR'
  function addStep(r,c,bt,path,desc,line){
    const b=board.map(row=>[...row])
    for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(vis[i][j])b[i][j]=2
    steps.push({board:b,n,highlighted:{row:r,col:c},conflicts:[],backtracking:bt,type:'nqueens',description:desc,codeLine:line,extra:{path,solutions:solutions.length}})
  }
  addStep(0,0,false,'','Rat in Maze: find paths from (0,0) to ('+(n-1)+','+(n-1)+')',2)
  let limit=80
  function solve(r,c,path){
    if(steps.length>limit) return
    if(r===n-1&&c===n-1){solutions.push(path);addStep(r,c,false,path,'SOLUTION FOUND: '+path,5);return}
    vis[r][c]=1
    for(let i=0;i<4;i++){
      const nr=r+DR[i],nc=c+DC[i]
      if(nr>=0&&nr<n&&nc>=0&&nc<n&&!vis[nr][nc]&&board[nr][nc]===1){
        addStep(nr,nc,false,path+DIRS[i],'Move '+DIRS[i]+' to ('+nr+','+nc+') path='+path+DIRS[i],7)
        solve(nr,nc,path+DIRS[i])
      }
    }
    vis[r][c]=0
    addStep(r,c,true,path,'Backtrack from ('+r+','+c+')',9)
  }
  solve(0,0,'')
  addStep(-1,-1,false,'','Found '+solutions.length+' path(s): '+solutions.join(', '),11)
  return steps
}