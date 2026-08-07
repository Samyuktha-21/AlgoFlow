/* Rat in a maze: find every path from the top-left to the bottom-right through
   the open cells. Backtracking is what makes it tractable — mark a cell as on
   the current path, explore from it, and on the way back UNMARK it, so the
   same cell is free to be part of a different path. Forgetting that unmark is
   the classic bug: it finds one path and then claims there are no others.

   Input: a grid of 1 (open) and 0 (blocked), rows separated by "/". */

const DEFAULT_MAZE = [[1, 0, 0, 0], [1, 1, 0, 1], [0, 1, 0, 0], [0, 1, 1, 1]]
/* Every step snapshots the whole board and the path count can explode, so the
   trace is bounded rather than left to run. */
const STEP_LIMIT = 300

export function generateSteps(inputGrid) {
  const board = Array.isArray(inputGrid) && inputGrid.length && Array.isArray(inputGrid[0])
    ? inputGrid.map(r => r.map(v => (v ? 1 : 0)))
    : DEFAULT_MAZE.map(r => [...r])

  const rows = board.length
  const cols = board[0].length
  const n = Math.max(rows, cols)
  const vis = Array.from({ length: rows }, () => new Array(cols).fill(0))
  const steps = [], solutions = []
  const DR = [1, -1, 0, 0], DC = [0, 0, -1, 1], DIRS = 'DULR'

  function addStep(r, c, bt, path, description, codeLine) {
    const b = board.map(row => [...row])
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) if (vis[i][j]) b[i][j] = 2
    steps.push({
      board: b, n, highlighted: { row: r, col: c }, conflicts: [],
      backtracking: bt, type: 'nqueens', description, codeLine,
      extra: { path: path || '—', solutions: solutions.length },
    })
  }

  addStep(0, 0, false, '', `Find every path from (0,0) to (${rows - 1},${cols - 1}) through the open cells.`, 3)

  if (!board[0][0] || !board[rows - 1][cols - 1]) {
    addStep(-1, -1, false, '', 'The start or the exit is blocked, so no path can exist.', 7)
    steps[steps.length - 1].result = 'No path (start or exit blocked)'
    return steps
  }

  function solve(r, c, path) {
    if (steps.length > STEP_LIMIT) return
    if (r === rows - 1 && c === cols - 1) {
      solutions.push(path)
      addStep(r, c, false, path, `Reached the exit — path "${path}" works (${solutions.length} found so far).`, 10)
      return
    }
    vis[r][c] = 1
    for (let i = 0; i < 4; i++) {
      const nr = r + DR[i], nc = c + DC[i]
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !vis[nr][nc] && board[nr][nc] === 1) {
        addStep(nr, nc, false, path + DIRS[i], `Move ${DIRS[i]} to (${nr},${nc}). Path so far: ${path + DIRS[i]}`, 17)
        solve(nr, nc, path + DIRS[i])
      }
    }
    /* The unmark is the backtracking step: this cell is on no path now, so it
       must be available to a different one. */
    vis[r][c] = 0
    addStep(r, c, true, path, `Nothing more from (${r},${c}) — unmark it so another path may use it, and step back.`, 19)
  }
  solve(0, 0, '')

  const capped = steps.length > STEP_LIMIT
  addStep(-1, -1, false, '', solutions.length
    ? `Found ${solutions.length} path${solutions.length > 1 ? 's' : ''}: ${solutions.join(', ')}${capped ? ' (trace stopped early)' : ''}`
    : 'No path from the start to the exit.', 7)
  steps[steps.length - 1].result = solutions.length ? `${solutions.length} path(s): ${solutions.join(', ')}` : 'No path exists'
  return steps
}
