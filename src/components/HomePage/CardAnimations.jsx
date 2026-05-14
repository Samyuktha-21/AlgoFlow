/* Per-theme mini-animations inside each homepage category card */

export function WaterAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ background: 'linear-gradient(180deg,#0369a1,#0ea5e9)' }}>
      {/* Ripple circles */}
      {[0,1,2].map(i => (
        <div key={i} className="absolute left-1/2 top-1/2 rounded-full border border-blue-300/50 -translate-x-1/2 -translate-y-1/2"
          style={{ width:30+i*28, height:30+i*28, animation:`ripple-expand 2.4s ease-out ${i*0.8}s infinite` }} />
      ))}
      {/* Bubbles */}
      {[8,22,38,55,70].map((l,i) => (
        <div key={i} className="absolute bottom-0 rounded-full border border-white/40 bg-white/10"
          style={{ left:`${l}%`, width:6+i*2, height:6+i*2, animation:`bubble-rise ${2+i*0.4}s ease-in ${i*0.6}s infinite` }} />
      ))}
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-blue-200/80 font-bold tracking-widest">SORT</span>
    </div>
  )
}

export function LightAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ background: 'linear-gradient(180deg,#1c1917,#292524)' }}>
      {/* Spotlight beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 origin-top"
        style={{ width:0, height:0, borderLeft:'30px solid transparent', borderRight:'30px solid transparent',
          borderTop:'80px solid rgba(251,191,36,0.3)', filter:'blur(4px)',
          animation:'spotlight-sweep 3s ease-in-out infinite' }} />
      {/* Ground illumination */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full"
        style={{ background:'radial-gradient(ellipse,rgba(251,191,36,0.4),transparent)',
          animation:'spotlight-sweep 3s ease-in-out infinite' }} />
      {/* Dust motes */}
      {[15,35,55,75,90].map((l,i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full bg-amber-300/60"
          style={{ left:`${l}%`, bottom:'30%', animation:`dust-mote ${1.5+i*0.3}s ease-in-out ${i*0.5}s infinite` }} />
      ))}
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-amber-200/80 font-bold tracking-widest">SEARCH</span>
    </div>
  )
}

export function ForestAnimation() {
  const leaves = ['🍃','🍂','🍁']
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ background: 'linear-gradient(180deg,#166534,#15803d,#4ade80)' }}>
      {/* Tree silhouette */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-16 h-12 rounded-t-full" style={{ background:'rgba(5,46,22,0.8)', animation:'tree-sway 3s ease-in-out infinite' }} />
        <div className="w-3 h-6 bg-amber-900/60" />
      </div>
      {/* Falling leaves */}
      {[10,25,45,65,80].map((l,i) => (
        <div key={i} className="absolute top-0 text-base select-none pointer-events-none"
          style={{ left:`${l}%`, animation:`${i%2===0?'leaf-drift':'leaf-drift-reverse'} ${2.5+i*0.5}s ease-in ${i*0.7}s infinite` }}>
          {leaves[i % 3]}
        </div>
      ))}
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-green-100/80 font-bold tracking-widest">TREES</span>
    </div>
  )
}

export function NetworkAnimation() {
  const stars = Array.from({length:12},(_,i) => ({
    x: 10+Math.floor(i/3)*28, y: 15+((i%4)*18),
    size: 1.5+((i*7)%3)*0.8,
    delay: (i*0.3)%2.4
  }))
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg" style={{ background: 'radial-gradient(ellipse at 40% 40%, #1e3a5f 0%, #0f172a 80%)' }}>
      <svg className="absolute inset-0 w-full h-full">
        {/* Constellation lines */}
        {[[0,1],[1,2],[2,3],[3,4],[4,5],[5,8],[8,11],[6,7],[7,10]].map(([a,b],i) => (
          <line key={i}
            x1={`${stars[a].x+5}%`} y1={`${stars[a].y+2}%`}
            x2={`${stars[b].x+5}%`} y2={`${stars[b].y+2}%`}
            stroke="rgba(96,165,250,0.3)" strokeWidth="0.5"
            strokeDasharray="3,3"
            style={{ animation:`twinkle ${2+i*0.3}s ease-in-out ${i*0.2}s infinite` }} />
        ))}
        {/* Stars */}
        {stars.map((s,i) => (
          <circle key={i} cx={`${s.x+5}%`} cy={`${s.y+2}%`} r={s.size}
            fill={i%3===0?'#60a5fa':i%3===1?'#a78bfa':'#ffffff'}
            style={{ animation:`star-twinkle ${1.5+s.delay}s ease-in-out ${s.delay}s infinite` }} />
        ))}
      </svg>
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-blue-200/80 font-bold tracking-widest">GRAPHS</span>
    </div>
  )
}

