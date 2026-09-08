import { PublicLayout } from '@/Components/layout/PublicLayout';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Hammer, MessageCircle, Trophy, Target, Home, Compass, Zap, BookOpen, Monitor, Trash2 } from 'lucide-react';

// ── Types & Const ──
type Pos = { x:number; y:number };
type Entity = { id:number; x:number; y:number; w:number; h:number; type:'desk'|'pc'|'board'|'shelf'|'bin'; hp:number; max:number; label:string };
type Npc = { id:number; x:number; y:number; name:string; emoji:string; dialog:string; done?:boolean };
type Drop = { id:number; x:number; y:number; vx:number; vy:number; life:number; emoji:string };
type Fx = { id:number; x:number; y:number; text:string };

const TILE = 36;
const MAP_W = 22;
const MAP_H = 14;
const SPEED = 2.8;

// walls: border + inner walls to make 3 rooms
const WALLS: Pos[] = [];
for(let x=0;x<MAP_W;x++){ WALLS.push({x,y:0}); WALLS.push({x,y:MAP_H-1}); }
for(let y=0;y<MAP_H;y++){ WALLS.push({x:0,y}); WALLS.push({x:MAP_W-1,y}); }
// vertical divider between courtyard and rooms
for(let y=1;y<7;y++) WALLS.push({x:8,y});
for(let y=8;y<MAP_H-1;y++) WALLS.push({x:8,y});
// horizontal divider rooms
for(let x=9;x<MAP_W-1;x++) WALLS.push({x,y:6});
for(let x=9;x<16;x++) WALLS.push({x,y:10});
// doors (remove walls for doors)
const DOORS: Pos[] = [{x:8,y:7},{x:12,y:6},{x:16,y:10},{x:8,y:3}];
const isWall = (x:number,y:number) => {
    if(DOORS.some(d=>d.x===x&&d.y===y)) return false;
    return WALLS.some(w=>w.x===x&&w.y===y);
};

const INITIAL_ENTITIES: Entity[] = [
    // courtyard desks
    { id:1, x:2, y:3, w:2, h:1, type:'desk', hp:30, max:30, label:'Meja UKM' },
    { id:2, x:4, y:5, w:1, h:1, type:'bin', hp:18, max:18, label:'Tong Sampah' },
    { id:3, x:5, y:9, w:2, h:1, type:'desk', hp:30, max:30, label:'Meja Taman' },
    { id:4, x:2, y:11, w:1, h:1, type:'desk', hp:22, max:22, label:'Kursi' },
    // lab
    { id:5, x:10, y:2, w:2, h:1, type:'pc', hp:36, max:36, label:'PC Lab #1' },
    { id:6, x:14, y:2, w:2, h:1, type:'pc', hp:36, max:36, label:'PC Lab #2' },
    { id:7, x:18, y:3, w:2, h:1, type:'pc', hp:36, max:36, label:'PC Lab #3' },
    { id:8, x:11, y:4, w:1, h:1, type:'desk', hp:24, max:24, label:'Meja Dosen' },
    // kelas
    { id:9, x:10, y:8, w:2, h:1, type:'board', hp:40, max:40, label:'Papan Tulis' },
    { id:10, x:14, y:8, w:2, h:1, type:'desk', hp:30, max:30, label:'Meja Kelas' },
    { id:11, x:18, y:8, w:1, h:1, type:'desk', hp:24, max:24, label:'Bangku' },
    // perpus
    { id:12, x:10, y:12, w:2, h:1, type:'shelf', hp:44, max:44, label:'Rak Buku' },
    { id:13, x:14, y:12, w:2, h:1, type:'shelf', hp:44, max:44, label:'Rak Skripsi' },
    { id:14, x:18, y:12, w:1, h:1, type:'desk', hp:26, max:26, label:'Meja Baca' },
];

