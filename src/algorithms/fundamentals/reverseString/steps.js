export function generateSteps(inputStr) {
  const s = (typeof inputStr==='string'?inputStr:'hello').toLowerCase()
  const arr = s.split('')
  const n = arr.length
  const steps = []
  const mkStep=(comparing,swapping,desc)=>({array:[...arr].map(c=>c.charCodeAt(0)-96),comparing,swapping,sorted:[],description:desc,extra:{current:arr.join('')}})
  steps.push(mkStep([],[],`Reverse "${s}". Two-pointer swap from both ends toward center.`))
  let l=0,r=n-1
  while(l<r){
    steps.push(mkStep([l,r],[l,r],`Swap arr[${l}]="${arr[l]}" ↔ arr[${r}]="${arr[r]}"`));
    [arr[l],arr[r]]=[arr[r],arr[l]]
    steps.push(mkStep([l,r],[l,r],`After swap: "${arr.join('')}"`))
    l++;r--
  }
  steps.push(mkStep([],[],[...Array(n).keys()],`Reversed: "${arr.join('')}"`))
  return steps
}