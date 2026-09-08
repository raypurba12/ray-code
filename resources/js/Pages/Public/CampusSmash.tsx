import { PublicLayout } from '@/Components/layout/PublicLayout';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Hammer, RotateCcw, Trophy, Zap, MessageCircle, Home, Target, Flame, Clock } from 'lucide-react';

type Crack = { id: number; x: number; y: number; size: number; rot: number };
type Debris = { id: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; type: 'concrete'|'glass'|'brick' };
type HitFx = { id: number; x: number; y: number; dmg: number };

const WEAPONS = [
    { id: 'skripsi', label: 'Tumpukan Skripsi', emoji: '📚', dmg: 12, color: 'bg-amber-400' },
    { id: 'laptop', label: 'Laptop Ngelag', emoji: '💻', dmg: 14, color: 'bg-sky-400' },
    { id: 'deadline', label: 'Deadline H-1', emoji: '💥', dmg: 18, color: 'bg-red-400' },
] as const;

function useWaHref() {
    try {
        const { settings } = usePage<{ settings?: Record<string,string> }>().props as any;
        const raw = settings?.whatsapp ?? '+6281234567890';
        const num = String(raw).replace(/[^0-9]/g,'');
        return `https://wa.me/${num}?text=Halo%20Raycode%20%F0%9F%94%A8%20habis%20main%20Campus%20Smash%20nih%2C%20mau%20konsultasi%20tugas%2Fproject`;
    } catch { return 'https://wa.me/6281234567890?text=Halo%20Raycode'; }
}

