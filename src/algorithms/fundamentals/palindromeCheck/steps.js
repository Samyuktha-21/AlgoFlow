export function generateSteps(inputArray) {
  const s='racecar'
  const arr=s.split('').map(c=>c.charCodeAt(0))
  const n=arr.length, steps=[]
  let l=0, r=n-1
  const addStep=(match,desc,line)=>steps.push({array:arr,current:l,pointers:[{index:l,label:'L'},{index:r,label:'R'}],highlight:[l,r],sorted:match?[l,r]:[],extra:{s,isPalin:'?'},description:desc,codeLine:line})
  addStep(true,'Palindrome check for "'+s+'": compare from both ends',2)
  while(l<r){
    addStep(s[l]===s[r],'Compare s['+l+']="'+s[l]+'" and s['+r+']="'+s[r]+'"',4)
    if(s[l]!==s[r]){addStep(false,'Mismatch! "'+s[l]+'" ≠ "'+s[r]+'" → NOT palindrome',5);return steps}
    addStep(true,'Match! Advance L++ and R--',6); l++; r--
  }
  addStep(true,'All pairs matched → "'+s+'" IS a palindrome',8)
  return steps
}