export function CompassAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#0c1445,#1e3a5f)' }}>
      {/* Compass rose outer ring */}
      <div className="absolute w-16 h-16 rounded-full border-2 border-yellow-400/40"
        style={{ animation:'compass-spin-slow 20s linear infinite' }}>
        {['N','E','S','W'].map((d,i) => (
          <div key={d} className="absolute text-xs text-yellow-300/70 font-bold"
            style={{ top: i===0?'-8px': i===2?'auto':undefined,
              bottom: i===2?'-8px':undefined,
              left: i===3?'-8px': i===1?'auto':undefined,
              right: i===1?'-8px':undefined,
              top: i===0?'-8px': i===2?'auto': '22px',
            }}>
            {d}
          </div>
        ))}
      </div>
      {/* Needle */}
      <div className="relative w-16 h-16 flex items-center justify-center"
        style={{ animation:'needle-sweep 4s ease-in-out infinite' }}>
        <div className="absolute w-1.5 rounded-full" style={{ height:28, top:2, left:'calc(50% - 3px)', background:'linear-gradient(180deg,#ef4444,transparent)', transformOrigin:'bottom center' }} />
        <div className="absolute w-1.5 rounded-full" style={{ height:20, bottom:2, left:'calc(50% - 3px)', background:'linear-gradient(0deg,#94a3b8,transparent)', transformOrigin:'top center' }} />
        <div className="w-3 h-3 rounded-full bg-yellow-400 z-10" />
      </div>
      {/* Gold particles */}
      {[0,1,2,3].map(i => (
        <div key={i} className="absolute w-1 h-1 rounded-full bg-yellow-300/60"
          style={{ top:`${20+i*20}%`, left:`${15+i*20}%`, animation:`float-up ${2+i*0.5}s ease-in-out ${i*0.6}s infinite` }} />
      ))}
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-yellow-200/80 font-bold tracking-widest">BASICS</span>
    </div>
  )
}

export function CircuitAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'linear-gradient(135deg,#030712,#0f172a)' }}>
      <svg className="absolute inset-0 w-full h-full">
        {/* Circuit traces */}
        {[
          'M10,50 L30,50 L30,20 L60,20 L60,50 L80,50',
          'M10,70 L40,70 L40,90 L70,90',
          'M50,10 L50,40 L80,40',
          'M20,80 L20,60 L50,60',
        ].map((d,i) => (
          <path key={i} d={d} fill="none"
            stroke="#22d3ee" strokeWidth="1.2"
            strokeDasharray="200" strokeLinecap="round"
            style={{ animation:`trace-light ${2.5+i*0.6}s ease-in-out ${i*0.8}s infinite` }} />
        ))}
        {/* Nodes */}
        {[[30,20],[60,50],[40,70],[50,40]].map(([cx,cy],i) => (
          <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="4"
            fill="#22d3ee" opacity="0.8"
            style={{ animation:`node-blink ${1.5+i*0.4}s ease-in-out ${i*0.5}s infinite` }} />
        ))}
        {/* Data packets moving */}
        <circle r="3" fill="#a78bfa" opacity="0.9"
          style={{ offsetPath:'path("M10,50 L30,50 L30,20 L60,20")', animation:'data-flow 3s ease-in-out infinite' }}>
        </circle>
      </svg>
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-cyan-300/80 font-bold tracking-widest">ADVANCED</span>
    </div>
  )
}

