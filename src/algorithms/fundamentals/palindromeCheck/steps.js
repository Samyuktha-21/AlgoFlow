export function generateSteps(inputStr) {
  const s = (typeof inputStr==='string'?inputStr:'racecar').toLowerCase().replace(/[^a-z0-9]/g,'')
  const arr = s.split('')
  const n = arr.length
  const steps = []
  const nums = arr.map(c=>c.charCodeAt(0)-96)
  const mkStep=(l,r,sorted,desc)=>({array:[...nums],comparing:[l,r],swapping:[],sorted,description:desc,extra:{s}})
  steps.push(mkStep(-1,-1,[],`Palindrome check for "${s}". Compare from both ends moving inward.`))
  let l=0,r=n-1,isPalin=true
  while(l<r){
    const match=arr[l]===arr[r]
    steps.push(mkStep(l,r,[],`Compare arr[${l}]="${arr[l]}" and arr[${r}]="${arr[r]}": ${match?'✓ match':'✗ mismatch!'}`))
    if(!match){isPalin=false;break}
    l++;r--
  }
  steps.push(mkStep(-1,-1,isPalin?[...Array(n).keys()]:[],isPalin?`"${s}" IS a palindrome ✓`:`"${s}" is NOT a palindrome ✗`))
  return steps
}