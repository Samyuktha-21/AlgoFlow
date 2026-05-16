import { useEffect, useRef } from 'react'

const R = 22 // kept for external usage if any

/* ════════════════════════════════════════════════════
   CANVAS PARTICLE CONFIGS  (14 themes — new identities)
════════════════════════════════════════════════════ */
const CONFIGS = {
  water:    { bg:'linear-gradient(180deg,#e0f2fe 0%,#bae6fd 35%,#7dd3fc 65%,#0ea5e9 100%)', count:140, type:'snow'     },
  network:  { bg:'radial-gradient(ellipse at center,#1e3a5f 0%,#0f172a 60%,#000000 100%)',  count:220, type:'stars'    },
  forest:   { bg:'linear-gradient(180deg,#4ade80 0%,#16a34a 35%,#166534 70%,#14532d 100%)', count:80,  type:'leaves'   },
  light:    { bg:'linear-gradient(180deg,#06091a 0%,#0a0f1e 45%,#0f172a 75%,#1a2540 100%)', count:160, type:'rain'     },
  compass:  { bg:'linear-gradient(180deg,#0ea5e9 0%,#0284c7 35%,#0369a1 65%,#0c4a6e 100%)', count:80,  type:'bubbles'  },
  puzzle:   { bg:'linear-gradient(135deg,#fdf4ff 0%,#f0e6ff 40%,#e8d5ff 70%,#ddd0ff 100%)', count:70,  type:'butterflies'},
  chain:    { bg:'linear-gradient(180deg,#fff0f5 0%,#fce7f3 40%,#fbcfe8 70%,#f9a8d4 100%)', count:100, type:'blossoms' },
  books:    { bg:'linear-gradient(180deg,#bfdbfe 0%,#93c5fd 35%,#60a5fa 65%,#3b82f6 100%)', count:12,  type:'clouds'   },
  cabinet:  { bg:'linear-gradient(180deg,#064e3b 0%,#065f46 40%,#047857 70%,#059669 100%)', count:45,  type:'flowers'  },
  mountain: { bg:'linear-gradient(180deg,#1c0a00 0%,#2d1000 40%,#1a0800 70%,#0a0300 100%)', count:90,  type:'lava'     },
  target:   { bg:'linear-gradient(180deg,#020617 0%,#050d1e 50%,#0a1628 100%)',              count:120, type:'stars'    },
  blocks:   { bg:'linear-gradient(180deg,#0f172a 0%,#1e293b 40%,#334155 60%,#1e293b 100%)', count:40,  type:'streaks'  },
  maze:     { bg:'linear-gradient(180deg,#4a0020 0%,#7f1d4a 40%,#9d174d 70%,#4a0020 100%)', count:70,  type:'hearts'   },
  circuit:  { bg:'radial-gradient(circle,#0f1629 0%,#030712 80%)',                          count:50,  type:'plasma'   },
}

