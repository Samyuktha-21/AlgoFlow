/* Hand-authored Python line maps for the `advanced` category.
   See scripts/apply-code-data.cjs. Java line numbers -> equivalent Python line.

   Only kmp is mapped. ahoCorasick, convexHull, fft, rabinKarp, redBlackTree,
   suffixArray and zAlgorithm still ship the placeholder step generator — it
   walks the input array emitting "Processing index N" instead of running the
   algorithm — so there is no real operation for a highlight to point at. They
   need a real generateSteps before a line map means anything. */
module.exports = {
  /* java: 2 = buildLPS(), 7 = extend the current border, 8 = fall back to a
     shorter border, 9 = no border at all, 11 = return the table,
     18 = the text/pattern character comparison, 19 = a full match,
     21 = the mismatch shift, 23 = the scan is finished.

     Java packs `{ i++; j++; }` and `{ lps[i++] = ++len; }` onto single lines
     that Python spreads over three; the map points at the line carrying the
     step's headline effect. Java also handles both mismatch cases on one line
     (`if (j > 0) j = lps[j-1]; else i++;`), which Python splits into an
     elif/else — the fallback branch wins that row since it is the
     interesting one. */
  kmp: {
    lineMap: {
      python: { 2: 1, 7: 7, 8: 10, 9: 12, 11: 14, 18: 20, 19: 23, 21: 26, 23: 29 },
    },
  },
}
