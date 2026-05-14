export function generateSteps(inputArray) {
  const text='AABAACAADAABAABA', pattern='AABA'
  const n=text.length, m=pattern.length
  const arr=text.split('').map(c=>c.charCodeAt(0)-64)
  const lps=new Array(m).fill(0), steps=[], found=[]
  const addStep=(i,j,phase,desc,line)=>steps.push({array:[...arr],current:i,pointers:[{index:i,label:'i'},{index:Math.max(0,i-j),label:'match'}],highlight:j>0?Array.from({length:j},(_,k)=>i-j+k+1).filter(x=>x>=0&&x<n):[],sorted:[...found],extra:{phase,i,j,lps:lps.slice(0,m).join(','),matches:found.length},description:desc,codeLine:line})
  addStep(0,0,'Build','KMP: build failure function (LPS) for pattern "'+pattern+'"',2)
  let len=0, fi=1
  while(fi<m){
    if(pattern[fi]===pattern[len]){lps[fi++]=++len;addStep(0,0,'Build','lps['+( fi-1)+']='+lps[fi-1]+': prefix match length='+len,4)}
    else if(len>0){len=lps[len-1];addStep(0,0,'Build','Mismatch: use lps['+(len)+']='+lps[len],5)}
    else{lps[fi++]=0;addStep(0,0,'Build','No match: lps['+(fi-1)+']=0',6)}
  }
  addStep(0,0,'Search','LPS built: ['+lps.join(',')+']  Now search text for "'+pattern+'"',8)
  let i=0, j=0
  while(i<n){
    addStep(i,j,'Search','text['+i+']="'+text[i]+'" vs pattern['+j+']="'+pattern[j]+'"',10)
    if(text[i]===pattern[j]){i++;j++;addStep(i,j,'Search','Match! i='+i+', j='+j,11)}
    if(j===m){found.push(i-j);addStep(i,0,'Search','Pattern found at index '+(i-j)+'!',12);j=lps[j-1]}
    else if(i<n&&text[i]!==pattern[j]){
      if(j>0){addStep(i,j,'Search','Mismatch: skip to lps['+(j-1)+']='+lps[j-1],14);j=lps[j-1]}
      else{addStep(i,0,'Search','j=0 mismatch: advance i',15);i++}
    }
  }
  addStep(n,0,'Done','KMP complete. Pattern found at indices: ['+found.join(',')+']',16)
  return steps
}