/* ════════════════════════════════════════════════════
   PARTICLE CREATORS
════════════════════════════════════════════════════ */
function mkFire(w,h,n){return Array.from({length:n},()=>mkFireP(w,h))}
function mkFireP(w,h){return{x:Math.random()*w,y:h+Math.random()*60,vx:(Math.random()-.5)*1.4,vy:-(1.2+Math.random()*3.5),size:4+Math.random()*22,life:Math.random()*.3,decay:.005+Math.random()*.009,hue:Math.random()*22,alpha:.45+Math.random()*.4}}
function mkRain(w,h,n){return Array.from({length:n},()=>mkRainP(w,h))}
function mkRainP(w,h){return{x:Math.random()*w,y:Math.random()*h,vy:9+Math.random()*7,vx:1.2+Math.random()*1.5,len:10+Math.random()*14,alpha:.1+Math.random()*.2}}
function mkLava(w,h,n){return Array.from({length:n},()=>mkLavaP(w,h))}
function mkLavaP(w,h){const angle=-Math.PI/2+(Math.random()-.5)*1.3,speed=2+Math.random()*7;return{x:w/2+(Math.random()-.5)*100,y:h*.9,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,gravity:.11,size:3+Math.random()*15,hue:Math.random()*22,alpha:.55+Math.random()*.35,isEmber:Math.random()<.28}}
function mkBubbles(w,h,n){return Array.from({length:n},()=>({x:Math.random()*w,y:h+Math.random()*h*.6,r:2+Math.random()*9,vx:(Math.random()-.5)*.35,vy:-(0.5+Math.random()*1.3),wobble:Math.random()*Math.PI*2,ws:.015+Math.random()*.025,alpha:.12+Math.random()*.3}))}
function mkStars(w,h,n){const C=['#ffffff','#60a5fa','#a78bfa','#38bdf8','#fcd34d','#f9fafb'];return Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,r:.4+Math.random()*2.4,brightness:.25+Math.random()*.75,phase:Math.random()*Math.PI*2,speed:.007+Math.random()*.016,color:C[Math.floor(Math.random()*C.length)],vx:(Math.random()-.5)*.04,vy:(Math.random()-.5)*.04,cur:0}))}
function mkLeaves(w,h,n){const C=['#22c55e','#16a34a','#15803d','#86efac','#4ade80','#f59e0b','#d97706','#a3e635','#bbf7d0'];return Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*1.4,vy:.4+Math.random()*1.3,rotation:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*.04,size:5+Math.random()*11,phase:Math.random()*Math.PI*2,swingSpeed:.012+Math.random()*.022,color:C[Math.floor(Math.random()*C.length)],alpha:.45+Math.random()*.55}))}
function mkSnow(w,h,n){return Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,r:1+Math.random()*3,vx:(Math.random()-.5)*.6,vy:.3+Math.random()*.9,alpha:.3+Math.random()*.6,phase:Math.random()*Math.PI*2,drift:Math.random()*40-20}))}
function mkFireflies(w,h,n){return Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,phase:Math.random()*Math.PI*2,speed:.02+Math.random()*.04,r:1.5+Math.random()*2,alpha:0,wobble:Math.random()*Math.PI*2,wobbleSpeed:.01+Math.random()*.01,hue:58+Math.random()*30}))}
function mkClouds(w,h,n){return Array.from({length:n},()=>({x:Math.random()*(w+200)-100,y:Math.random()*h*.7,vx:.15+Math.random()*.3,size:70+Math.random()*110,alpha:.3+Math.random()*.3,puffs:Array.from({length:5+Math.floor(Math.random()*4)},()=>({dx:(Math.random()-.5)*90,dy:(Math.random()-.5)*22,r:22+Math.random()*45}))}))}
function mkBlossoms(w,h,n){return Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,vx:.2+Math.random()*.8,vy:.3+Math.random()*.7,rotation:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*.035,size:5+Math.random()*9,alpha:.45+Math.random()*.45,phase:Math.random()*Math.PI*2,wobbleSpeed:.018+Math.random()*.018,pinkness:310+Math.random()*30}))}
function mkFlowers(w,h,n){const H=[0,30,60,120,200,280,320];return Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,size:10+Math.random()*22,hue:H[Math.floor(Math.random()*H.length)],alpha:.2+Math.random()*.3,phase:Math.random()*Math.PI*2,bloomSpeed:.007+Math.random()*.01,rotation:Math.random()*Math.PI*2,rotSpeed:(Math.random()-.5)*.004}))}
function mkButterflies(w,h,n){return Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*1.2,vy:(Math.random()-.5)*1.2,size:9+Math.random()*16,hue:Math.floor(Math.random()*360),wingPhase:Math.random()*Math.PI*2,wingSpeed:.09+Math.random()*.07,wobble:Math.random()*Math.PI*2,wobbleSpeed:.012+Math.random()*.014,alpha:.5+Math.random()*.35}))}
function mkPlasma(w,h,n){const C=['#a78bfa','#22d3ee','#f0abfc','#4ade80','#60a5fa'];return Array.from({length:n},(i)=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*2.5,vy:(Math.random()-.5)*2.5,r:1.2+Math.random()*2.2,color:C[Math.floor(Math.random()*C.length)],phase:Math.random()*Math.PI*2,speed:.04+Math.random()*.06,alpha:.3+Math.random()*.5,trail:[]}))}
function mkHearts(w,h,n){return Array.from({length:n},()=>({x:Math.random()*w,y:h+Math.random()*60,vx:(Math.random()-.5)*1.2,vy:-(0.6+Math.random()*1.8),size:7+Math.random()*16,hue:325+Math.random()*40,alpha:.45+Math.random()*.45,wobble:Math.random()*Math.PI*2,wobbleSpeed:.015+Math.random()*.015,rotation:(Math.random()-.5)*.5}))}
function mkStreaks(w,h,n){return Array.from({length:n},()=>mkStreakP(w,h))}
function mkStreakP(w,h){const go=Math.random()>.5;return{x:go?-50:w+50,y:h*(.35+Math.random()*.5),vx:go?(2+Math.random()*5):-(2+Math.random()*5),len:18+Math.random()*38,color:Math.random()>.5?'#fbbf24':'#f9fafb',alpha:.25+Math.random()*.45}}