export default function CampusSmash() {
    const waHref = useWaHref();
    const reduceMotion = useReducedMotion();
    const buildingRef = useRef<HTMLDivElement>(null);

    const [weaponIdx, setWeaponIdx] = useState(0);
    const weapon = WEAPONS[weaponIdx];

    const [hp, setHp] = useState(100);
    const [score, setScore] = useState(0);
    const [hits, setHits] = useState(0);
    const [combo, setCombo] = useState(0);
    const [bestCombo, setBestCombo] = useState(0);
    const [state, setState] = useState<'idle'|'playing'|'destroyed'>('idle');
    const [cracks, setCracks] = useState<Crack[]>([]);
    const [debris, setDebris] = useState<Debris[]>([]);
    const [hitFxs, setHitFxs] = useState<HitFx[]>([]);
    const [shakeKey, setShakeKey] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [showHelp, setShowHelp] = useState(true);

    const hpPct = Math.max(0, hp);

    // timer when playing
    useEffect(() => {
        if (state !== 'playing') return;
        if (hpPct <= 0) return;
        const id = setInterval(() => {
            setTimeLeft(v => {
                if (v <= 1) {
                    setState('idle');
                    return 45;
                }
                return v - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [state, hpPct]);

    // physics for debris - lightweight gravity
    useEffect(() => {
        if (debris.length === 0) return;
        let raf = 0;
        const tick = () => {
            setDebris(prev => {
                const next = prev.map(d => ({
                    ...d,
                    x: d.x + d.vx,
                    y: d.y + d.vy,
                    vy: d.vy + 0.55,
                    vx: d.vx * 0.998,
                    rot: d.rot + d.vr,
                })).filter(d => d.y < 520);
                // cap at 45 debris to stay light
                return next.length > 45 ? next.slice(-45) : next;
            });
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [debris.length]);

    // combo decay
    useEffect(() => {
        if (combo === 0) return;
        const t = setTimeout(() => setCombo(0), 1400);
        return () => clearTimeout(t);
    }, [combo]);

    const spawnHit = useCallback((relX: number, relY: number) => {
        const dmg = weapon.dmg + Math.floor(Math.random()*6) + (combo>3 ? 4 : 0);
        const id = Date.now() + Math.random();
        setCracks(c => [...c.slice(-24), { id, x: relX, y: relY, size: 34 + Math.random()*42, rot: Math.random()*360 }]);
        setHitFxs(f => [...f.slice(-6), { id, x: relX, y: relY, dmg }]);
        setTimeout(() => setHitFxs(f => f.filter(x=>x.id!==id)), 700);

        // spawn 3-5 debris realistis (beton/kaca)
        const n = 3 + Math.floor(Math.random()*3);
        const newDebris: Debris[] = Array.from({length:n}).map((_,i)=>({
            id: id+i*0.1 + Math.random(),
            x: relX*3.2, // map 0-100% to px approx (building 360px wide)
            y: relY*2.2,
            vx: (Math.random()-0.5)*9,
            vy: -4 - Math.random()*6,
            rot: Math.random()*360,
            vr: (Math.random()-0.5)*18,
            size: 8 + Math.random()*14,
            type: (['concrete','glass','brick'] as const)[Math.floor(Math.random()*3)]
        }));
        setDebris(d => [...d, ...newDebris]);
        setShakeKey(k=>k+1);
        setHp(h => {
            const nh = h - dmg;
            if (nh <= 0) {
                setState('destroyed');
                // burst debris
                const burst: Debris[] = Array.from({length:18}).map((_,i)=>({
                    id: 9000+i+Math.random(),
                    x: 170 + (Math.random()-0.5)*140,
                    y: 80 + Math.random()*120,
                    vx: (Math.random()-0.5)*14,
                    vy: -8 - Math.random()*8,
                    rot: Math.random()*360, vr: (Math.random()-0.5)*22,
                    size: 10+Math.random()*16,
                    type: (['concrete','brick','glass'] as const)[i%3]
                }));
                setTimeout(()=> setDebris(d=>[...d, ...burst]), 80);
            }
            return nh;
        });
        setScore(s=> s + dmg*10 + combo*5);
        setHits(h=>h+1);
        setCombo(c=>{
            const nc=c+1;
            setBestCombo(b=> Math.max(b,nc));
            return nc;
        });
        if (state==='idle') { setState('playing'); setShowHelp(false); }
        // vibration on mobile if available
        try{ (navigator as any).vibrate?.(28); }catch{}
    }, [weapon, combo, state]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (state==='destroyed') return;
        const r = buildingRef.current?.getBoundingClientRect();
        if (!r) return;
        const x = ((e.clientX - r.left)/r.width)*100;
        const y = ((e.clientY - r.top)/r.height)*100;
        // only if hit inside building (ignore sky)
        if (x<4||x>96||y<6||y>96) return;
        spawnHit(x,y);
    };

    const reset = () => {
        setHp(100); setScore(0); setHits(0); setCombo(0); setCracks([]); setDebris([]); setHitFxs([]);
        setTimeLeft(45); setState('idle'); setShowHelp(true);
    };

    return (
        <PublicLayout>
            {/* top hero banner */}
            <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#0a0d14]">
                <div className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{backgroundImage:'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize:'32px 32px'}} />
                <div className="relative mx-auto max-w-7xl px-5 py-8 lg:px-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-400 px-3 py-1 text-xs font-black tracking-widest text-slate-900 uppercase">
                                <Flame className="size-3.5" /> Stress Release Game
                            </span>
                            <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
                                Pusing Ngoding? <span className="text-brand-600 dark:text-brand-400">Ancurin Kampus Dulu!</span>
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-2">
                                Lampiasin stress tugas & skripsi — klik brutal gedung kampus sampai rata. Abis puas, baru kita bantu beresin kodingannya. <span className="font-semibold text-ink">Realistis tapi tetap ringan, lancar di HP kentang.</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink hover:bg-hover">
                                <Home className="size-4"/> Beranda
                            </a>
                            <a href={waHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-[#1ebe5a]">
                                <MessageCircle className="size-4"/> Konsultasi
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* game area */}
            <section className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    {/* left - game canvas */}
                    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm dark:border-white/10">
                        {/* stats bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-alt/60 px-4 py-3 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                                    <Clock className="size-3.5"/> {timeLeft}s
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 font-mono text-xs font-semibold text-ink">
                                    <Target className="size-3.5 text-brand-500"/> {hits} hits
                                </span>
                                {combo>1 && (
                                    <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 font-mono text-xs font-black text-slate-900">
                                        COMBO x{combo}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="font-mono font-semibold text-ink-3">Skor</span>
                                <span className="rounded-lg bg-brand-600 px-3 py-1.5 font-mono text-sm font-black text-white">{score.toLocaleString('id-ID')}</span>
                                <button onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:bg-hover">
                                    <RotateCcw className="size-3.5"/> Ulang
                                </button>
                            </div>
                        </div>

                        {/* HP bar */}
                        <div className="px-4 pt-4">
                            <div className="flex items-center justify-between font-mono text-xs">
                                <span className="font-semibold tracking-widest text-ink-3 uppercase">Kekuatan Gedung</span>
                                <span className={`font-bold ${hpPct<30?'text-red-500': hpPct<60?'text-amber-500':'text-emerald-500'}`}>{hpPct}%</span>
                            </div>
                            <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-slate-200 p-1 dark:bg-white/10">
                                <motion.div
                                    className={`h-full rounded-full ${hpPct<30?'bg-red-500': hpPct<60?'bg-amber-500':'bg-emerald-500'}`}
                                    animate={{ width: `${hpPct}%` }}
                                    transition={{ type:'spring', stiffness:120, damping:18 }}
                                />
                            </div>
                        </div>

                        {/* building stage */}
                        <div className="relative p-4">
                            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-sky-100 via-sky-50 to-slate-100 dark:border-white/10 dark:from-[#0f172a] dark:via-[#0b1220] dark:to-[#080c16]"
                                 style={{ height: 420 }}
                            >
                                {/* sky deco */}
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 to-transparent dark:from-white/[0.04]" />
                                <div className="pointer-events-none absolute top-6 left-8 size-16 rounded-full bg-amber-300/30 blur-xl" />
                                <div className="pointer-events-none absolute top-10 right-12 size-20 rounded-full bg-sky-400/20 blur-xl" />

                                {/* ground */}
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-300/80 to-transparent dark:from-black/40" />
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-slate-300 dark:bg-white/10" />

                                {/* building */}
                                <motion.div
                                    key={shakeKey}
                                    ref={buildingRef}
                                    onPointerDown={handlePointerDown}
                                    animate={reduceMotion ? undefined : (shakeKey ? { x:[0,-6,6,-5,5,-3,3,0], y:[0,0,0,-2,2,0] } : {})}
                                    transition={{ duration:0.28, ease:'easeOut' }}
                                    className={`absolute left-1/2 top-6 flex w-[88%] max-w-[380px] -translate-x-1/2 cursor-crosshair select-none flex-col items-center touch-manipulation ${state==='destroyed' ? 'pointer-events-none' : ''}`}
                                    style={{ filter: state==='destroyed' ? 'grayscale(0.2) brightness(0.9)' : undefined }}
                                >
                                    {/* building image realistis ringan */}
                                    <div className={`relative w-full overflow-hidden rounded-t-sm border-x border-t border-slate-400/50 bg-slate-200 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.35)] dark:border-white/15 ${state==='destroyed' ? 'translate-y-[36px] rotate-[1.2deg] scale-y-[0.72] origin-bottom' : ''}`}
                                         style={{ height: 300, transition:'transform 0.9s cubic-bezier(0.22,1,0.36,1)' }}
                                    >
                                        {/* foto gedung realistis via CDN (WebP, ringan) */}
                                        <img
                                            src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop"
                                            alt="Gedung kampus"
                                            className="h-full w-full object-cover"
                                            draggable={false}
                                            loading="eager"
                                        />
                                        {/* overlay biar nyambung brand + biar retakan keliatan */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-white/10 mix-blend-overlay" />
                                        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{backgroundImage:'linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)', backgroundSize:'18px 22px'}} />
                                        {/* jendela glow */}
                                        <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen" style={{backgroundImage:'repeating-linear-gradient(0deg, transparent 0 22px, rgb(251 191 36 / 0.35) 22px 23px)'}} />

                                        {/* cracks overlay */}
                                        {cracks.map(c=>(
                                            <CrackMark key={c.id} x={c.x} y={c.y} size={c.size} rot={c.rot} />
                                        ))}

                                        {/* hit flash */}
                                        <AnimatePresence>
                                            {hitFxs.map(h=>(
                                                <motion.div
                                                    key={h.id}
                                                    initial={{ scale:0.6, opacity:1, y:0 }}
                                                    animate={{ scale:1.2, opacity:0, y:-14 }}
                                                    exit={{ opacity:0 }}
                                                    transition={{ duration:0.6, ease:'easeOut' }}
                                                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-mono text-sm font-black text-amber-300 drop-shadow-[0_2px_6px_rgb(0_0_0/0.8)]"
                                                    style={{ left:`${h.x}%`, top:`${h.y}%` }}
                                                >
                                                    -{h.dmg} • +{h.dmg*10}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* damage vignette based on hp */}
                                        <div className="pointer-events-none absolute inset-0 bg-red-500/0 transition-colors" style={{ backgroundColor: `rgb(239 68 68 / ${Math.max(0,(100-hpPct)/420)})` }} />

                                        {/* collapsed dust when destroyed */}
                                        {state==='destroyed' && (
                                            <motion.div
                                                initial={{ opacity:0, scale:0.8 }}
                                                animate={{ opacity:1, scale:1 }}
                                                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-500/50 via-stone-400/20 to-transparent"
                                            />
                                        )}
                                    </div>
                                    {/* podium / tangga */}
                                    <div className="h-3 w-[104%] -translate-y-px rounded-sm bg-slate-300 shadow dark:bg-white/15" />
                                    <div className="h-2 w-[108%] rounded-sm bg-slate-400/80 dark:bg-white/10" />
                                    {/* shadow */}
                                    <div className="pointer-events-none absolute -bottom-6 left-1/2 h-6 w-[78%] -translate-x-1/2 rounded-full bg-black/15 blur-xl dark:bg-black/40" />
                                </motion.div>

                                {/* debris layer */}
                                {debris.map(d=>(
                                    <div
                                        key={d.id}
                                        className={`pointer-events-none absolute rounded-sm shadow-sm ${d.type==='glass' ? 'bg-sky-200/80 backdrop-blur' : d.type==='brick' ? 'bg-red-300' : 'bg-stone-300' }`}
                                        style={{
                                            left: `calc(50% - 190px + ${d.x}px)`,
                                            top: `${60 + d.y}px`,
                                            width: d.size,
                                            height: d.size*0.72,
                                            transform: `rotate(${d.rot}deg)`,
                                            border: d.type==='concrete' ? '1px solid rgb(0 0 0 / 0.15)' : undefined,
                                        }}
                                    />
                                ))}

                                {/* dust cloud when destroyed */}
                                <AnimatePresence>
                                    {state==='destroyed' && !reduceMotion && (
                                        <motion.div
                                            initial={{ opacity:0, y:20 }}
                                            animate={{ opacity:1, y:0 }}
                                            className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-[86%] -translate-x-1/2 rounded-[40%] bg-stone-400/30 blur-2xl dark:bg-stone-500/25"
                                        />
                                    )}
                                </AnimatePresence>

                                {/* help overlay */}
                                <AnimatePresence>
                                    {showHelp && state==='idle' && (
                                        <motion.div
                                            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/55 p-6 text-center backdrop-blur-[2px] dark:bg-[#020617]/60"
                                        >
                                            <div className="rounded-2xl border border-white/15 bg-white px-6 py-5 text-slate-900 shadow-xl dark:bg-[#101625] dark:text-white">
                                                <p className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 text-xs font-black uppercase text-slate-900">
                                                    <Hammer className="size-3.5"/> Cara main
                                                </p>
                                                <p className="mt-3 text-sm font-semibold leading-relaxed">
                                                    Klik / tap brutal gedung kampus!<br/>
                                                    <span className="text-ink-2">Tiap klik = retakan + debris realistis. Combo kalau ngeklik cepat!</span>
                                                </p>
                                                <button onClick={()=>{setShowHelp(false); setState('playing');}} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
                                                    <Zap className="size-4"/> Mulai Ngancurin
                                                </button>
                                                <p className="mt-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">Ringan • 60fps • lancar di HP</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* weapon picker */}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-semibold tracking-widest text-ink-3 uppercase">Senjata:</span>
                                {WEAPONS.map((w,i)=>(
                                    <button
                                        key={w.id}
                                        onClick={()=>setWeaponIdx(i)}
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${weaponIdx===i ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900' : 'border-line bg-card text-ink hover:bg-hover'}`}
                                    >
                                        <span>{w.emoji}</span> {w.label} <span className={`rounded px-1.5 py-0.5 text-[10px] ${w.color} text-slate-900`}>-{w.dmg}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* right - info + CTA */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-line bg-card p-5 dark:border-white/10">
                            <h3 className="flex items-center gap-2 text-sm font-black tracking-tight text-ink">
                                <Trophy className="size-4 text-amber-500"/> Statistik Ngamuk
                            </h3>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-alt p-3 text-center dark:bg-white/[0.04]">
                                    <p className="font-mono text-xs font-semibold text-ink-3">Skor</p>
                                    <p className="mt-1 font-mono text-lg font-black text-ink">{score}</p>
                                </div>
                                <div className="rounded-xl bg-alt p-3 text-center dark:bg-white/[0.04]">
                                    <p className="font-mono text-xs font-semibold text-ink-3">Hits</p>
                                    <p className="mt-1 font-mono text-lg font-black text-ink">{hits}</p>
                                </div>
                                <div className="rounded-xl bg-amber-400 p-3 text-center">
                                    <p className="font-mono text-xs font-black text-slate-900">Best Combo</p>
                                    <p className="mt-1 font-mono text-lg font-black text-slate-900">x{bestCombo}</p>
                                </div>
                            </div>
                            <div className="mt-4 rounded-xl border border-hairline bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                                <p className="font-mono text-xs font-bold text-ink">💡 Tips realistis ringan:</p>
                                <ul className="mt-1.5 list-disc space-y-1 pl-4 font-mono text-xs leading-relaxed text-ink-2">
                                    <li>Klik cepat = combo + damage bonus</li>
                                    <li>Ganti senjata buat damage beda</li>
                                    <li>Gedung foto asli, ancur pakai retakan overlay — jadi ringan tapi keliatan nyata</li>
                                </ul>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-500/20 dark:bg-brand-500/10">
                            <h3 className="text-sm font-black text-ink">Udah puas ngancurin?</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                                Sekarang biar <b className="text-brand-700 dark:text-brand-300">Raycode yang beresin kodinganmu</b> — skripsi, web, aplikasi. Nggak perlu ngancurin beneran 😅
                            </p>
                            <a href={waHref} target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow hover:bg-[#1ebe5a]">
                                <MessageCircle className="size-4"/> Konsultasi Gratis di WA
                            </a>
                            <a href="/portfolio" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-3 text-sm font-bold text-ink hover:bg-hover">
                                Lihat Hasil Kami →
                            </a>
                            <p className="mt-2 text-center font-mono text-[11px] text-ink-3">Balas cepat • Gratis tanya dulu</p>
                        </div>

                        <div className="rounded-xl border border-dashed border-line bg-alt/40 p-3 text-center font-mono text-xs text-ink-3 dark:border-white/10 dark:bg-white/[0.02]">
                            Game ini cuma pelampiasan virtual. Jangan ancurin kampus beneran ya! 😁<br/>
                            <span className="text-ink-2">Butuh bantuan ngoding? Raycode siap 24 jam.</span>
                        </div>
                    </div>
                </div>

                {/* destroyed modal */}
                <AnimatePresence>
                    {state==='destroyed' && (
                        <motion.div
                            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
                                className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0e1422]"
                            >
                                <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-4 text-center">
                                    <p className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-black tracking-widest text-white uppercase">
                                        <Flame className="size-3.5 text-amber-400"/> Gedung Rata!
                                    </p>
                                    <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">PUAS? LEGA? 😎</h3>
                                    <p className="mt-1 font-mono text-xs font-semibold text-slate-900/70">Skor {score} • {hits} hits • Combo x{bestCombo}</p>
                                </div>
                                <div className="p-6">
                                    <p className="text-center text-sm leading-relaxed text-ink-2">
                                        Stress udah keluar. Sekarang waktunya <b className="text-ink">fokus beresin tugas beneran</b> — biar nggak perlu ngancurin lagi.
                                    </p>
                                    <div className="mt-5 grid gap-2">
                                        <a href={waHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-black text-white hover:bg-[#1ebe5a]">
                                            <MessageCircle className="size-4"/> Konsultasi Gratis Sekarang
                                        </a>
                                        <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-5 py-3 text-sm font-bold text-ink hover:bg-hover">
                                            <RotateCcw className="size-4"/> Main Lagi — Ancurin Lagi
                                        </button>
                                        <a href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                                            <Home className="size-4"/> Balik ke Beranda
                                        </a>
                                    </div>
                                    <p className="mt-4 text-center font-mono text-[11px] text-ink-3">Raycode siap bantu ngoding 24 jam — chat aja dulu gratis.</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </PublicLayout>
    );
}

function CrackMark({ x, y, size, rot }: { x:number; y:number; size:number; rot:number }) {
    // SVG retakan realistis ringan: garis patah-patah
    const id = `${x}-${y}`;
    return (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left:`${x}%`, top:`${y}%`, width:size, height:size, transform:`translate(-50%,-50%) rotate(${rot}deg)` }}>
            <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_1px_2px_rgb(0_0_0/0.6)]">
                <path d="M50 8 L52 28 L44 42 L58 56 L48 72 L54 92" stroke="rgb(20 20 20 / 0.95)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M50 28 L68 34 L74 48" stroke="rgb(20 20 20 / 0.85)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                <path d="M44 42 L28 38 L18 52" stroke="rgb(20 20 20 / 0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M58 56 L72 62 L84 70" stroke="rgb(20 20 20 / 0.8)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                <path d="M48 72 L32 78" stroke="rgb(20 20 20 / 0.75)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                {/* highlight retakan */}
                <path d="M50 8 L52 28 L44 42 L58 56 L48 72 L54 92" stroke="rgb(255 255 255 / 0.35)" strokeWidth="0.7" fill="none" strokeLinecap="round"/>
            </svg>
            {/* debu kecil di titik hit */}
            <span className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/15 blur-[6px]" />
        </div>
    );
}
