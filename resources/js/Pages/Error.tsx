import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Compass,
    FileSearch,
    Home,
    Mail,
    RefreshCw,
    Search,
    ServerCrash,
    ShieldAlert,
    Terminal,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* ── Config per status ── */
type ErrorConf = {
    codeLabel: string;
    title: string;
    desc: string;
    ctaPrimary: string;
    ctaSecondary: string;
    icon: typeof FileSearch;
    hue: string;
};

const configs: Record<number, ErrorConf> = {
    404: {
        codeLabel: '404 — HALAMAN TIDAK DITEMUKAN',
        title: 'Ups, halaman ini\nngilang ke luar angkasa',
        desc: 'Link-nya mungkin typo, sudah dipindah, atau memang belum pernah ada. Tenang — kami bantu kamu balik ke jalur yang benar.',
        ctaPrimary: 'Kembali ke Beranda',
        ctaSecondary: 'Cari Proyek',
        icon: FileSearch,
        hue: 'sky',
    },
    403: {
        codeLabel: '403 — AKSES DITOLAK',
        title: 'Waduh, area ini\nkhusus kru terlarang',
        desc: 'Kamu tidak punya izin untuk membuka halaman ini. Kalau merasa ini salah, hubungi admin atau login dengan akun yang benar.',
        ctaPrimary: 'Kembali ke Beranda',
        ctaSecondary: 'Login',
        icon: ShieldAlert,
        hue: 'amber',
    },
    419: {
        codeLabel: '419 — SESI KADALUARSA',
        title: 'Sesi kamu\nsudah kadaluarsa',
        desc: 'Demi keamanan, sesi ini sudah habis. Refresh halaman dan coba lagi — data kamu tetap aman.',
        ctaPrimary: 'Muat Ulang',
        ctaSecondary: 'Kembali ke Beranda',
        icon: RefreshCw,
        hue: 'amber',
    },
    429: {
        codeLabel: '429 — TERLALU BANYAK PERMINTAAN',
        title: 'Wuih, kalem dulu\nkamu ngebut banget!',
        desc: 'Kami batasi permintaan biar server tetap ngebut buat semua. Tunggu sebentar lalu coba lagi.',
        ctaPrimary: 'Coba Lagi',
        ctaSecondary: 'Kembali ke Beranda',
        icon: Zap,
        hue: 'amber',
    },
    500: {
        codeLabel: '500 — KESALAHAN SERVER',
        title: 'Server kami\nlagi batuk sebentar',
        desc: 'Bukan salah kamu. Tim engineering sudah dapat alarm-nya. Coba refresh, atau hubungi kami kalau masih nyangkut.',
        ctaPrimary: 'Muat Ulang Halaman',
        ctaSecondary: 'Hubungi Tim',
        icon: ServerCrash,
        hue: 'red',
    },
    503: {
        codeLabel: '503 — MAINTENANCE MODE',
        title: 'Kami lagi\npoles sesuatu yang keren',
        desc: 'Raycode sedang upgrade biar lebih ngebut. Balik lagi dalam beberapa menit — bakal worth it!',
        ctaPrimary: 'Muat Ulang',
        ctaSecondary: 'Hubungi Kami',
        icon: Terminal,
        hue: 'sky',
    },
};

function getConf(status: number): ErrorConf {
    return configs[status] ?? configs[500];
}