/* ════════════════════════════════════════════════════
   PARTICLE UPDATERS
════════════════════════════════════════════════════ */
function tickFire(p,w,h){p.x+=p.vx+Math.sin(p.life*9)*.7;p.y+=p.vy;p.life+=p.decay;p.size*=.993;p.hue=Math.min(58,p.hue+.45);if(p.y<-p.size*3||p.life>=1||p.size<.4)Object.assign(p,mkFireP(w,h))}
function tickRain(p,w,h){p.x+=p.vx;p.y+=p.vy;if(p.y>h+20){p.y=-20;p.x=Math.random()*w}if(p.x>w+10)p.x=0}
function tickLava(p,w,h){p.vx*=.98;p.vy+=p.gravity;p.x+=p.vx;p.y+=p.vy;p.hue=Math.min(55,p.hue+.35);p.size*=.996;if(p.y>h+20||p.size<.4)Object.assign(p,mkLavaP(w,h))}
function tickBubble(p,w,h){p.wobble+=p.ws;p.x+=p.vx+Math.sin(p.wobble)*.55;p.y+=p.vy;if(p.y<-p.r*3){p.y=h+p.r*2;p.x=Math.random()*w}if(p.x<-p.r)p.x=w+p.r;if(p.x>w+p.r)p.x=-p.r}
function tickStar(p,w,h){p.phase+=p.speed;p.cur=p.brightness*(0.3+0.7*Math.abs(Math.sin(p.phase)));p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0}
function tickLeaf(p,w,h){p.phase+=p.swingSpeed;p.x+=p.vx+Math.sin(p.phase)*.8;p.y+=p.vy;p.rotation+=p.rotSpeed;if(p.y>h+20){p.y=-20;p.x=Math.random()*w;p.rotation=Math.random()*Math.PI*2}if(p.x<-20)p.x=w+20;if(p.x>w+20)p.x=-20}
function tickSnow(p,w,h){p.phase+=.015;p.x+=p.vx+Math.sin(p.phase)*.3;p.y+=p.vy;if(p.y>h+10){p.y=-10;p.x=Math.random()*w}if(p.x<0)p.x=w;if(p.x>w)p.x=0}
function tickFirefly(p,w,h){p.phase+=p.speed;p.wobble+=p.wobbleSpeed;p.alpha=.35+.65*Math.abs(Math.sin(p.phase));p.x+=p.vx+Math.sin(p.wobble)*.5;p.y+=p.vy+Math.cos(p.wobble*.7)*.4;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0}
function tickCloud(p,w){p.x+=p.vx;if(p.x>w+p.size+150)p.x=-p.size-150}
function tickBlossom(p,w,h){p.phase+=p.wobbleSpeed;p.x+=p.vx+Math.sin(p.phase)*1.1;p.y+=p.vy;p.rotation+=p.rotSpeed;if(p.y>h+20){p.y=-20;p.x=Math.random()*w}if(p.x>w+20)p.x=-20;if(p.x<-20)p.x=w+20}
function tickFlower(p){p.phase+=p.bloomSpeed;p.rotation+=p.rotSpeed}
function tickButterfly(p,w,h){p.wingPhase+=p.wingSpeed;p.wobble+=p.wobbleSpeed;p.x+=p.vx+Math.sin(p.wobble)*1.4;p.y+=p.vy+Math.cos(p.wobble*.7)*.9;if(p.x<-40)p.x=w+40;if(p.x>w+40)p.x=-40;if(p.y<-40)p.y=h+40;if(p.y>h+40)p.y=-40}
function tickPlasma(p,w,h){p.trail.push({x:p.x,y:p.y});if(p.trail.length>8)p.trail.shift();p.phase+=p.speed;p.vx+=(Math.random()-.5)*.4;p.vy+=(Math.random()-.5)*.4;p.vx*=.97;p.vy*=.97;p.x+=p.vx;p.y+=p.vy;if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)}if(p.x>w){p.x=w;p.vx=-Math.abs(p.vx)}if(p.y<0){p.y=0;p.vy=Math.abs(p.vy)}if(p.y>h){p.y=h;p.vy=-Math.abs(p.vy)}}
function tickHeart(p,w,h){p.wobble+=p.wobbleSpeed;p.x+=p.vx+Math.sin(p.wobble)*.6;p.y+=p.vy;p.alpha-=.003;if(p.y<-p.size*3||p.alpha<=0){p.y=h+p.size;p.x=Math.random()*w;p.alpha=.45+Math.random()*.45;p.vy=-(0.6+Math.random()*1.8)}}
function tickStreak(p,w,h){p.x+=p.vx;if(p.vx>0&&p.x>w+60)Object.assign(p,mkStreakP(w,h),{x:-50,vx:Math.abs(p.vx)});if(p.vx<0&&p.x<-60)Object.assign(p,mkStreakP(w,h),{x:w+50,vx:-Math.abs(p.vx)})}

