/* Hand-authored Python line maps for the `greedy` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent Python line;
   `null` = Python genuinely has no equivalent line.

   Not mapped here: egyptianFraction, fileMerge, huffman and mstGreedy still
   ship the placeholder step generator (it walks the input array emitting
   "Processing index N" rather than running the algorithm), so there is no
   real operation for a highlight to point at. They need a real generateSteps
   before a map means anything. */
module.exports = {
  /* java: 7 = sort by finish time, 10 = take the next activity,
     11 = the compatibility test, 12 = select it, 16 = return the set.
     Python seeds `chosen` with the first activity and iterates the rest, so
     its loop line stands in for Java's index-array walk. */
  activitySelection: {
    lineMap: {
      python: { 7: 2, 10: 5, 11: 6, 12: 7, 16: 9 },
    },
  },

  /* java: 2 = makeChange(), 5 = how many of this coin fit, 6 = the remainder,
     8 = return the tally.
     Java divides once per denomination; Python subtracts in a while loop, so
     the division maps to that loop header and the modulo to the subtraction. */
  coinChangeGreedy: {
    lineMap: {
      python: { 2: 1, 5: 5, 6: 6, 8: 8 },
    },
  },

  /* java: 7 = sort by value/weight ratio, 9 = take the next item,
     10 = the whole-item branch, 11 = the fractional branch, 13 = return.
     Python unpacks (weight, value) in the loop header rather than building an
     Item[] first. */
  fractionalKnapsack: {
    lineMap: {
      python: { 7: 2, 9: 4, 10: 5, 11: 9, 13: 11 },
    },
  },

  /* java: 7 = sort by profit, 10 = next job, 11 = scan slots backwards from
     the deadline, 12 = claim a free slot, 15 = return count + profit.
     Python returns the filled slots and the profit as a tuple. */
  jobSequencing: {
    lineMap: {
      python: { 7: 2, 10: 6, 11: 7, 12: 8, 15: 12 },
    },
  },
}