export function MazeAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'linear-gradient(135deg,#0f2011,#14532d)' }}>
      <svg className="absolute inset-0 w-full h-full">
        {/* Maze walls */}
        {[
          'M5,5 L5,95 L95,95 L95,5 L5,5',
          'M5,35 L40,35 L40,5',
          'M60,5 L60,35 L95,35',
          'M5,65 L40,65 L40,95',
          'M40,55 L60,55 L60,95',
          'M25,35 L25,65',
          'M75,35 L75,65',
        ].map((d,i) => (
          <path key={i} d={d} fill="none" stroke="rgba(74,222,128,0.25)" strokeWidth="2" strokeLinecap="square" />
        ))}
        {/* Solved path */}
        <path d="M10,10 L10,30 L55,30 L55,50 L80,50 L80,90"
          fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="300"
          style={{ animation:'path-light 4s ease-in-out infinite' }} />
      </svg>
      {/* Goal */}
      <div className="absolute bottom-3 right-3 w-5 h-5 rounded-sm border-2 border-green-400 bg-green-400/20
        flex items-center justify-center text-xs">🚩</div>
      <span className="absolute bottom-2 left-0 w-1/2 text-center text-xs text-green-200/80 font-bold tracking-widest">BACKTRACK</span>
    </div>
  )
}

export function MountainAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'linear-gradient(180deg,#0c1a2e,#1e3a5f,#334155)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Mountain peaks */}
        <polygon points="0,100 25,30 50,100" fill="rgba(71,85,105,0.8)"
          style={{ animation:'peak-rise 2.5s ease-out forwards' }} />
        <polygon points="20,100 50,15 80,100" fill="rgba(51,65,85,0.9)"
          style={{ animation:'peak-rise 2.5s ease-out 0.3s forwards' }} />
        <polygon points="50,100 75,35 100,100" fill="rgba(71,85,105,0.7)"
          style={{ animation:'peak-rise 2.5s ease-out 0.6s forwards' }} />
        {/* Snow caps */}
        <polygon points="40,40 50,15 60,40" fill="rgba(226,232,240,0.9)" />
      </svg>
      {/* Snow particles */}
      {[15,30,50,65,80].map((l,i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full bg-white/70"
          style={{ left:`${l}%`, top:'30%', animation:`snow-particle ${1.5+i*0.3}s ease-in ${i*0.4}s infinite` }} />
      ))}
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-slate-200/80 font-bold tracking-widest">HEAPS</span>
    </div>
  )
}

export function TargetAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#1c0404,#450a0a)' }}>
      {/* Target rings */}
      {[60,44,28,14].map((size,i) => (
        <div key={i} className="absolute rounded-full"
          style={{ width:size, height:size,
            border:`2px solid ${i===3?'#fbbf24':i===0?'#ef4444':i===1?'#f97316':'#fca5a5'}`,
            animation:`ring-pulse ${2+i*0.3}s ease-in-out ${i*0.2}s infinite` }} />
      ))}
      {/* Arrow */}
      <div className="absolute text-lg select-none"
        style={{ animation:'arrow-fly 2.5s ease-out infinite' }}>🏹</div>
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-red-200/80 font-bold tracking-widest">GREEDY</span>
    </div>
  )
}

export function BlocksAnimation() {
  const colors = ['#f97316','#f59e0b','#eab308','#ef4444','#ec4899','#8b5cf6']
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'linear-gradient(180deg,#1c1107,#431407)' }}>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
        {[3,2,1].map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            {Array.from({length:row}, (_,ci) => (
              <div key={ci} className="w-7 h-5 rounded-sm"
                style={{ background: colors[(ri*3+ci)%colors.length],
                  animation:`block-appear 0.5s ease-out ${(ri*3+ci)*0.15}s backwards,
                    block-pulse 2s ease-in-out ${(ri*3+ci)*0.3}s infinite` }} />
            ))}
          </div>
        ))}
        {/* Building rows */}
        <div className="flex gap-0.5 mt-0.5">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-7 h-5 rounded-sm border border-orange-400/30"
              style={{ background: 'rgba(251,146,60,0.2)', animation:`block-pulse ${1.5+i*0.2}s ease-in-out ${i*0.2}s infinite` }} />
          ))}
        </div>
      </div>
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-orange-200/80 font-bold tracking-widest">DP</span>
    </div>
  )
}

