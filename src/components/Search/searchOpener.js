/* Global reference to the search opener — set by App.jsx.
   Lives outside SearchTrigger.jsx so that file exports components only. */
let _opener = null

export function registerSearchOpener(fn) { _opener = fn }
export function openSearch() { _opener?.() }
