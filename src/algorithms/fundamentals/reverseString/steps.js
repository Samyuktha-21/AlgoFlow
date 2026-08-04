export function generateSteps(inputStr) {
  const s = (typeof inputStr==='string'?inputStr:'hello').toLowerCase()
  const arr = s.split('')
  const n = arr.length
  const steps = []
  const mkStep=(comparing,swapping,desc,codeLine,sorted=[])=>({array:[...arr].map(c=>c.charCodeAt(0)-96),comparing,swapping,sorted,description:desc,extra:{current:arr.join('')},codeLine})
  steps.push(mkStep([],[],`Reverse "${s}". Two-pointer swap from both ends toward center.`,3))
  let l=0,r=n-1
  while(l<r){
    steps.push(mkStep([l,r],[l,r],`Swap arr[${l}]="${arr[l]}" ↔ arr[${r}]="${arr[r]}"`,5));
    [arr[l],arr[r]]=[arr[r],arr[l]]
    steps.push(mkStep([l,r],[l,r],`After swap: "${arr.join('')}"`,5))
    l++;r--
  }
  steps.push(mkStep([],[],`Reversed: "${arr.join('')}"`,11,[...Array(n).keys()]))
  return steps
}