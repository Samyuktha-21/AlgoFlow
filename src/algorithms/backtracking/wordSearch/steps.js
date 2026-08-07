/* Word search: does the word appear as a path of adjacent cells? Each cell is
   usable once per path, which is why the cell is blanked before recursing and
   restored afterwards — without that restore a later path could not reuse it,
   and words that genuinely exist would be reported missing.

   Input: "ROWS,WORD" — grid rows separated by "/", then the word. */
const DEFAULT_GRID=[['A','B','C','E'],['S','F','C','S'],['A','D','E','E']]

function toGrid(v) {
  const raw = Array.isArray(v) ? v.join('') : v
  const text = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  const rows = text.split(/[/;]/).map(r => r.replace(/[^A-Z]/g, '')).filter(Boolean)
  if (!rows.length) return DEFAULT_GRID.map(r => [...r])
  /* Rows are padded to equal width so the board stays rectangular. */
  const w = Math.min(Math.max(...rows.map(r => r.length)), 8)
  return rows.slice(0, 8).map(r => Array.from({ length: w }, (_, i) => r[i] || '.'))
}

export function generateSteps(gridInput, wordInput) {
  const grid=toGrid(gridInput)
  const rawWord = Array.isArray(wordInput) ? wordInput.join('') : wordInput
  const word=(typeof rawWord==='string' ? rawWord.trim().toUpperCase().replace(/[^A-Z]/g,'') : '') || 'ABCCED'
  const R=grid.length, C=grid[0].length
  const board=grid.map(r=>[...r])
  const steps=[], found=[]
  const addStep=(r,c,bt,idx,desc,line)=>{
    const b=grid.map(row=>row.map(ch=>ch.charCodeAt(0)-64))
    steps.push({board:b,n:R,highlighted:{row:r<0?0:r,col:c<0?0:c},conflicts:found.map(([fr,fc])=>({row:fr,col:fc})),backtracking:bt,type:'nqueens',description:desc,codeLine:line,extra:{word,matched:word.slice(0,idx),remaining:word.slice(idx)}})
  }
  let limit=60
  function dfs(r,c,idx){
    if(steps.length>limit) return false
    if(idx===word.length){addStep(r,c,false,idx,'Found "'+word+'"!',11);return true}
    if(r<0||r>=R||c<0||c>=C||board[r][c]===null||board[r][c]!==word[idx]){addStep(r<0?0:r,c<0?0:c,true,idx,'Invalid or mismatch at ('+r+','+c+')',12);return false}
    addStep(r,c,false,idx,'Match "'+word[idx]+'" at ('+r+','+c+'). Progress: "'+word.slice(0,idx+1)+'"',14)
    found.push([r,c])
    const orig=board[r][c]; board[r][c]=null
    const res=dfs(r+1,c,idx+1)||dfs(r-1,c,idx+1)||dfs(r,c+1,idx+1)||dfs(r,c-1,idx+1)
    board[r][c]=orig; found.pop()
    if(!res) addStep(r,c,true,idx,'Backtrack from ('+r+','+c+')',17)
    return res
  }
  addStep(0,0,false,0,'Word Search for "'+word+'" in grid',3)
  let foundWord=false
  outer: for(let r=0;r<R;r++) for(let c=0;c<C;c++) if(grid[r][c]===word[0]&&!foundWord) {foundWord=dfs(r,c,0);if(foundWord) break outer}
  if(!foundWord) addStep(-1,-1,false,0,'"'+word+'" is not in the grid.',8)
  steps[steps.length-1].result = foundWord ? '"'+word+'" found' : '"'+word+'" not found'
  return steps
}