const INITIAL_NPCS: Npc[] = [
    { id:1, x:4, y:2, name:'Budi', emoji:'🧑‍🎓', dialog:'Gila tugas numpuk bro... ancurin aja meja UKM itu biar lega!' },
    { id:2, x:17, y:5, name:'Kak Aslab', emoji:'👩‍💻', dialog:'PC lab lemot mulu! Smash aja biar diganti baru 😤' },
    { id:3, x:13, y:13, name:'Pustakawan', emoji:'🧑‍🏫', dialog:'Rak skripsi ini berat hidupku... hancurin gih, nanti kita konsultasi ke Raycode!' },
];

function useWaHref() {
    try{
        const { settings } = usePage<{settings?:Record<string,string>}>().props as any;
        const raw = settings?.whatsapp ?? '+6281234567890';
        const num = String(raw).replace(/[^0-9]/g,'');
        return `https://wa.me/${num}?text=Halo%20Raycode%20%F0%9F%97%BA%EF%B8%8F%20habis%20main%20Campus%20Adventure%2C%20mau%20konsultasi%20project`;
    }catch{return 'https://wa.me/6281234567890';}
}

export default function CampusAdventure(){
    const waHref = useWaHref();
    const wrapRef = useRef<HTMLDivElement>(null);
    const [player, setPlayer] = useState<Pos>({x:4*TILE+8, y:7*TILE+6});
    const [dir, setDir] = useState<'down'|'up'|'left'|'right'>('down');
    const [entities, setEntities] = useState<Entity[]>(INITIAL_ENTITIES);
    const [npcs, setNpcs] = useState<Npc[]>(INITIAL_NPCS);
    const [drops, setDrops] = useState<Drop[]>([]);
    const [fxs, setFxs] = useState<Fx[]>([]);
    const [score,setScore]=useState(0);
    const [destroyed,setDestroyed]=useState(0);
    const [talked,setTalked]=useState(0);
    const [activeNpc,setActiveNpc]=useState<Npc|null>(null);
    const [weapon,setWeapon]=useState(0);
    const [showIntro,setShowIntro]=useState(true);
    const [won,setWon]=useState(false);

    const weapons = [
        { name:'Buku Skripsi', emoji:'📚', dmg:14 },
        { name:'Keyboard', emoji:'⌨️', dmg:18 },
        { name:'Palu Deadline', emoji:'🔨', dmg:22 },
    ];
    const wp = weapons[weapon];

    const keys = useRef<Set<string>>(new Set());
    const playerRef = useRef(player);
    playerRef.current = player;

    // input
    useEffect(()=>{
        const down=(e:KeyboardEvent)=>{
            const k=e.key.toLowerCase();
            if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)){
                if(k===' ') e.preventDefault();
                keys.current.add(k);
                if(k==='w'||k==='arrowup') setDir('up');
                if(k==='s'||k==='arrowdown') setDir('down');
                if(k==='a'||k==='arrowleft') setDir('left');
                if(k==='d'||k==='arrowright') setDir('right');
            }
            if(k==='e'){ tryTalk(); }
            if(k===' '){ trySmash(); }
        };
        const up=(e:KeyboardEvent)=> keys.current.delete(e.key.toLowerCase());
        window.addEventListener('keydown',down);
        window.addEventListener('keyup',up);
        return()=>{ window.removeEventListener('keydown',down); window.removeEventListener('keyup',up); };
    },[entities, player]);

    const isBlocked = useCallback((nx:number, ny:number)=>{
        const pw=22, ph=22;
        const corners=[
            {x:nx+4, y:ny+8},
            {x:nx+pw-4, y:ny+8},
            {x:nx+4, y:ny+ph},
            {x:nx+pw-4, y:ny+ph},
        ];
        for(const c of corners){
            const tx=Math.floor(c.x/TILE), ty=Math.floor(c.y/TILE);
            if(isWall(tx,ty)) return true;
        }
        for(const e of entities){
            if(e.hp<=0) continue;
            const ex=e.x*TILE, ey=e.y*TILE, ew=e.w*TILE, eh=e.h*TILE;
            if(nx+pw>ex+4 && nx+4<ex+ew-4 && ny+ph>ey+4 && ny+8<ey+eh-4) return true;
        }
        return false;
    },[entities]);

    // game loop move
    useEffect(()=>{
        let raf=0;
        const loop=()=>{
            let {x,y}=playerRef.current;
            let dx=0, dy=0;
            if(keys.current.has('w')||keys.current.has('arrowup')) dy-=SPEED;
            if(keys.current.has('s')||keys.current.has('arrowdown')) dy+=SPEED;
            if(keys.current.has('a')||keys.current.has('arrowleft')) dx-=SPEED;
            if(keys.current.has('d')||keys.current.has('arrowright')) dx+=SPEED;
            if(dx!==0||dy!==0){
                if(showIntro) setShowIntro(false);
                let nx=x+dx, ny=y+dy;
                if(!isBlocked(nx,y)) x=nx;
                if(!isBlocked(x,ny)) y=ny;
                // clamp
                x=Math.max(TILE*0.2, Math.min(MAP_W*TILE - 26, x));
                y=Math.max(TILE*0.2, Math.min(MAP_H*TILE - 26, y));
                if(x!==playerRef.current.x || y!==playerRef.current.y){
                    playerRef.current={x,y};
                    setPlayer({x,y});
                }
            }
            raf=requestAnimationFrame(loop);
        };
        raf=requestAnimationFrame(loop);
        return()=>cancelAnimationFrame(raf);
    },[isBlocked, showIntro]);

    // drops physics light
    useEffect(()=>{
        if(drops.length===0) return;
        let raf=0;
        const tick=()=>{
            setDrops(d=> d.map(v=> ({...v, x:v.x+v.vx, y:v.y+v.vy, vy:v.vy+0.22, life:v.life-1})).filter(v=>v.life>0));
            raf=requestAnimationFrame(tick);
        };
        raf=requestAnimationFrame(tick);
        return()=>cancelAnimationFrame(raf);
    },[drops.length]);

    const trySmash=useCallback(()=>{
        const px=playerRef.current.x+11, py=playerRef.current.y+11;
        // find nearest entity in front
        let target: Entity|null=null, best=46;
        for(const e of entities){
            if(e.hp<=0) continue;
            const ex=e.x*TILE+e.w*TILE/2, ey=e.y*TILE+e.h*TILE/2;
            const d=Math.hypot(px-ex, py-ey);
            if(d<best){ best=d; target=e; }
        }
        if(!target) return;
        const dmg=wp.dmg + Math.floor(Math.random()*6);
        const id=Date.now()+Math.random();
        setFxs(f=> [...f.slice(-5), {id, x:target.x*TILE+target.w*TILE/2, y:target.y*TILE-6, text:`-${dmg}`}]);
        setTimeout(()=> setFxs(f=> f.filter(x=>x.id!==id)), 600);
        // debris burst
        const nd: Drop[] = Array.from({length:4}).map(()=>({
            id: Math.random()*99999, x: target.x*TILE+target.w*TILE/2 + (Math.random()-0.5)*18, y: target.y*TILE+10,
            vx:(Math.random()-0.5)*5, vy:-3-Math.random()*3, life: 22+Math.random()*10, emoji: target.type==='pc' ? '💥' : target.type==='shelf' ? '📕' : '🧱'
        }));
        setDrops(d=> [...d, ...nd]);
        setEntities(es=> es.map(e=> e.id===target!.id ? {...e, hp: e.hp - dmg} : e));
        setScore(s=> s + dmg*10);
        try{ (navigator as any).vibrate?.(18);}catch{}
        // check destroyed
        setTimeout(()=>{
            setEntities(es=>{
                const still=es.find(x=>x.id===target!.id);
                if(still && still.hp<=0){
                    // already counted? need to avoid double
                }
                return es;
            });
        },0);
    },[entities, wp]);

    // watch destroyed count
    useEffect(()=>{
        const c=entities.filter(e=>e.hp<=0).length;
        if(c!==destroyed) setDestroyed(c);
        if(c>=6 && talked>=2 && !won) setWon(true);
    },[entities, destroyed, talked, won]);

    const tryTalk=useCallback(()=>{
        const px=playerRef.current.x+11, py=playerRef.current.y+11;
        let near:Npc|null=null, best=56;
        for(const n of npcs){
            if(n.done) continue;
            const nx=n.x*TILE+10, ny=n.y*TILE+10;
            const d=Math.hypot(px-nx, py-ny);
            if(d<best){ best=d; near=n; }
        }
        if(near){
            setActiveNpc(near);
            setNpcs(ns=> ns.map(x=> x.id===near!.id ? {...x, done:true} : x));
            setTalked(t=> t+1);
            setScore(s=> s+80);
        }
    },[npcs]);

    // touch joystick
    const holdKey=(k:string, on:boolean)=>{
        if(on) keys.current.add(k); else keys.current.delete(k);
        if(k==='w') setDir('up'); if(k==='s') setDir('down'); if(k==='a') setDir('left'); if(k==='d') setDir('right');
    };

    const nearestEntity = (()=> {
        const px=player.x+11, py=player.y+11;
        let t:Entity|null=null, b=50;
        for(const e of entities){ if(e.hp<=0) continue; const ex=e.x*TILE+e.w*TILE/2, ey=e.y*TILE+e.h*TILE/2; const d=Math.hypot(px-ex,py-ey); if(d<b){b=d; t=e;}}
        return t;
    })();
    const nearestNpc = (()=> {
        const px=player.x+11, py=player.y+11;
        let n:Npc|null=null,b=60;
        for(const x of npcs){ if(x.done) continue; const nx=x.x*TILE+10, ny=x.y*TILE+10; const d=Math.hypot(px-nx,py-ny); if(d<b){b=d; n=x;}}
        return n;
    })();

    return (
        <PublicLayout>
            <section className="mx-auto max-w-7xl px-3 py-4 lg:px-8">
                {/* header */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4 shadow-sm dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow">🗺️</span>
                        <div>
                            <h1 className="text-base font-black tracking-tight text-ink sm:text-lg">Campus Adventure — Top Down</h1>
                            <p className="font-mono text-xs text-ink-3">Jelajah kampus, hancurin objek, ngobrol NPC, kumpulin skor — realistis ringan</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-white dark:bg-white dark:text-slate-900">Skor {score}</span>
                        <span className="rounded-full border border-line bg-alt px-3 py-1.5 font-mono text-xs font-semibold text-ink flex items-center gap-1"><Target className="size-3.5"/> {destroyed}/6 hancur</span>
                        <a href="/campus-smash" className="hidden sm:inline-flex rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:bg-hover">Mode Smash 🔨</a>
                        <a href={waHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-black text-white hover:bg-[#1ebe5a]"><MessageCircle className="size-4"/> Konsultasi</a>
                    </div>
                </div>

                {/* game + side */}
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
                    {/* game canvas */}
                    <div className="overflow-hidden rounded-2xl border border-line bg-[#0b1220] shadow-lg dark:border-white/10">
                        {/* top bar */}
                        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3 py-2">
                            <div className="flex items-center gap-2 font-mono text-xs text-sky-100/80">
                                <span className="size-2 animate-pulse rounded-full bg-emerald-400"/> ADVENTURE MODE
                                <span className="hidden sm:inline text-white/40">• WASD / panah gerak • SPACE hancurin • E ngobrol</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {weapons.map((w,i)=>(
                                    <button key={i} onClick={()=>setWeapon(i)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${weapon===i?'bg-white text-slate-900':'bg-white/10 text-white hover:bg-white/15'}`}>{w.emoji} {w.name}</button>
                                ))}
                            </div>
                        </div>

                        {/* viewport */}
                        <div ref={wrapRef} className="relative mx-auto overflow-hidden bg-[#e8eef7] dark:bg-[#0f1a2e]" style={{ width: MAP_W*TILE, maxWidth:'100%', height: MAP_H*TILE }}>
                            {/* tiles */}
                            <div className="absolute inset-0">
                                {Array.from({length:MAP_H}).map((_,y)=> Array.from({length:MAP_W}).map((__,x)=>{
                                    const wall=isWall(x,y);
                                    const isDoor=DOORS.some(d=>d.x===x&&d.y===y);
                                    return (
                                        <div key={`${x}-${y}`} className={`absolute border-[0.5px] ${wall ? 'bg-slate-700 dark:bg-slate-800' : isDoor ? 'bg-amber-200/60 dark:bg-amber-900/30' : 'bg-[#f1f5f9] dark:bg-[#0f172a]' } border-slate-200/40 dark:border-white/[0.04]`}
                                            style={{ left:x*TILE, top:y*TILE, width:TILE, height:TILE }}
                                        >
                                            {!wall && !isDoor && <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)', backgroundSize:'12px 12px'}}/>}
                                            {wall && <div className="absolute inset-0 opacity-20" style={{backgroundImage:'repeating-linear-gradient(45deg, transparent 0 6px, rgb(0 0 0 / 0.12) 6px 7px)'}}/>}
                                            {isDoor && <div className="absolute inset-0 flex items-center justify-center font-mono text-[8px] font-bold tracking-widest text-amber-900 dark:text-amber-200">DOOR</div>}
                                            {wall && <div className="absolute inset-x-0 top-0 h-px bg-white/20"/>}
                                        </div>
                                    );
                                }))}
                                {/* room labels */}
                                <span className="pointer-events-none absolute left-[11*TILE] top-[1*TILE] font-mono text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400">LAB KOMPUTER</span>
                                <span className="pointer-events-none absolute left-[11*TILE] top-[7*TILE] font-mono text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400">KELAS</span>
                                <span className="pointer-events-none absolute left-[11*TILE] top-[11*TILE] font-mono text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400">PERPUSTAKAAN</span>
                                <span className="pointer-events-none absolute left-[2*TILE] top-[1*TILE] font-mono text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400">TAMAN</span>
                            </div>

                            {/* entities */}
                            {entities.map(e=> {
                                const destroyed=e.hp<=0;
                                const pct=Math.max(0, e.hp/e.max);
                                return (
                                    <div key={e.id} className={`absolute select-none ${destroyed?'opacity-40 grayscale' : ''}`}
                                        style={{ left:e.x*TILE, top:e.y*TILE, width:e.w*TILE, height:e.h*TILE }}
                                    >
                                        <div className={`absolute inset-1 rounded-md border shadow-sm flex flex-col items-center justify-center text-center p-1
                                            ${e.type==='pc' ? 'bg-slate-900 border-slate-700 text-sky-100' : e.type==='board' ? 'bg-emerald-900 border-emerald-700 text-emerald-100' : e.type==='shelf' ? 'bg-amber-900 border-amber-700 text-amber-100' : e.type==='bin' ? 'bg-zinc-600 border-zinc-500 text-white' : 'bg-amber-100 border-amber-300 text-slate-800 dark:bg-amber-900/60 dark:text-amber-100' }`}
                                        >
                                            <span className="text-sm leading-none">
                                                {e.type==='pc' ? '🖥️' : e.type==='board' ? '📋' : e.type==='shelf' ? '📚' : e.type==='bin' ? '🗑️' : '🪑'}
                                            </span>
                                            <span className="mt-0.5 font-mono text-[7px] font-bold leading-none">{e.label}</span>
                                            {destroyed && <span className="absolute inset-0 flex items-center justify-center bg-red-500/20 text-lg">💥</span>}
                                            {!destroyed && <div className="absolute -top-1 left-1 right-1 h-1 rounded-full bg-black/20"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{width:`${pct*100}%`}}/></div>}
                                            {destroyed && <div className="pointer-events-none absolute inset-0 opacity-30" style={{backgroundImage:'linear-gradient(45deg, transparent 45%, white 49%, white 51%, transparent 55%)', backgroundSize:'8px 8px'}}/>}
                                        </div>
                                        {/* crack */}
                                        {!destroyed && e.hp < e.max*0.6 && (
                                            <svg viewBox="0 0 40 20" className="pointer-events-none absolute inset-0 h-full w-full">
                                                <path d="M8 4 L12 10 L9 16 M20 2 L18 10 L22 16 M30 6 L28 12 L33 15" stroke="rgb(0 0 0 / 0.7)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                                            </svg>
                                        )}
                                    </div>
                                );
                            })}

                            {/* npcs */}
                            {npcs.map(n=>(
                                <div key={n.id} className={`absolute flex flex-col items-center ${n.done?'opacity-50 grayscale':''}`} style={{ left:n.x*TILE, top:n.y*TILE }}>
                                    <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-violet-600 text-xs shadow dark:border-white/20">{n.emoji}</div>
                                    <span className="mt-0.5 rounded bg-slate-900 px-1 py-0.5 font-mono text-[7px] font-bold text-white dark:bg-white dark:text-slate-900">{n.name}</span>
                                    {n.done && <span className="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-400 ring-2 ring-white text-[8px] flex items-center justify-center">✓</span>}
                                </div>
                            ))}

                            {/* player */}
                            <div className="absolute transition-none" style={{ left:player.x, top:player.y, width:22, height:22, transform:`translate(-50%,-50%)` }}>
                                <div className="relative flex size-[22px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-500 to-indigo-600 text-[11px] shadow-[0_4px_12px_rgb(0_0_0/0.3)] dark:border-white/80">
                                    🧑‍💻
                                    {/* dir arrow */}
                                    <span className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-amber-400 ring-1 ring-white" style={{
                                        transform: dir==='up' ? 'translate(-50%, -14px)' : dir==='down' ? 'translate(-50%, 8px)' : dir==='left' ? 'translate(-18px,-50%)' : 'translate(10px,-50%)',
                                        top: dir==='left'||dir==='right' ? '50%' : undefined
                                    }}/>
                                </div>
                                <div className="pointer-events-none absolute left-1/2 top-[14px] h-2 w-3 -translate-x-1/2 rounded-full bg-black/20 blur-[2px]"/>
                            </div>

                            {/* drops */}
                            {drops.map(d=>(
                                <div key={d.id} className="pointer-events-none absolute text-xs" style={{ left:d.x, top:d.y, transform:`translate(-50%,-50%)` }}>{d.emoji}</div>
                            ))}
                            {/* fx */}
                            {fxs.map(f=>(
                                <motion.div key={f.id} initial={{y:0,opacity:1,scale:1}} animate={{y:-14,opacity:0,scale:1.2}} transition={{duration:0.6}} className="pointer-events-none absolute -translate-x-1/2 font-mono text-xs font-black text-red-500 drop-shadow" style={{ left:f.x, top:f.y }}>{f.text}</motion.div>
                            ))}

                            {/* interaction hint */}
                            {(nearestEntity || nearestNpc) && !showIntro && !activeNpc && !won && (
                                <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-white shadow dark:bg-white dark:text-slate-900">
                                    {nearestNpc ? `E — Ngobrol ${nearestNpc.name}` : `SPACE — Hancurin ${nearestEntity?.label}`}
                                </div>
                            )}

                            {/* intro */}
                            <AnimatePresence>
                                {showIntro && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                                        <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white p-5 text-center shadow-xl dark:bg-[#0e1422]">
                                            <p className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-3 py-1 text-xs font-black text-white"><Compass className="size-3.5"/> PETUALANGAN KAMPUS</p>
                                            <h3 className="mt-3 text-base font-black text-ink">Jelajah kampus, hancurin, ngobrol!</h3>
                                            <p className="mt-2 text-xs leading-relaxed text-ink-2">Gerak pakai <b>WASD / panah</b> • Dekati objek lalu <b>SPACE</b> buat hancurin • Dekati NPC lalu <b>E</b> buat ngobrol. Hancurin 6 objek + ngobrol 2 NPC buat menang.</p>
                                            <button onClick={()=> setShowIntro(false)} className="mt-4 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-black text-white hover:bg-violet-700">Mulai Petualangan →</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* mobile controls */}
                        <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-slate-900 p-2 dark:bg-[#0a0d14] sm:hidden">
                            <div className="grid grid-cols-3 gap-1">
                                <span/><button onTouchStart={()=>holdKey('w',true)} onTouchEnd={()=>holdKey('w',false)} className="rounded-lg bg-white/10 p-2 text-white active:bg-white/20">▲</button><span/>
                                <button onTouchStart={()=>holdKey('a',true)} onTouchEnd={()=>holdKey('a',false)} className="rounded-lg bg-white/10 p-2 text-white active:bg-white/20">◀</button>
                                <button onTouchStart={()=>holdKey('s',true)} onTouchEnd={()=>holdKey('s',false)} className="rounded-lg bg-white/10 p-2 text-white active:bg-white/20">▼</button>
                                <button onTouchStart={()=>holdKey('d',true)} onTouchEnd={()=>holdKey('d',false)} className="rounded-lg bg-white/10 p-2 text-white active:bg-white/20">▶</button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={trySmash} className="rounded-xl bg-red-500 px-5 py-3 text-sm font-black text-white active:scale-95"><Hammer className="size-4 inline"/> SMASH</button>
                                <button onClick={tryTalk} className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-white active:scale-95"><MessageCircle className="size-4"/></button>
                            </div>
                        </div>
                    </div>

                    {/* side */}
                    <div className="space-y-3">
                        <div className="rounded-2xl border border-line bg-card p-4 dark:border-white/10">
                            <h3 className="flex items-center gap-2 text-sm font-black text-ink"><BookOpen className="size-4 text-violet-600"/> Misi Petualangan</h3>
                            <ul className="mt-3 space-y-2 font-mono text-xs">
                                <li className={`flex items-center justify-between rounded-lg border px-3 py-2 ${destroyed>=6?'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300':'border-line bg-alt dark:bg-white/[0.04]'}`}>
                                    <span className="flex items-center gap-1.5"><Monitor className="size-3.5"/> Hancurkan 6 objek</span><span className="font-black">{destroyed}/6</span>
                                </li>
                                <li className={`flex items-center justify-between rounded-lg border px-3 py-2 ${talked>=2?'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300':'border-line bg-alt dark:bg-white/[0.04]'}`}>
                                    <span className="flex items-center gap-1.5"><MessageCircle className="size-3.5"/> Ngobrol 2 NPC</span><span className="font-black">{talked}/2</span>
                                </li>
                                <li className="flex items-center justify-between rounded-lg border border-dashed border-line bg-alt/50 px-3 py-2 dark:border-white/10">
                                    <span className="flex items-center gap-1.5"><Zap className="size-3.5 text-amber-500"/> Skor</span><span className="font-black text-ink">{score}</span>
                                </li>
                            </ul>
                            <p className="mt-3 rounded-lg bg-violet-600 px-3 py-2 text-center font-mono text-xs font-bold text-white">Hadiah: konsultasi gratis kalau menang!</p>
                        </div>

                        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                            <h3 className="text-sm font-black text-ink">Kontrol</h3>
                            <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs">
                                <div className="rounded-lg bg-white p-2 dark:bg-white/10"><b>WASD</b><br/>Gerak</div>
                                <div className="rounded-lg bg-white p-2 dark:bg-white/10"><b>SPACE</b><br/>Hancurin</div>
                                <div className="rounded-lg bg-white p-2 dark:bg-white/10"><b>E</b><br/>Ngobrol</div>
                                <div className="rounded-lg bg-white p-2 dark:bg-white/10"><b>Tap</b><br/>Mobile</div>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button onClick={trySmash} className="flex-1 rounded-xl bg-red-500 py-2 text-xs font-black text-white hover:bg-red-600"><Hammer className="size-3.5 inline"/> Smash</button>
                                <button onClick={tryTalk} className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-black text-white hover:bg-emerald-700">Ngobrol</button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-dashed border-line bg-alt/40 p-3 text-center font-mono text-xs text-ink-3 dark:border-white/10">
                            Top-down realistis ringan: map foto-texture, shadow, crack overlay.<br/>
                            <span className="text-ink-2">Jelajah 3 ruangan: Lab, Kelas, Perpus + Taman.</span>
                        </div>
                    </div>
                </div>

                {/* npc dialog */}
                <AnimatePresence>
                    {activeNpc && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:items-center" onClick={()=> setActiveNpc(null)}>
                            <motion.div initial={{y:20,scale:0.97}} animate={{y:0,scale:1}} exit={{y:10,scale:0.98}} onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-white/15 bg-white p-5 shadow-2xl dark:bg-[#0e1422]">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg">{activeNpc.emoji}</span>
                                    <div><p className="text-sm font-black text-ink">{activeNpc.name}</p><p className="font-mono text-xs text-ink-3">NPC Kampus</p></div>
                                    <span className="ml-auto rounded-full bg-emerald-100 px-2 py-1 font-mono text-xs font-bold text-emerald-700">+80 poin</span>
                                </div>
                                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-ink-2 dark:bg-white/[0.04] dark:text-slate-300">"{activeNpc.dialog}"</p>
                                <p className="mt-3 font-mono text-xs text-ink-3">— habis ngobrol, lanjut hancurin lagi! Sisa {6-destroyed} objek.</p>
                                <button onClick={()=> setActiveNpc(null)} className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">Oke, lanjut →</button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* win modal */}
                <AnimatePresence>
                    {won && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                            <motion.div initial={{scale:0.9,y:16}} animate={{scale:1,y:0}} className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl dark:bg-[#0e1422]">
                                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-center text-white">
                                    <Trophy className="mx-auto size-8 text-amber-300"/>
                                    <h3 className="mt-2 text-xl font-black">PETUALANGAN SELESAI! 🎉</h3>
                                    <p className="mt-1 font-mono text-xs text-violet-100">Hancur {destroyed} objek • Ngobrol {talked} NPC • Skor {score}</p>
                                </div>
                                <div className="p-6">
                                    <p className="text-center text-sm leading-relaxed text-ink-2">
                                        Kamu udah jelajah & ngelampiasin stress. Sekarang giliran <b className="text-violet-700 dark:text-violet-300">Raycode bantu beresin tugas ngodingmu</b> — biar nggak perlu ngancurin beneran lagi 😁
                                    </p>
                                    <a href={waHref} target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-black text-white hover:bg-[#1ebe5a]"><MessageCircle className="size-4"/> Konsultasi Gratis Sekarang</a>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                        <button onClick={()=>{setWon(false); setEntities(INITIAL_ENTITIES); setNpcs(INITIAL_NPCS.map(n=>({...n,done:false}))); setDestroyed(0); setTalked(0); setScore(0); setPlayer({x:4*TILE+8,y:7*TILE+6});}} className="rounded-xl border border-line bg-card py-2.5 text-sm font-bold text-ink hover:bg-hover">Main Lagi</button>
                                        <a href="/" className="rounded-xl bg-slate-900 py-2.5 text-center text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"><Home className="size-4 inline"/> Beranda</a>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </PublicLayout>
    );
}
