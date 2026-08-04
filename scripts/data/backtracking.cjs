/* Hand-authored Python line maps for the `backtracking` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent Python line;
   `null` = Python genuinely has no equivalent line.

   Every algorithm here follows the same shape — choose, recurse, un-choose —
   so the interesting rows are always the "record a solution", "make a move"
   and "undo the move" lines. */
module.exports = {
  /* java: 3 = combine(), 6 = return the result set, 9 = a full-size path is a
     combination, 11 = choose i, 13 = un-choose it.
     Python nests backtrack() inside combine() and closes over `result`. */
  combinations: {
    lineMap: {
      python: { 3: 1, 6: 12, 9: 5, 11: 8, 13: 10 },
    },
  },

  /* java: 4 = solve(), 7 = return the solutions, 10 = a complete board,
     11 = try each column, 12 = the safety test, 13 = place the queen,
     15 = remove it again.
     Java rescans previous rows in isSafe(); Python keeps three sets and tests
     membership, so java 12's call maps to that inline conflict test — note it
     reads inverted (Python `continue`s on conflict rather than nesting on
     safety), but it is the same decision point. */
  nQueens: {
    lineMap: {
      python: { 4: 1, 7: 17, 10: 6, 11: 8, 12: 9, 13: 12, 15: 14 },
    },
  },

  /* java: 4 = permute(), 6 = return, 9 = a full-length path is a permutation,
     12 = choose nums[i], 14 = un-choose.
     Java marks a `used[]` flag; Python slices the chosen element out of
     `remaining` instead, so the choose/un-choose lines still line up. */
  permutations: {
    lineMap: {
      python: { 4: 1, 6: 12, 9: 5, 12: 8, 14: 10 },
    },
  },

  /* java: 3 = findPaths(), 7 = return every path found, 10 = reached the exit,
     17 = step to a neighbour, 19 = un-mark on the way out.
     Java collects ALL paths as direction strings; Python stops at the first
     and returns the coordinate list, so java 7 maps to that single return. */
  ratInMaze: {
    lineMap: {
      python: { 3: 1, 7: 16, 10: 6, 17: 12, 19: 14 },
    },
  },

  /* java: 2 = the recursive solver, 7 = write a candidate digit,
     9 = erase it again, 15 = every cell filled.
     Python splits the validity test into its own `valid()` helper and nests
     the solver as `backtrack()`, so java 2 maps to that inner definition
     rather than the `solve_sudoku` wrapper. */
  sudokuSolver: {
    lineMap: {
      python: { 2: 11, 7: 17, 9: 20, 15: 22 },
    },
  },

  /* java: 3 = exist(), 8 = nothing matched anywhere, 11 = the whole word was
     consumed, 12 = out of bounds or wrong letter, 14 = mark the cell visited,
     17 = restore it.
     Java scans start cells with a nested for/return; Python folds that scan
     into the `any(...)` generator on its last line. */
  wordSearch: {
    lineMap: {
      python: { 3: 1, 8: 13, 11: 5, 12: 6, 14: 8, 17: 11 },
    },
  },
}
