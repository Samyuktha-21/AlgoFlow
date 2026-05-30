export function generateSteps(s1Input, s2Input) {
  const s = (typeof s1Input==='string'?s1Input:'anagram').toLowerCase()
  const t = (typeof s2Input==='string'?s2Input:'nagaram').toLowerCase()
  const freq = new Array(26).fill(0)
  const steps = []
  const mkStep=(comparing,desc)=>({array:[...freq],comparing,swapping:[],sorted:[],description:desc,extra:{s,t}})
  steps.push(mkStep([],`Anagram Check: "${s}" vs "${t}". Build frequency map from s, subtract using t.`))
  if(s.length!==t.length){steps.push(mkStep([],`Different lengths (${s.length} vs ${t.length}) → NOT anagrams`));return steps}
  for(let i=0;i<s.length;i++){const c=s.charCodeAt(i)-97;freq[c]++;steps.push(mkStep([c],`Add "${s[i]}": freq["${s[i]}"]=${freq[c]}`))}
  for(let i=0;i<t.length;i++){const c=t.charCodeAt(i)-97;freq[c]--;steps.push(mkStep([c],`Subtract "${t[i]}": freq["${t[i]}"]=${freq[c]}`))}
  const allZero=freq.every(f=>f===0)
  steps.push(mkStep([],allZero?`All freq zero → "${s}" and "${t}" ARE anagrams! ✓`:`Non-zero freq found → NOT anagrams ✗`))
  return steps
}