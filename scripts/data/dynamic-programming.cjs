/* Hand-authored Python line maps for the `dynamic-programming` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent Python line;
   `null` = Python genuinely has no equivalent line. */
module.exports = {
  /* java: 5 = fill the table with "unreachable", 7 = walk each amount,
     9 = relax with one coin, 10 = read the answer back.
     Java loops amount-outer / coin-inner; Python loops coin-outer /
     amount-inner. Same table, transposed traversal — java 7's amount walk is
     Python's inner range, which is why these two rows look out of order. */
  coinChangeDP: {
    lineMap: {
      python: { 5: 2, 7: 5, 9: 6, 10: 7 },
    },
  },

  /* java: 2 = minDistance(), 6 = seed the first row, 7 = walk the rows,
     9 = the character comparison that picks copy-vs-edit. */
  editDistance: {
    lineMap: {
      python: { 2: 1, 6: 7, 7: 8, 9: 10 },
    },
  },

  /* Java solves the "how many floors can m moves cover" formulation; the
     shipped Python used the classic O(k·n²) floor-splitting recurrence
     instead, which has no line answering to Java's move counter. Replaced
     with a direct translation so the two actually correspond.

     java: 2 = superEggDrop(), 6 = keep going until n floors are covered,
     9 = the move recurrence, 11 = return the move count. */
  eggDrop: {
    snippets: {
      python: `def super_egg_drop(k, n):
    dp = [[0] * (k + 1) for _ in range(n + 1)]
    m = 0
    while dp[m][k] < n:
        m += 1
        for j in range(1, k + 1):
            dp[m][j] = dp[m-1][j-1] + dp[m-1][j] + 1
    return m


print(super_egg_drop(2, 100))
print(super_egg_drop(3, 14))`,
    },
    lineMap: {
      python: { 2: 1, 6: 4, 9: 7, 11: 8 },
    },
  },

  /* java: 2 = fib(), 5 = seed dp[0] and dp[1], 7 = the recurrence,
     8 = return dp[n].
     Python's list is already zero-filled, so only dp[1] needs seeding and
     both of Java's base cases land on that one line. */
  fibDP: {
    lineMap: {
      python: { 2: 1, 5: 5, 7: 7, 8: 8 },
    },
  },

  /* java: 3 = allocate the table, 5 = walk capacities, 6 = skip item i,
     8 = take it if it fits, 11 = return the corner cell. */
  knapsack01: {
    lineMap: {
      python: { 3: 3, 5: 5, 6: 6, 8: 8, 11: 9 },
    },
  },

  /* java: 2 = lcsLength(), 5 = walk s1, 6 = walk s2, 8 = extend on a match.
     Java writes the whole cell as one ternary spanning lines 7-9; Python
     splits it into an if/else, so the match branch is the honest target. */
  lcs: {
    lineMap: {
      python: { 2: 1, 5: 4, 6: 5, 8: 7 },
    },
  },

  /* java: 3 = lengthOfLIS(), 6 = every element starts as a run of 1,
     8 = walk i, 10 = extend from a smaller earlier element,
     12 = track the best so far, 14 = return it.
     Python keeps no running maximum — it calls max(dp) at the end — so
     java 12 has no equivalent line and java 14 maps to that final max(). */
  lis: {
    lineMap: {
      python: { 3: 1, 6: 4, 8: 5, 10: 8, 12: null, 14: 9 },
    },
  },

  /* java: 2 = mcm(), 4 = the zero-initialised table (the length-1 diagonal),
     9 = cost of splitting at k, 10 = keep the cheaper split,
     13 = the whole-chain answer. */
  matrixChain: {
    lineMap: {
      python: { 2: 1, 4: 3, 9: 9, 10: 10, 13: 11 },
    },
  },

  /* java: 2 = maxProfit(), 4 = walk rod lengths, 6 = best price for this cut,
     7 = return the best revenue. */
  rodCutting: {
    lineMap: {
      python: { 2: 1, 4: 3, 6: 5, 7: 6 },
    },
  },

  /* java: 2 = climbStairs(), 5 = the two base cases, 6 = the recurrence,
     7 = return dp[n].
     Java fills an array; Python rolls two variables forward, so its seed line
     carries both base cases and the "table" is just those two names. */
  staircase: {
    lineMap: {
      python: { 2: 1, 5: 4, 6: 6, 7: 7 },
    },
  },

  /* java: 5 = sum 0 is always reachable, 9 = reachable by taking arr[i-1],
     11 = read the answer.
     Java keeps the full 2-D table; Python compresses it to one row scanned
     backwards, so both of Java's skip/take lines collapse onto that update. */
  subsetSum: {
    lineMap: {
      python: { 5: 3, 9: 6, 11: 7 },
    },
  },

  /* java: 7 = the empty prefix is always breakable, 8 = walk prefixes,
     10 = a split point that works, 11 = return dp[n]. */
  wordBreak: {
    lineMap: {
      python: { 7: 4, 8: 5, 10: 7, 11: 10 },
    },
  },
}