export function BooksAnimation() {
  const bookColors = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899']
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg"
      style={{ background: 'linear-gradient(180deg,#1c1107,#292524)' }}>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-end gap-1">
        {bookColors.map((c,i) => (
          <div key={i} className="rounded-sm border border-black/20"
            style={{ width:10, height:30+((i*7)%25), background:c, opacity:0.85,
              animation:`book-slide-up 0.5s ease-out ${i*0.12}s backwards,
                book-wobble 3s ease-in-out ${i*0.4}s infinite` }} />
        ))}
      </div>
      {/* Shelf */}
      <div className="absolute bottom-4 left-2 right-2 h-1 rounded bg-amber-800/60" />
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-amber-200/80 font-bold tracking-widest">STACK/QUEUE</span>
    </div>
  )
}

export function CabinetAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex flex-col items-center justify-center gap-1"
      style={{ background: 'linear-gradient(180deg,#0a1f0e,#14532d)' }}>
      {[0,1,2].map(i => (
        <div key={i} className="relative w-16 h-5 rounded border border-green-500/40 bg-green-900/30 flex items-center px-1 gap-1 overflow-hidden"
          style={{ animation:`drawer-open 3s ease-in-out ${i*1}s infinite` }}>
          <div className="w-2.5 h-3 rounded-sm flex-shrink-0" style={{ background:`hsl(${120+i*20},60%,60%)` }} />
          <div className="w-2.5 h-3 rounded-sm flex-shrink-0" style={{ background:`hsl(${140+i*20},60%,55%)` }} />
          <div className="w-1 h-2 rounded-sm bg-green-300/40" />
          {/* Handle */}
          <div className="absolute right-0.5 w-1.5 h-1.5 rounded-full bg-green-400/60" />
        </div>
      ))}
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-green-200/80 font-bold tracking-widest">HASHING</span>
    </div>
  )
}

export function ChainAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
      <div className="flex items-center gap-0.5" style={{ animation:'chain-sway 3s ease-in-out infinite' }}>
        {Array.from({length:7}, (_,i) => (
          <div key={i} className="flex items-center">
            <div className="rounded-full border-2 border-slate-400/70 bg-slate-600/30"
              style={{ width:i%2===0?14:10, height:i%2===0?10:14,
                animation:`twinkle ${2+i*0.2}s ease-in-out ${i*0.15}s infinite` }} />
            {i < 6 && <div className="w-1 h-0.5 bg-slate-500/50" />}
          </div>
        ))}
      </div>
      {/* Connecting dots */}
      {[1,2,3].map(i => (
        <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-slate-400/50"
          style={{ left:`${20+i*20}%`, top:`${30+i*15}%`, animation:`float-up ${2+i*0.3}s ease-in-out ${i*0.5}s infinite` }} />
      ))}
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-slate-200/80 font-bold tracking-widest">LINKED LIST</span>
    </div>
  )
}

export function PuzzleAnimation() {
  const colors = ['#8b5cf6','#a855f7','#7c3aed','#6d28d9','#4c1d95']
  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#1a0533,#2e1065)' }}>
      <div className="grid gap-1" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
        {Array.from({length:9},(_,i) => (
          <div key={i} className="w-6 h-6 rounded-sm relative"
            style={{ background:colors[i%colors.length], opacity:0.75+((i*7)%3)*0.1,
              animation:`puzzle-shift ${2+((i*3)%4)*0.5}s ease-in-out ${i*0.2}s infinite` }}>
            {/* Puzzle nub */}
            {i%3!==2 && <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{ background:colors[(i+1)%colors.length] }} />}
          </div>
        ))}
      </div>
      <span className="absolute bottom-2 left-0 right-0 text-center text-xs text-purple-200/80 font-bold tracking-widest">ARRAY/STR</span>
    </div>
  )
}

/* Map from themeId to animation component */
export const CARD_ANIMATIONS = {
  compass:  CompassAnimation,
  water:    WaterAnimation,
  light:    LightAnimation,
  puzzle:   PuzzleAnimation,
  chain:    ChainAnimation,
  books:    BooksAnimation,
  cabinet:  CabinetAnimation,
  forest:   ForestAnimation,
  mountain: MountainAnimation,
  network:  NetworkAnimation,
  target:   TargetAnimation,
  blocks:   BlocksAnimation,
  maze:     MazeAnimation,
  circuit:  CircuitAnimation,
}