/* ════════════════════════════════════════════════════
   PARTICLE DRAWERS
════════════════════════════════════════════════════ */
function drawFire(ctx,p){const a=(1-p.life)*p.alpha;if(a<=.01)return;ctx.save();ctx.globalAlpha=a;const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);g.addColorStop(0,`hsla(${p.hue+48},100%,90%,1)`);g.addColorStop(.3,`hsla(${p.hue+25},100%,65%,.8)`);g.addColorStop(1,`hsla(${p.hue},90%,35%,0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawRain(ctx,p){ctx.save();ctx.globalAlpha=p.alpha;ctx.strokeStyle='rgba(147,197,253,0.75)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+p.vx*.7,p.y+p.len);ctx.stroke();ctx.restore()}
function drawLava(ctx,p){ctx.save();ctx.globalAlpha=p.alpha;if(p.isEmber){ctx.shadowBlur=8;ctx.shadowColor=`hsla(${p.hue+20},100%,70%,1)`;ctx.fillStyle=`hsla(${p.hue+40},100%,85%,1)`;ctx.beginPath();ctx.arc(p.x,p.y,p.size*.4,0,Math.PI*2);ctx.fill()}else{const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);g.addColorStop(0,`hsla(${p.hue+50},100%,88%,1)`);g.addColorStop(.4,`hsla(${p.hue+22},100%,65%,.8)`);g.addColorStop(1,`hsla(${p.hue},80%,35%,0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()}ctx.restore();ctx.shadowBlur=0;ctx.globalAlpha=1}
function drawBubble(ctx,p){ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.strokeStyle=`rgba(186,230,253,${p.alpha})`;ctx.lineWidth=.8;ctx.stroke();ctx.beginPath();ctx.arc(p.x-p.r*.32,p.y-p.r*.32,p.r*.24,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${p.alpha*.65})`;ctx.fill()}
function drawStar(ctx,p){const a=p.cur;if(p.r>1.4){const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);g.addColorStop(0,p.color+Math.floor(a*80).toString(16).padStart(2,'0'));g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*5,0,Math.PI*2);ctx.fill()}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.color+Math.floor(a*255).toString(16).padStart(2,'0');ctx.fill()}
function drawConstellationLines(ctx,stars){const MAX=70;for(let i=0;i<Math.min(stars.length,80);i++){for(let j=i+1;j<Math.min(stars.length,80);j++){const dx=stars[i].x-stars[j].x,dy=stars[i].y-stars[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<MAX){const a=(1-d/MAX)*.12;ctx.beginPath();ctx.moveTo(stars[i].x,stars[i].y);ctx.lineTo(stars[j].x,stars[j].y);ctx.strokeStyle=`rgba(96,165,250,${a})`;ctx.lineWidth=.4;ctx.stroke()}}}}
function drawLeaf(ctx,p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.globalAlpha=p.alpha;ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(0,-p.size/2);ctx.bezierCurveTo(p.size/2.5,-p.size/4,p.size/2.5,p.size/4,0,p.size/2);ctx.bezierCurveTo(-p.size/2.5,p.size/4,-p.size/2.5,-p.size/4,0,-p.size/2);ctx.fill();ctx.restore();ctx.globalAlpha=1}
function drawSnow(ctx,p){ctx.save();ctx.shadowBlur=3;ctx.shadowColor='rgba(150,220,255,0.5)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(200,235,255,${p.alpha})`;ctx.fill();ctx.restore()}
function drawFirefly(ctx,p){if(p.alpha<.05)return;const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);g.addColorStop(0,`hsla(${p.hue||65},100%,70%,${p.alpha})`);g.addColorStop(.4,`hsla(${p.hue||65},100%,70%,${p.alpha*.3})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2);ctx.fill();ctx.fillStyle=`rgba(255,255,255,${p.alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}
function drawCloud(ctx,p){ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);for(const puff of p.puffs){const g=ctx.createRadialGradient(puff.dx,puff.dy,0,puff.dx,puff.dy,puff.r);g.addColorStop(0,'rgba(255,255,255,0.9)');g.addColorStop(.6,'rgba(230,245,255,0.6)');g.addColorStop(1,'rgba(190,220,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(puff.dx,puff.dy,puff.r,0,Math.PI*2);ctx.fill()}ctx.restore();ctx.globalAlpha=1}
function drawBlossom(ctx,p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.globalAlpha=p.alpha;for(let i=0;i<5;i++){ctx.save();ctx.rotate((i/5)*Math.PI*2);ctx.fillStyle=`hsla(${p.pinkness},80%,82%,0.88)`;ctx.beginPath();ctx.ellipse(0,-p.size*.55,p.size*.3,p.size*.55,0,0,Math.PI*2);ctx.fill();ctx.restore()}ctx.fillStyle='rgba(255,240,180,0.85)';ctx.beginPath();ctx.arc(0,0,p.size*.2,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1}
function drawFlower(ctx,p){const bloom=.6+.4*Math.abs(Math.sin(p.phase));ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.globalAlpha=p.alpha*bloom;for(let i=0;i<6;i++){ctx.save();ctx.rotate((i/6)*Math.PI*2);const g=ctx.createRadialGradient(0,-p.size*.55,0,0,-p.size*.55,p.size);g.addColorStop(0,`hsla(${p.hue},100%,75%,.9)`);g.addColorStop(.5,`hsla(${p.hue+20},90%,60%,.6)`);g.addColorStop(1,`hsla(${p.hue+40},80%,45%,0)`);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,-p.size*.55,p.size*.3,p.size*.6,0,0,Math.PI*2);ctx.fill();ctx.restore()}const cg=ctx.createRadialGradient(0,0,0,0,0,p.size*.22);cg.addColorStop(0,'#fef08a');cg.addColorStop(1,'#f59e0b');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(0,0,p.size*.22,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1}
function drawButterfly(ctx,p){const s=p.size,wingX=Math.abs(Math.cos(p.wingPhase));ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=p.alpha;ctx.save();ctx.scale(-wingX,1);const lg=ctx.createRadialGradient(-s*.4,-s*.2,0,-s*.4,-s*.2,s);lg.addColorStop(0,`hsla(${p.hue},100%,80%,.9)`);lg.addColorStop(.5,`hsla(${p.hue+30},90%,65%,.6)`);lg.addColorStop(1,`hsla(${p.hue+60},80%,50%,0)`);ctx.fillStyle=lg;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-s,-s*.8,-s*1.4,s*.1,0,s*.28);ctx.fill();ctx.restore();ctx.save();ctx.scale(wingX,1);const rg=ctx.createRadialGradient(s*.4,-s*.2,0,s*.4,-s*.2,s);rg.addColorStop(0,`hsla(${p.hue},100%,80%,.9)`);rg.addColorStop(.5,`hsla(${p.hue+30},90%,65%,.6)`);rg.addColorStop(1,`hsla(${p.hue+60},80%,50%,0)`);ctx.fillStyle=rg;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(s,-s*.8,s*1.4,s*.1,0,s*.28);ctx.fill();ctx.restore();ctx.fillStyle=`hsla(${p.hue+180},50%,20%,.7)`;ctx.beginPath();ctx.ellipse(0,0,2,s*.32,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1}
function drawPlasma(ctx,p){const a=p.alpha*(0.5+.5*Math.abs(Math.sin(p.phase)));p.trail.forEach((pt,i)=>{const ta=(i/p.trail.length)*a*.35;ctx.beginPath();ctx.arc(pt.x,pt.y,p.r*.5,0,Math.PI*2);ctx.fillStyle=p.color+Math.floor(ta*255).toString(16).padStart(2,'0');ctx.fill()});ctx.save();ctx.shadowBlur=14;ctx.shadowColor=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.color+Math.floor(a*255).toString(16).padStart(2,'0');ctx.fill();ctx.restore()}
function drawHeart(ctx,p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.globalAlpha=p.alpha;const s=p.size/12;ctx.beginPath();ctx.moveTo(0,s*4);ctx.bezierCurveTo(-s*12,-s*2,-s*12,-s*12,0,-s*6);ctx.bezierCurveTo(s*12,-s*12,s*12,-s*2,0,s*4);ctx.closePath();const g=ctx.createRadialGradient(0,-s*2,0,0,0,s*12);g.addColorStop(0,`hsla(${p.hue},100%,82%,1)`);g.addColorStop(.5,`hsla(${p.hue-10},100%,62%,.8)`);g.addColorStop(1,`hsla(${p.hue-20},100%,42%,.3)`);ctx.fillStyle=g;ctx.shadowBlur=10;ctx.shadowColor=`hsla(${p.hue},100%,62%,.5)`;ctx.fill();ctx.restore();ctx.shadowBlur=0;ctx.globalAlpha=1}
function drawStreak(ctx,p){ctx.save();ctx.globalAlpha=p.alpha;const x0=p.vx>0?p.x-p.len:p.x,x1=p.vx>0?p.x:p.x+p.len;const grad=ctx.createLinearGradient(x0,p.y,x1,p.y);grad.addColorStop(0,p.color+'00');grad.addColorStop(1,p.color);ctx.fillStyle=grad;ctx.fillRect(x0,p.y-1.5,p.len,3);ctx.restore()}

/* ════════════════════════════════════════════════════
   CANVAS HOOK
════════════════════════════════════════════════════ */
function useParticleCanvas(type, count, themeId) {
  const ref     = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = 0, h = 0, particles = [], t = 0

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      switch (type) {
        case 'fire':        particles = mkFire(w, h, count);        break
        case 'rain':        particles = mkRain(w, h, count);        break
        case 'lava':        particles = mkLava(w, h, count);        break
        case 'bubbles':     particles = mkBubbles(w, h, count);     break
        case 'stars':       particles = mkStars(w, h, count);       break
        case 'leaves':      particles = mkLeaves(w, h, count);      break
        case 'snow':        particles = mkSnow(w, h, count);        break
        case 'fireflies':   particles = mkFireflies(w, h, count);   break
        case 'clouds':      particles = mkClouds(w, h, count);      break
        case 'blossoms':    particles = mkBlossoms(w, h, count);    break
        case 'flowers':     particles = mkFlowers(w, h, count);     break
        case 'butterflies': particles = mkButterflies(w, h, count); break
        case 'plasma':      particles = mkPlasma(w, h, count);      break
        case 'hearts':      particles = mkHearts(w, h, count);      break
        case 'streaks':     particles = mkStreaks(w, h, count);      break
        default:            particles = mkStars(w, h, count)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      t += 0.016

      switch (type) {
        case 'fire':
          particles.forEach(p => { tickFire(p, w, h); drawFire(ctx, p) }); break
        case 'rain':
          particles.forEach(p => { tickRain(p, w, h); drawRain(ctx, p) }); break
        case 'lava':
          particles.forEach(p => { tickLava(p, w, h); drawLava(ctx, p) }); break
        case 'bubbles':
          particles.forEach(p => { tickBubble(p, w, h); drawBubble(ctx, p) }); break
        case 'stars':
          particles.forEach(p => { tickStar(p, w, h); drawStar(ctx, p) })
          drawConstellationLines(ctx, particles.filter(p => p.r > 1.5)); break
        case 'leaves':
          particles.forEach(p => { tickLeaf(p, w, h); drawLeaf(ctx, p) }); break
        case 'snow':
          particles.forEach(p => { tickSnow(p, w, h); drawSnow(ctx, p) }); break
        case 'fireflies':
          particles.forEach(p => { tickFirefly(p, w, h); drawFirefly(ctx, p) }); break
        case 'clouds':
          particles.forEach(p => { tickCloud(p, w); drawCloud(ctx, p) }); break
        case 'blossoms':
          particles.forEach(p => { tickBlossom(p, w, h); drawBlossom(ctx, p) }); break
        case 'flowers':
          particles.forEach(p => { tickFlower(p); drawFlower(ctx, p) }); break
        case 'butterflies':
          particles.forEach(p => { tickButterfly(p, w, h); drawButterfly(ctx, p) }); break
        case 'plasma':
          particles.forEach(p => { tickPlasma(p, w, h); drawPlasma(ctx, p) }); break
        case 'hearts':
          particles.forEach(p => { tickHeart(p, w, h); drawHeart(ctx, p) }); break
        case 'streaks':
          particles.forEach(p => { tickStreak(p, w, h); drawStreak(ctx, p) }); break
      }

      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [type, count, themeId])
  return ref
}

/* ════════════════════════════════════════════════════
   MOUSE CANVAS (water ripple)
════════════════════════════════════════════════════ */
function useMouseCanvas(themeId) {
  const ref     = useRef(null)
  const animRef = useRef(null)
  const ripples = useRef([])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (themeId !== 'water' && themeId !== 'network' && themeId !== 'compass') return
    const ctx = canvas.getContext('2d')
    let w = 0, h = 0

    const resize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      if (themeId === 'compass') {
        ripples.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, maxR: 80, alpha: 0.5 })
        if (ripples.current.length > 12) ripples.current.shift()
      }
    }
    canvas.parentElement?.addEventListener('mousemove', onMove)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ripples.current = ripples.current.filter(rp => rp.alpha > 0.01)
      for (const rp of ripples.current) {
        rp.r += 1.8; rp.alpha *= 0.96
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(186,230,253,${rp.alpha})`; ctx.lineWidth = 1.5; ctx.stroke()
      }
      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.parentElement?.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [themeId])
  return ref
}

/* ════════════════════════════════════════════════════
   SVG THEME OVERLAYS  (14 themes)
════════════════════════════════════════════════════ */

function SnowOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {/* Blizzard wind lines */}
      {[12,28,45,62,78].map((y,i) => (
        <div key={i} className="absolute left-0 right-0" style={{
          top:`${y}%`,height:2,
          background:`linear-gradient(90deg,transparent,rgba(255,255,255,${0.12+i*.04}),transparent)`,
          animation:`aurora-wave ${3+i*.5}s ease-in-out ${i*.4}s infinite`}} />
      ))}
      {/* Snow ground at bottom */}
      <div className="absolute bottom-0 left-0 right-0" style={{height:22,
        background:'rgba(255,255,255,0.7)',borderRadius:'40% 40% 0 0'}} />
      {/* Sky blue glow top */}
      <div className="absolute top-0 left-0 right-0" style={{height:'35%',
        background:'radial-gradient(ellipse at 50% 0%,rgba(224,242,254,0.25) 0%,transparent 70%)'}} />
    </div>
  )
}

function StormOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {/* Storm cloud masses */}
      {[[10,15,240,140],[42,10,260,160],[72,20,200,130]].map(([x,y,w2,h2],i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:`${y}%`,width:w2,height:h2,
          background:'rgba(18,28,55,0.65)',filter:'blur(22px)',transform:'translate(-50%,-50%)',
          animation:`nebula-breathe ${5+i*1.5}s ease-in-out ${i*1.2}s infinite`}} />
      ))}
      {/* Lightning glow */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 10%,rgba(147,197,253,0.04) 0%,transparent 55%)',
        animation:'lightning-hint 7s ease-in-out infinite'}} />
    </div>
  )
}

function OceanOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {/* Caustic shimmer */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 30% 25%,rgba(186,230,253,0.08) 0%,transparent 55%)',
        animation:'caustic-flow 7s ease-in-out infinite'}} />
      {/* Light rays */}
      {[15,35,55,72].map((x,i) => (
        <div key={i} className="absolute top-0" style={{
          left:`${x}%`,width:38+i*10,height:'80%',
          background:'linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 80%)',
          transform:`rotate(${(i%2===0?-1:1)*(3+i*3)}deg)`,transformOrigin:'top center',
          animation:`light-ray-breathe ${4+i*.6}s ease-in-out ${i*.8}s infinite`}} />
      ))}
      {/* Wave layers at bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{height:40}}>
        <svg viewBox="0 0 1200 40" className="w-[200%] h-full" preserveAspectRatio="none"
          style={{animation:'wave-flow 6s linear infinite'}}>
          <path d="M0,20 C150,0 300,40 450,20 C600,0 750,40 900,20 C1050,0 1150,40 1200,20 L1200,40 L0,40 Z"
            fill="rgba(186,230,253,0.18)" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{height:26}}>
        <svg viewBox="0 0 1200 26" className="w-[200%] h-full" preserveAspectRatio="none"
          style={{animation:'wave-flow 4s linear infinite reverse'}}>
          <path d="M0,13 C200,0 400,26 600,13 C800,0 1000,26 1200,13 L1200,26 L0,26 Z"
            fill="rgba(125,211,252,0.12)" />
        </svg>
      </div>
    </div>
  )
}

function ButterflyOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {[[20,30,'#f472b6'],[60,65,'#a78bfa'],[80,20,'#34d399'],[10,75,'#60a5fa']].map(([x,y,c],i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:`${y}%`,width:140,height:140,
          background:`radial-gradient(circle,${c}18 0%,transparent 70%)`,
          filter:'blur(16px)',transform:'translate(-50%,-50%)',
          animation:`nebula-breathe ${6+i}s ease-in-out ${i*1.5}s infinite`}} />
      ))}
    </div>
  )
}

function BlossomOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      <svg className="absolute top-0 left-0 w-full" style={{height:'40%'}}>
        <path d="M -60 120 Q 250 30 500 80 Q 750 130 1100 40 Q 1300 0 1500 60"
          stroke="rgba(120,60,40,0.22)" strokeWidth="10" fill="none" />
        <path d="M 150 70 Q 250 -10 360 35" stroke="rgba(120,60,40,0.15)" strokeWidth="6" fill="none" />
      </svg>
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 90%,rgba(253,164,175,0.1) 0%,transparent 60%)'}} />
    </div>
  )
}

function CloudOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {/* Sun */}
      <div className="absolute" style={{
        top:'5%',right:'9%',width:80,height:80,
        background:'radial-gradient(circle,#fef9c3 0%,#fde68a 50%,rgba(251,191,36,0) 100%)',
        borderRadius:'50%',boxShadow:'0 0 60px rgba(251,191,36,0.45)',
        animation:'sun-pulse 3s ease-in-out infinite'}} />
      <div className="absolute bottom-0 left-0 right-0" style={{
        height:'18%',
        background:'linear-gradient(0deg,rgba(37,99,235,0.2) 0%,transparent 100%)'}} />
    </div>
  )
}

function TropicalOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      <div className="absolute top-0 left-0 right-0" style={{
        height:'40%',
        background:'radial-gradient(ellipse at 50% 0%,rgba(251,191,36,0.08) 0%,transparent 70%)'}} />
      <svg className="absolute inset-0 w-full h-full" opacity={0.12}>
        <ellipse cx="8%" cy="35%" rx="12%" ry="25%" fill="rgba(16,185,129,1)" transform="rotate(-30,8%,35%)"/>
        <ellipse cx="92%" cy="60%" rx="10%" ry="22%" fill="rgba(16,185,129,1)" transform="rotate(25,92%,60%)"/>
      </svg>
    </div>
  )
}

function ForestOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {[22,52,82].map((x,i) => (
        <div key={i} className="absolute top-0" style={{
          left:`${x}%`,width:50+i*20,height:'70%',
          background:'linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 100%)',
          transform:`rotate(${(i-1)*8}deg)`,transformOrigin:'top',
          animation:`light-shaft ${4+i}s ease-in-out ${i*.8}s infinite`}} />
      ))}
      <div className="absolute bottom-0 left-0 right-0" style={{height:90}}>
        <svg viewBox="0 0 560 90" className="w-full h-full" preserveAspectRatio="none">
          <polygon points="280,0 240,90 320,90" fill="rgba(5,46,22,0.6)" style={{animation:'tree-sway-2 4s ease-in-out infinite'}} />
          <rect x="270" y="70" width="20" height="20" fill="rgba(92,64,42,0.5)" />
          <polygon points="100,20 70,90 130,90" fill="rgba(5,46,22,0.5)" style={{animation:'tree-sway-2 5s ease-in-out .5s infinite'}} />
          <polygon points="430,10 400,90 460,90" fill="rgba(5,46,22,0.55)" style={{animation:'tree-sway-2 3.5s ease-in-out 1s infinite'}} />
          <path d="M0,85 Q20,78 40,85 Q60,78 80,85 Q100,78 120,85 Q140,78 160,85 Q180,78 200,85 Q220,78 240,85 Q260,78 280,85 Q300,78 320,85 Q340,78 360,85 Q380,78 400,85 Q420,78 440,85 Q460,78 480,85 Q500,78 520,85 Q540,78 560,85 L560,90 L0,90 Z"
            fill="rgba(22,101,52,0.4)" />
        </svg>
      </div>
    </div>
  )
}

function VolcanoOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {/* Volcano silhouette */}
      <div className="absolute bottom-0" style={{left:'50%',transform:'translateX(-50%)',width:'50%',zIndex:1}}>
        <svg viewBox="0 0 560 280" className="w-full h-auto" preserveAspectRatio="none">
          <polygon points="0,280 280,35 560,280" fill="rgba(12,5,0,0.72)" />
          <ellipse cx="280" cy="38" rx="68" ry="16" fill="rgba(35,8,0,0.8)" />
        </svg>
      </div>
      {/* Lava glow */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height:'28%',
        background:'radial-gradient(ellipse at 50% 100%,rgba(239,68,68,0.2) 0%,rgba(249,115,22,0.08) 50%,transparent 80%)'}} />
      {/* Smoke */}
      {[38,50,62].map((x,i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:'2%',width:55+i*18,height:55+i*18,
          background:'radial-gradient(circle,rgba(55,18,0,0.3) 0%,transparent 70%)',
          filter:'blur(12px)',transform:'translate(-50%,-50%)',
          animation:`steam-puff ${3+i*.6}s ease-out ${i*.4}s infinite`}} />
      ))}
    </div>
  )
}

function NetworkOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {[[20,30,200,150,'#7c3aed'],[65,20,240,180,'#1d4ed8'],[45,70,180,140,'#be185d']].map(([x,y,w2,h2,c],i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:`${y}%`,width:w2,height:h2,
          background:`radial-gradient(ellipse at center,${c}18 0%,transparent 70%)`,
          filter:'blur(24px)',transform:'translate(-50%,-50%)',
          animation:`nebula-breathe ${5+i*1.5}s ease-in-out ${i*2}s infinite`}} />
      ))}
      <div className="absolute inset-0" style={{
        backgroundImage:'radial-gradient(circle,rgba(148,163,184,0.12) 1px,transparent 1px)',
        backgroundSize:'50px 50px'}} />
      <div className="absolute" style={{
        top:'15%',left:'10%',width:100,height:2,
        background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)',
        borderRadius:2,animation:'shooting-star-anim 12s linear 4s infinite'}} />
    </div>
  )
}

function AuroraOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {[
        { top:'20%', color1:'140', color2:'165', speed:'11s', delay:'0s' },
        { top:'27%', color1:'200', color2:'215', speed:'8s',  delay:'2s' },
        { top:'22%', color1:'278', color2:'295', speed:'14s', delay:'1.5s' },
        { top:'31%', color1:'168', color2:'195', speed:'10s', delay:'3s' },
      ].map((r,i) => (
        <div key={i} className="absolute left-0 right-0" style={{
          top:r.top,height:35+i*8,
          background:`linear-gradient(90deg,transparent 0%,hsla(${r.color1},100%,65%,0.45) 20%,hsla(${r.color2},100%,60%,0.6) 50%,hsla(${parseInt(r.color1)+30},100%,65%,0.45) 80%,transparent 100%)`,
          filter:'blur(6px)',
          animation:`aurora-wave ${r.speed} ease-in-out ${r.delay} infinite`}} />
      ))}
      {/* Moon */}
      <div className="absolute" style={{
        top:'7%',right:'10%',width:55,height:55,
        background:'radial-gradient(circle at 35% 35%,#fffde7,#fef9c3,#fef08a)',
        borderRadius:'50%',boxShadow:'0 0 30px rgba(254,240,138,0.3)'}} />
    </div>
  )
}

function HighwayOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {/* Road surface */}
      <div className="absolute left-0 right-0" style={{
        top:'35%',height:'50%',background:'rgba(55,65,81,0.85)'}} />
      {/* Road edges */}
      <div className="absolute left-0 right-0" style={{top:'35%',height:2,background:'rgba(255,255,255,0.5)'}} />
      <div className="absolute left-0 right-0" style={{top:'85%',height:2,background:'rgba(255,255,255,0.5)'}} />
      {/* City skyline */}
      <svg className="absolute top-0 left-0 right-0 w-full" style={{height:'36%'}}>
        <path d="M0,100% L0,60% L8%,60% L8%,30% L12%,30% L12%,50% L18%,50% L18%,15% L22%,15% L22%,45% L28%,45% L28%,25% L32%,25% L32%,55% L40%,55% L40%,20% L44%,20% L44%,40% L50%,40% L50%,10% L54%,10% L54%,35% L60%,35% L60%,50% L68%,50% L68%,22% L72%,22% L72%,45% L80%,45% L80%,30% L85%,30% L85%,55% L92%,55% L92%,35% L100%,35% L100%,100%"
          fill="rgba(15,23,42,0.9)" />
      </svg>
      {/* Lane markers (dashed yellow) */}
      <div className="absolute left-0 right-0" style={{
        top:'48%',height:2,
        background:'repeating-linear-gradient(90deg,#fbbf24 0px,#fbbf24 25px,transparent 25px,transparent 45px)',
        opacity:0.6}} />
      <div className="absolute left-0 right-0" style={{
        top:'61%',height:2,
        background:'repeating-linear-gradient(90deg,#fbbf24 0px,#fbbf24 25px,transparent 25px,transparent 45px)',
        opacity:0.6}} />
      <div className="absolute left-0 right-0" style={{
        top:'74%',height:2,
        background:'repeating-linear-gradient(90deg,#fbbf24 0px,#fbbf24 25px,transparent 25px,transparent 45px)',
        opacity:0.6}} />
    </div>
  )
}

function HeartsOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      {/* Pulsing center glow */}
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 50%,rgba(236,72,153,0.18) 0%,rgba(190,24,93,0.06) 50%,transparent 80%)',
        animation:'lava-pulse 2s ease-in-out infinite'}} />
      {/* Sparkle dots */}
      {[[15,25],[70,15],[30,65],[80,55],[50,80],[85,30]].map(([x,y],i) => (
        <div key={i} className="absolute rounded-full" style={{
          left:`${x}%`,top:`${y}%`,width:4,height:4,
          background:`hsl(${320+i*10},100%,75%)`,
          boxShadow:`0 0 8px hsl(${320+i*10},100%,70%)`,
          animation:`firefly-blink ${1.5+i*.4}s ease-in-out ${i*.3}s infinite`}} />
      ))}
      {/* Top vignette */}
      <div className="absolute top-0 left-0 right-0" style={{
        height:'30%',
        background:'linear-gradient(180deg,rgba(74,0,32,0.4) 0%,transparent 100%)'}} />
    </div>
  )
}

function CircuitOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex:2}}>
      <svg className="absolute inset-0 w-full h-full">
        {[
          'M5,50 L25,50 L25,20 L55,20 L55,50 L85,50',
          'M5,70 L30,70 L30,85 L65,85',
          'M50,10 L50,35 L80,35',
          'M15,80 L15,60 L45,60',
          'M70,15 L70,45 L90,45',
        ].map((d,i) => (
          <path key={i} d={d} fill="none" stroke="#a78bfa" strokeWidth="0.8"
            strokeDasharray="200" strokeLinecap="round"
            style={{animation:`circuit-trace ${2.5+i*.5}s ease-in-out ${i*.7}s infinite`,opacity:0.3}} />
        ))}
        {[[25,20],[55,50],[30,70],[50,35],[70,45]].map(([cx,cy],i) => (
          <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="3.5" fill="#a78bfa" opacity=".4"
            style={{animation:`neural-pulse ${1.5+i*.3}s ease-in-out ${i*.4}s infinite`}} />
        ))}
      </svg>
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse at 50% 50%,rgba(167,139,250,0.05) 0%,transparent 60%)'}} />
    </div>
  )
}

const OVERLAYS = {
  water:    SnowOverlay,
  light:    StormOverlay,
  compass:  OceanOverlay,
  puzzle:   ButterflyOverlay,
  chain:    BlossomOverlay,
  books:    CloudOverlay,
  cabinet:  TropicalOverlay,
  forest:   ForestOverlay,
  mountain: VolcanoOverlay,
  network:  NetworkOverlay,
  target:   AuroraOverlay,
  blocks:   HighwayOverlay,
  maze:     HeartsOverlay,
  circuit:  CircuitOverlay,
}

/* ════════════════════════════════════════════════════
   PUBLIC COMPONENT
════════════════════════════════════════════════════ */
export default function ThemeBackground({ themeId, children, className = '', variant = 'card' }) {
  const cfg      = CONFIGS[themeId] || CONFIGS.circuit
  const Overlay  = OVERLAYS[themeId]
  const canvasRef = useParticleCanvas(cfg.type, variant === 'page' ? Math.round(cfg.count * 1.5) : cfg.count, themeId)
  const mouseRef  = useMouseCanvas(themeId)

  /* Full-page fixed background variant */
  if (variant === 'page') {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background: cfg.bg, pointerEvents: 'none',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {Overlay && <Overlay />}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 3 }}
        />
      </div>
    )
  }

  /* Default card variant */
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ background: cfg.bg }}
    >
      {Overlay && <Overlay />}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 3 }}
        aria-hidden="true"
      />
      <canvas
        ref={mouseRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 4 }}
        aria-hidden="true"
      />
      <div className="relative" style={{ zIndex: 5 }}>
        {children}
      </div>
    </div>
  )
}