/* ── Main Page ── */
export default function Error({ status, message }: { status: number; message?: string }) {
    const conf = getConf(status);
    const is404 = status === 404;
    const is500 = status === 500 || status === 503;
    const reduceMotion = useReducedMotion();

    // spotlight + parallax refs
    const wrapRef = useRef<HTMLElement>(null);
    const digitsRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (reduceMotion) return;
        const wrap = wrapRef.current;
        const digits = digitsRef.current;
        const cta = ctaRef.current;
        if (!wrap) return;

        let raf = 0;
        const onMove = (e: MouseEvent) => {
            const r = wrap.getBoundingClientRect();
            const mx = ((e.clientX - r.left) / r.width) * 100;
            const my = ((e.clientY - r.top) / r.height) * 100;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                wrap.style.setProperty('--mx', `${mx}%`);
                wrap.style.setProperty('--my', `${my}%`);
                if (digits) {
                    const dx = (mx - 50) * 0.12;
                    const dy = (my - 50) * 0.14;
                    digits.style.transform = `perspective(900px) rotateY(${dx * 0.08}deg) rotateX(${-dy * 0.06}deg)`;
                }
            });
        };
        // magnetic CTA
        let rafMag = 0;
        const ctaWrap = cta?.parentElement;
        const onCtaMove = (e: MouseEvent) => {
            if (!cta || !ctaWrap) return;
            const r = ctaWrap.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const dx = (e.clientX - cx) * 0.14;
            const dy = (e.clientY - cy) * 0.18;
            const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
            cancelAnimationFrame(rafMag);
            rafMag = requestAnimationFrame(() => {
                cta.style.transform = dist < 220 ? `translate3d(${dx}px, ${dy}px, 0)` : 'translate3d(0,0,0)';
            });
        };
        const onCtaLeave = () => { if (cta) cta.style.transform = 'translate3d(0,0,0)'; };

        wrap.addEventListener('mousemove', onMove, { passive: true });
        ctaWrap?.addEventListener('mousemove', onCtaMove, { passive: true });
        ctaWrap?.addEventListener('mouseleave', onCtaLeave);
        return () => {
            cancelAnimationFrame(raf); cancelAnimationFrame(rafMag);
            wrap.removeEventListener('mousemove', onMove);
            ctaWrap?.removeEventListener('mousemove', onCtaMove);
            ctaWrap?.removeEventListener('mouseleave', onCtaLeave);
        };
    }, [reduceMotion]);

    // typing effect for 500 terminal
    const terminalLines = [
        '$ raycode deploy --prod',
        '● Building project...',
        '✗ Error: Unexpected token at 0:0',
        '  → GET /api/status 500 Internal Server Error',
        '  → Retrying automatically...',
        '✓ Notified: engineering@raycode.dev',
    ];
    const [typed, setTyped] = useState<string[]>(is500 && !reduceMotion ? [] : terminalLines);
    useEffect(() => {
        if (!is500 || reduceMotion) return;
        let i = 0;
        const id = setInterval(() => {
            i++;
            setTyped(terminalLines.slice(0, i));
            if (i >= terminalLines.length) clearInterval(id);
        }, 380);
        return () => clearInterval(id);
    }, [is500, reduceMotion]);

    const primaryHref = status === 403 ? '/login' : status === 419 || status === 429 || status === 503 ? '#' : '/';
    const secondaryHref =
        status === 404 ? '/portfolio' : status === 403 ? '/' : status === 500 || status === 503 ? '/contact' : '/';

    // handle reload actions
    const handlePrimaryClick = (e: React.MouseEvent) => {
        if (status === 419 || status === 429 || status === 500 || status === 503) {
            e.preventDefault();
            window.location.reload();
        }
    };

    return (
        <section
            ref={wrapRef as any}
            className="hero-wrap relative flex min-h-screen flex-col overflow-hidden bg-[#0645c9] [--mx:52%] [--my:30%] dark:bg-[#041a6b]"
        >
            {/* ── Hero background layers (same as Home) ── */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a4fe0_0%,#0750dd_20%,#0645c9_40%,#0533a3_66%,#04207c_86%,#031a66_100%)] dark:bg-[linear-gradient(180deg,#062fb0_0%,#052a9e_20%,#041e7a_40%,#03185f_66%,#021247_86%,#010b33_100%)]" aria-hidden />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_52%_at_70%_22%,rgb(12_116_235/0.55),transparent_70%)] dark:bg-[radial-gradient(ellipse_58%_52%_at_70%_22%,rgb(8_65_130/0.36),transparent_70%)]" aria-hidden />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_52%_48%_at_8%_100%,rgb(2_10_70/0.52),transparent_64%)] dark:bg-[radial-gradient(ellipse_52%_48%_at_8%_100%,rgb(1_5_30/0.72),transparent_64%)]" aria-hidden />
            <div className="bg-grid-light mask-fade-y absolute inset-0 opacity-100 dark:opacity-40" aria-hidden />
            <div className="pointer-events-none absolute -top-44 -right-36 size-[720px] rounded-full border border-white/10 dark:border-white/[0.07]" aria-hidden />
            <div className="pointer-events-none absolute -top-24 -right-16 size-[520px] rounded-full border border-white/[0.07] dark:border-white/[0.05]" aria-hidden />
            <div className="pointer-events-none absolute -bottom-56 -left-44 size-[600px] rounded-full border border-white/[0.06] dark:border-white/[0.04]" aria-hidden />
            <div className="hero-spotlight hidden sm:block" aria-hidden />
            <ErrorDecorations />

            {/* ── Header minimal ── */}
            <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
                <Link href="/" className="group inline-flex items-center gap-2.5">
                    <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:rotate-3 group-hover:shadow-md">
                        <img src="/ray.png" alt="Raycode" width={36} height={36} className="size-9 object-contain p-1" />
                    </span>
                    <span className="font-mono text-lg font-semibold tracking-tight text-white">
                        ray<span className="text-white">code</span>
                    </span>
                </Link>
                <div className="hidden items-center gap-2 sm:flex">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[11px] font-medium tracking-wide text-sky-100 backdrop-blur">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
                        ERROR {status}
                    </span>
                    <a
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/15"
                    >
                        <Home className="size-3.5" /> Beranda
                    </a>
                </div>
            </header>

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-1 items-center">
                <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-12">
                    {/* LEFT — copy */}
                    <div className="relative">
                        <motion.div
                            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-sky-200 uppercase backdrop-blur">
                                <span className="size-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgb(253_224_71)]" aria-hidden />
                                {conf.codeLabel}
                            </span>
                            <h1 className="mt-5 text-4xl leading-[0.95] font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] whitespace-pre-line">
                                {conf.title}
                            </h1>
                            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-blue-100/80 sm:text-base">
                                {conf.desc}
                            </p>
                            {message && status !== 404 && (
                                <p className="mt-3 max-w-xl rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-sky-100/80">
                                    <span className="text-sky-300">›</span> {message}
                                </p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="mt-8 flex flex-wrap items-center gap-3"
                        >
                            <span className="magnetic-wrap">
                                <a
                                    ref={ctaRef}
                                    href={primaryHref}
                                    onClick={handlePrimaryClick}
                                    className="magnetic-btn group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#0a2e8a] shadow-[0_12px_32px_-12px_rgb(255_255_255/0.6),0_4px_12px_rgb(0_0_0/0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgb(255_255_255/0.7)]"
                                >
                                    {status === 500 || status === 419 || status === 429 || status === 503 ? (
                                        <RefreshCw className="size-4" />
                                    ) : (
                                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                                    )}
                                    {conf.ctaPrimary}
                                </a>
                            </span>
                            <a
                                href={secondaryHref}
                                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0"
                            >
                                {status === 404 ? <Compass className="size-4 text-sky-200" /> : status === 403 ? <Home className="size-4 text-sky-200" /> : <Mail className="size-4 text-sky-200" />}
                                {conf.ctaSecondary}
                                <ArrowUpRight className="size-3.5 opacity-70" />
                            </a>
                        </motion.div>

                        {/* quick links */}
                        <motion.div
                            initial={reduceMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35, duration: 0.5 }}
                            className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6"
                        >
                            <span className="mr-1 font-mono text-xs text-sky-200/60">Mungkin yang kamu cari:</span>
                            {[
                                { label: 'Layanan', href: '/services' },
                                { label: 'Portfolio', href: '/portfolio' },
                                { label: 'Cara Pesan', href: '/cara-pesan' },
                                { label: 'FAQ', href: '/faq' },
                                { label: 'Kontak', href: '/contact' },
                            ].map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-medium text-sky-100 transition hover:bg-white/10 hover:text-white"
                                >
                                    {l.label}
                                </a>
                            ))}
                        </motion.div>

                        {/* search mock for 404 */}
                        {is404 && (
                            <>
                                <motion.form
                                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45, duration: 0.5 }}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value?.trim();
                                        if (q) window.location.href = `/portfolio?search=${encodeURIComponent(q)}`;
                                    }}
                                    className="mt-6 flex max-w-md items-center gap-2 rounded-xl border border-white/15 bg-white/10 p-2 backdrop-blur"
                                >
                                    <Search className="ml-3 size-4 shrink-0 text-sky-200/60" />
                                    <input
                                        name="q"
                                        placeholder="Cari layanan, portfolio, atau artikel..."
                                        className="h-8 flex-1 bg-transparent text-sm text-white placeholder:text-sky-100/50 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 text-xs font-bold text-[#0a2e8a] transition hover:bg-sky-50"
                                    >
                                        Cari <ArrowRight className="size-3" />
                                    </button>
                                </motion.form>

                                {/* quick portfolio links for 404 */}
                            </>
                        )}
                    </div>

                    {/* RIGHT — visual */}
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:ml-auto"
                    >
                        {/* digits hero */}
                        <div
                            ref={digitsRef}
                            className="relative z-10 will-change-transform"
                            style={{ transition: 'transform 0.18s ease-out' }}
                        >
                            {/* floating code badge top */}
                            <div className="absolute -top-4 left-3 z-20 hidden items-center gap-1.5 rounded-full border border-sky-300/30 bg-[#03206e]/90 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_24px_2px_rgb(125_211_252/0.2),0_14px_34px_-10px_rgb(0_8_50/0.7)] sm:inline-flex">
                                <span className="size-2 animate-pulse rounded-full bg-emerald-400" aria-hidden />
                                {is404 ? 'raycode — 404 tracker active' : is500 ? 'raycode — incident reported' : 'raycode — guard active'}
                            </div>

                            {/* big status digits */}
                            <div className="relative overflow-hidden rounded-[2rem] border border-sky-300/20 bg-[linear-gradient(180deg,rgba(10,73,212,0.82),rgba(5,43,145,0.78))] p-8 shadow-[0_30px_80px_-20px_rgb(0_6_50/0.85)] sm:p-10">
                                <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" aria-hidden />
                                {/* window dots */}
                                <div className="mb-6 flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-red-400" />
                                    <span className="size-3 rounded-full bg-amber-400" />
                                    <span className="size-3 rounded-full bg-emerald-400" />
                                    <span className="ml-3 font-mono text-xs text-sky-200/70">
                                        {is404 ? '~/raycode • lost-page.tsx' : is500 ? '~/raycode • server.log' : '~/raycode • access.log'}
                                    </span>
                                    <span className="ml-auto rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-100 ring-1 ring-white/15">
                                        {String(status)}
                                    </span>
                                </div>

                                {/* animated digits */}
                                <div className="relative">
                                    <div className="flex items-end justify-center gap-1 sm:gap-2">
                                        {String(status)
                                            .split('')
                                            .map((ch, i) => (
                                                <motion.span
                                                    key={i}
                                                    initial={reduceMotion ? false : { y: 40, opacity: 0, rotateX: -20 }}
                                                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                                    transition={{
                                                        delay: 0.25 + i * 0.08,
                                                        duration: 0.55,
                                                        ease: [0.22, 1, 0.36, 1],
                                                    }}
                                                    className="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/0.35)] sm:text-[7.5rem] lg:text-[8.5rem]"
                                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    {ch}
                                                </motion.span>
                                            ))}
                                    </div>

                                    {/* scanning line for 404 */}
                                    {is404 && !reduceMotion && (
                                        <motion.div
                                            className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent shadow-[0_0_12px_rgb(125_211_252)]"
                                            initial={{ y: -60, opacity: 0 }}
                                            animate={{ y: 60, opacity: [0, 0.9, 0] }}
                                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
                                            aria-hidden
                                        />
                                    )}

                                    {/* glitch duplicates */}
                                    {!reduceMotion && (
                                        <>
                                            <span
                                                aria-hidden
                                                className="pointer-events-none absolute inset-0 flex items-end justify-center gap-1 sm:gap-2 opacity-[0.06] mix-blend-screen"
                                                style={{ transform: 'translate(2px,0)', filter: 'blur(0.6px)' }}
                                            >
                                                {String(status)
                                                    .split('')
                                                    .map((ch, i) => (
                                                        <span key={i} className="text-[5.5rem] font-black leading-none tracking-tighter text-sky-300 sm:text-[7.5rem] lg:text-[8.5rem]">
                                                            {ch}
                                                        </span>
                                                    ))}
                                            </span>
                                            <span
                                                aria-hidden
                                                className="pointer-events-none absolute inset-0 flex items-end justify-center gap-1 sm:gap-2 opacity-[0.05] mix-blend-screen"
                                                style={{ transform: 'translate(-2px,0)', filter: 'blur(0.8px)' }}
                                            >
                                                {String(status)
                                                    .split('')
                                                    .map((ch, i) => (
                                                        <span key={i} className="text-[5.5rem] font-black leading-none tracking-tighter text-amber-300 sm:text-[7.5rem] lg:text-[8.5rem]">
                                                            {ch}
                                                        </span>
                                                    ))}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* icon + label */}
                                <div className="mt-6 flex items-center justify-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-sky-200 ring-1 ring-white/15">
                                        <conf.icon className="size-5" />
                                    </span>
                                    <span className="font-mono text-xs font-semibold tracking-widest text-sky-200/80 uppercase">
                                        {is404 ? 'Halaman menghilang' : is500 ? 'Sistem dalam perbaikan' : 'Akses terbatas'}
                                    </span>
                                </div>

                                {/* terminal / code block */}
                                <div className="mt-7 overflow-hidden rounded-xl border border-white/10 bg-[#020c3a]/60 backdrop-blur">
                                    {is500 ? (
                                        <div className="p-4 font-mono text-[12px] leading-6">
                                            {typed.map((line, i) => (
                                                <div key={i} className="whitespace-pre">
                                                    {line.startsWith('$') ? (
                                                        <span className="font-semibold text-white">{line}</span>
                                                    ) : line.startsWith('●') ? (
                                                        <span className="font-semibold text-amber-300">{line}</span>
                                                    ) : line.startsWith('✗') ? (
                                                        <span className="font-semibold text-red-300">{line}</span>
                                                    ) : line.startsWith('✓') ? (
                                                        <span className="font-semibold text-emerald-300">{line}</span>
                                                    ) : (
                                                        <span className="text-sky-200/80">{line}</span>
                                                    )}
                                                </div>
                                            ))}
                                            {typed.length < terminalLines.length && (
                                                <span className="mt-1 inline-block h-4 w-2 animate-pulse bg-sky-300" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 font-mono text-[12px] leading-6 text-sky-100/85">
                                            <p className="text-sky-300">{'//'} raycode router</p>
                                            <p>
                                                <span className="text-slate-400">GET</span>{' '}
                                                <span className={is404 ? 'text-red-300' : 'text-amber-200'}>{window.location.pathname || '/halaman-tidak-ada'}</span>{' '}
                                                <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-red-300 ring-1 ring-red-400/20">→ {status}</span>
                                            </p>
                                            <p className="text-slate-400">
                                                {is404
                                                    ? 'Tip: cek typo, atau gunakan pencarian di samping.'
                                                    : 'Coba muat ulang atau kembali ke beranda.'}
                                            </p>
                                            <div className="mt-3 flex gap-1.5 font-mono text-[10px]">
                                                <span className="rounded bg-white/10 px-2 py-1 text-sky-200">raycode@web:~$</span>
                                                <span className="rounded bg-emerald-400/15 px-2 py-1 text-emerald-300 ring-1 ring-emerald-400/20">online</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="border-t border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-[11px] text-sky-200/50">
                                        {is404 ? '404 • Halaman tidak ditemukan • raycode.dev' : `ERROR ${status} • ${new Date().toLocaleTimeString('id-ID')} WIB • raycode.dev`}
                                    </div>
                                </div>
                            </div>

                            {/* bottom floating pill */}
                            <div className="absolute -bottom-4 right-6 z-20 hidden items-center gap-2 rounded-full border border-white/15 bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-xl sm:inline-flex">
                                <span className="flex size-6 items-center justify-center rounded-full bg-amber-400 text-slate-900">✦</span>
                                {is404 ? 'Eksplor lagi, yuk!' : is500 ? 'Tim kami sigap 24/7' : 'Hubungi admin jika perlu'}
                            </div>
                        </div>

                        {/* decorative floating orbs behind card */}
                        <div className="pointer-events-none absolute -top-10 -right-6 size-32 rounded-full bg-sky-400/15 blur-2xl" aria-hidden />
                        <div className="pointer-events-none absolute -bottom-10 -left-6 size-40 rounded-full bg-blue-500/15 blur-2xl" aria-hidden />
                    </motion.div>
                </div>
            </div>

            {/* footer mini */}
            <div className="relative z-10 border-t border-white/10 bg-[#031a66]/40 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-4 text-xs text-sky-200/60 sm:flex-row lg:px-8">
                    <p className="font-mono">© {new Date().getFullYear()} Raycode Studio • Crafted with ♥ in Jakarta — Remote-first</p>
                    <p className="flex items-center gap-2 font-mono">
                        <Terminal className="size-3.5 text-sky-300/70" />
                        $ echo "kembali lebih kuat" <span className="hidden sm:inline">• raycode.dev</span>
                    </p>
                </div>
            </div>

            {/* WA melayang — sama kayak PublicLayout biar tetap bisa chat */}
            <ErrorFloatingWhatsApp />
        </section>
    );
}

function ErrorFloatingWhatsApp() {
    // ambil whatsapp dari shared Inertia props (sama kayak PublicLayout), fallback ke default
    let waNumber = '6281234567890';
    let waHref = 'https://wa.me/6281234567890?text=Halo%20Raycode%20%F0%9F%91%8B%2C%20saya%20tertarik%20diskusi%20proyek';
    try {
        const page = usePage<{ settings?: Record<string, string> }>();
        const raw = (page.props as any)?.settings?.whatsapp ?? '+6281234567890';
        waNumber = String(raw).replace(/[^0-9]/g, '') || waNumber;
        waHref = `https://wa.me/${waNumber}?text=Halo%20Raycode%20%F0%9F%91%8B%2C%20saya%20tertarik%20diskusi%20proyek`;
    } catch {}
    return (
        <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-2">
            <div className="relative inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-1.5 text-[11px] font-extrabold tracking-widest text-white shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)] ring-1 ring-white/10">
                <span className="relative flex size-2">
                    <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-400 opacity-75" aria-hidden />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" aria-hidden />
                </span>
                KAMI SIAP 24 JAM
                <span className="absolute -bottom-1 right-6 size-2 rotate-45 bg-slate-900 ring-1 ring-white/10" aria-hidden />
            </div>
            <a
                href={waHref}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Chat di WhatsApp"
                className="group flex items-center gap-3"
            >
                <span className="hidden items-center rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:inline-flex translate-x-2 opacity-0">
                    Chat di WhatsApp
                </span>
                <span className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_-8px_rgb(37_211_102/0.6),0_4px_12px_rgb(0_0_0/0.15)] transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_40px_-8px_rgb(37_211_102/0.7),0_8px_20px_rgb(0_0_0/0.2)] active:scale-95 sm:size-[60px]">
                    <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" aria-hidden />
                    <svg viewBox="0 0 24 24" className="relative size-7 sm:size-8 fill-white" aria-hidden>
                        <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9 1 1-2.9-.2-.3a8.2 8.2 0 1 1 6.6 3.6Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white">
                        <span className="size-1.5 animate-pulse rounded-full bg-white" />
                    </span>
                </span>
            </a>
        </div>
    );
}

function ErrorDecorations() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {/* orbit like hero */}
            <svg
                className="absolute top-[14%] left-[3%] w-16 text-white/15 sm:w-20"
                style={{ animation: 'float 7s ease-in-out infinite' } as any}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
            >
                <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
                <ellipse cx="12" cy="12" rx="10" ry="4.2" />
                <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
                <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
            </svg>
            <span className="absolute top-[58%] left-[5%] hidden font-mono text-2xl font-bold text-white/12 select-none sm:block" style={{ animation: 'float 10s ease-in-out infinite' } as any}>
                {'</>'}
            </span>
            <span className="absolute bottom-[18%] right-[8%] hidden font-mono text-xl text-white/8 select-none lg:block">{'{ }'}</span>
            <span className="absolute top-[10%] right-[28%] size-1.5 rounded-full bg-sky-300/60" style={{ animation: 'pulse-dot 2.2s ease-in-out infinite' } as any} />
            <span className="absolute bottom-[14%] left-[40%] size-1 rounded-full bg-white/40" />
            <span className="absolute top-[46%] right-[6%] size-1 rounded-full bg-sky-300/40" />
            {/* shooting star */}
            <span className="absolute top-[20%] left-[18%] h-px w-20 -rotate-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60" style={{ animation: 'sheen 2.4s ease-in-out 1s infinite' } as any} />
        </div>
    );
}
