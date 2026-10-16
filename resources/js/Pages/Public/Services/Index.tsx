import { R } from '@/lib/routes';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { SeoHead } from '@/Components/SeoHead';
import { Reveal } from '@/Components/Reveal';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import {
    BarChart3,
    Blocks,
    BrainCircuit,
    Bug,
    Calculator,
    Code2,
    Cpu,
    Database,
    FileText,
    Gamepad2,
    Globe,
    GraduationCap,
    Layers,
    MonitorSmartphone,
    Network,
    Presentation,
    Server,
    Shield,
    Smartphone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface JokiService {
    id: number;
    slug: string;
    title: string;
    title_en: string | null;
    desc: string;
    desc_en: string | null;
    category: string;
    category_en: string | null;
    icon: string;
    logo: string | null;
}

interface Props {
    services: { id:number; slug:string; title:string; short_desc:string; icon:string; logo?:string|null; type:'package'|'joki'; category?:string|null; category_en?:string|null }[];
    jokiServices: JokiService[];
    jokiHeader: { badge: string; title: string; desc: string };
    activeType: string | null;
}

const iconMap: Record<string, LucideIcon> = {
    smartphone: Smartphone,
    'monitor-smartphone': MonitorSmartphone,
    code2: Code2,
    globe: Globe,
    layers: Layers,
    server: Server,
    database: Database,
    blocks: Blocks,
    'brain-circuit': BrainCircuit,
    'bar-chart3': BarChart3,
    'graduation-cap': GraduationCap,
    'file-text': FileText,
    presentation: Presentation,
    calculator: Calculator,
    gamepad2: Gamepad2,
    cpu: Cpu,
    network: Network,
    shield: Shield,
    bug: Bug,
};

function getIcon(name: string): LucideIcon {
    return iconMap[name] ?? Code2;
}

export default function ServicesIndex({ services, jokiServices, jokiHeader, activeType }: Props) {
    const { t, locale } = useI18n();
    const { settings } = usePage<{ settings: Record<string, string> }>().props as unknown as { settings: Record<string, string> };
    const waNumber = (settings?.whatsapp ?? '+6281234567890').replace(/[^0-9]/g, '');
    const waHref = `https://wa.me/${waNumber}?text=Halo%20Raycode!%20Saya%20tertarik%20dengan%20jasa%20coding`;
    const [active, setActive] = useState<string>(() => t('common.all'));

    // PRD FR-2 fix: services prop sudah difilter ?type=package|joki di BE — FE harus hormati activeType
    // Jika activeType=package → tampilkan paket (services = 6), jika joki → jokiServices (59), jika null → jokiServices (legacy) + paket? Untuk SEO single source kita tampilkan sesuai filter.
    const baseList: any[] = useMemo(() => {
        if (activeType === 'package') return services; // 6 paket
        if (activeType === 'joki') return jokiServices; // 59 joki
        // tanpa filter: tetap tampilkan joki (59) biar tidak dobel 65, tapi beri tab untuk pindah
        return jokiServices;
    }, [activeType, services, jokiServices]);

    const setType = (type: string | null) => {
        const url = type ? `/services?type=${type}` : '/services';
        // pakai window.location agar SSR & SEO 301 tetap konsisten dengan redirect
        window.location.href = url;
    };

    // helper to get localized field
    const loc = (id: string, en: string | null) => (locale === 'en' && en ? en : id);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(baseList.map((s) => loc(s.category ?? (s as any).category, (s as any).category_en)))).sort();
        return [t('common.all'), ...cats];
    }, [baseList, locale]);

    const filtered = useMemo(() => {
        if (active === t('common.all')) return baseList;
        return baseList.filter((s) => loc(s.category ?? '', (s as any).category_en ?? null) === active);
    }, [active, baseList, locale]);

    useEffect(() => {
        setActive(t('common.all'));
    }, [locale, activeType]);

    return (
        <PublicLayout>
            <SeoHead
                title="Layanan Pengembangan Web & Joki Koding"
                description="Jelajahi seluruh layanan pengembangan web, web app, joki koding, debugging, dan konsultasi dari Raycode Studio."
            />
            <section className="relative overflow-hidden">
                <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-10 lg:px-8 lg:pt-20">
                    <Reveal>
                        <div className="mx-auto max-w-3xl text-center">
                            <span className="inline-flex items-center rounded-full bg-amber-400 px-4 py-1.5 text-xs font-extrabold tracking-widest text-slate-900 uppercase shadow-sm">
                                {jokiHeader.badge}
                            </span>
                            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">{jokiHeader.title}</h1>
                            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-2">{jokiHeader.desc}</p>
                            <a
                                href={waHref}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="mt-6 inline-flex h-11 items-center rounded-full bg-emerald-500 px-7 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgb(16_185_129/0.6)] transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
                            >
                                {t('services.freeConsult')}
                            </a>
                        </div>
                    </Reveal>

                    {/* PRD FR-2: tab Paket vs Joki — SEO single source ?type= */}
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        <button onClick={()=>setType(null)} className={!activeType ? 'rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-900' : 'rounded-full border border-line bg-card px-5 py-2 text-sm font-medium text-ink-2 hover:bg-hover dark:border-white/10 dark:bg-white/[0.04]'}>{t('services.tabAll')}</button>
                        <button onClick={()=>setType('package')} className={activeType==='package' ? 'rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-sm' : 'rounded-full border border-line bg-card px-5 py-2 text-sm font-medium text-ink-2 hover:bg-hover dark:border-white/10 dark:bg-white/[0.04]'}>{t('services.tabPackage')} ({services.filter(s=>s.type==='package').length || 6})</button>
                        <button onClick={()=>setType('joki')} className={activeType==='joki' ? 'rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-sm' : 'rounded-full border border-line bg-card px-5 py-2 text-sm font-medium text-ink-2 hover:bg-hover dark:border-white/10 dark:bg-white/[0.04]'}>{t('services.tabJoki')} ({jokiServices.length})</button>
                    </div>
                    <p className="mt-2 text-center text-xs text-ink-4">Aktif: <span className="font-mono font-bold">{activeType ?? 'joki (default)'}</span> — URL <span className="font-mono">{activeType ? `/services?type=${activeType}` : '/services'}</span></p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActive(cat)}
                                className={
                                    active === cat
                                        ? 'rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm dark:bg-white dark:text-slate-900'
                                        : 'rounded-full border border-line bg-card px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]'
                                }
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <p className="mt-4 text-center text-xs text-ink-4">
                        {t('services.showCount')} {filtered.length} {t('services.of')} {baseList.length} {t('services.services')}
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
                {filtered.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('services.empty')}</p>
                        <p className="mt-1 text-xs text-slate-400">{t('services.emptyHint')}</p>
                    </div>
                ) : activeType === 'package' ? (
                    /* ── Paket view — exact ap.png: white card, blue icon box, START FROM, price 25k style, Konsultasi Gratis outline ── */
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {filtered.map((service: any, i: number) => {
                            const Icon = getIcon(service.icon);
                            const title = loc(service.title, service.title_en ?? null);
                            const descRaw = service.desc ?? service.short_desc ?? '';
                            const desc = loc(descRaw, service.desc_en ?? null);
                            // price like ap.png: 25k,80k — for paket 750k->750k, 2jt->2000k? we show k/jt hybrid to match ap.png visual
                            const priceNum: number = service.starting_price ?? (service as any).price ?? 80000;
                            const priceLabel = priceNum >= 1_000_000 ? `${Math.round(priceNum/1_000_000)}jt`.replace('1jt','1000k') : `${Math.round(priceNum/1_000)}k`;
                            // WA prefill per service
                            const waHrefPkg = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Raycode! Saya mau konsultasi paket ${title}`)}`;
                            const isHighlighted = service.slug === 'bikin-aplikasi-mobile' || title.toLowerCase().includes('mobile') || i===2; // border blue like ap.png 3rd card
                            return (
<Reveal key={service.slug} delay={(i % 4) * 40}>
                                <div className={`service-card-hover flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm ${isHighlighted ? 'border-blue-400 ring-1 ring-blue-100 shadow-[0_12px_32px_-12px_rgb(37_99_235/0.2)] dark:border-brand-500/50 dark:ring-brand-500/20 dark:shadow-[0_12px_32px_-12px_rgb(37_99_235/0.45)]' : 'border-line'}`}>
                                        <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                            {service.logo ? <img src={service.logo} alt={title} className="size-7 object-contain" loading="lazy" onError={e=>((e.currentTarget as HTMLImageElement).style.display='none')} /> : <Icon className="size-5" aria-hidden />}
                                        </span>
                                        <h3 className={`mt-4 text-[15px] font-extrabold leading-tight ${isHighlighted ? 'text-blue-600 dark:text-blue-400' : 'text-ink'}`}>{title}</h3>
                                        <p className="mt-2 min-h-[56px] flex-1 text-[13px] leading-[1.5] text-ink-3 line-clamp-3">{desc}</p>
                                        <div className="mt-6 border-t border-line pt-4">
                                            <p className="text-[11px] tracking-widest text-ink-4 uppercase">Start From</p>
                                            <p className="mt-1 text-[28px] font-black leading-none tracking-tight text-ink">{priceLabel}</p>
                                            <a href={waHrefPkg} target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-blue-600 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-500/10">
                                                <svg viewBox="0 0 24 24" className="size-4 fill-[#25D366]" aria-hidden><path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9 1 1-2.9-.2-.3a8.2 8.2 0 1 1 6.6 3.6Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>
                                                Konsultasi Gratis
                                            </a>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((service: any, i: number) => {
                            const Icon = getIcon(service.icon);
                            const title = loc(service.title, service.title_en ?? null);
                            const descRaw = service.desc ?? service.short_desc ?? '';
                            const descEnRaw = service.desc_en ?? null;
                            const desc = loc(descRaw, descEnRaw);
                            const cat = loc(service.category ?? 'Umum', service.category_en ?? null);
                            return (
                                <Reveal key={service.slug} delay={(i % 4) * 40}>
                                    <a
                                        href={R.contact}
                                        className="service-card-hover-light group flex h-full flex-col rounded-2xl border border-line bg-card p-6 shadow-sm"
                                    >
                                        <span className="flex size-12 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-line group-hover:ring-brand-200 dark:bg-white dark:ring-white/10">
                                            {service.logo ? (
                                                <img
                                                    src={service.logo}
                                                    alt={title}
                                                    className="size-8 object-contain"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <Icon className="size-6 text-ink-3" aria-hidden />
                                            )}
                                        </span>
                                        <h3 className="mt-4 text-sm font-bold leading-tight text-ink group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                                            {title}
                                        </h3>
                                        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-ink-3">{desc}</p>
                                        <span className="mt-3 inline-flex text-xs font-medium text-ink-4">{cat}</span>
                                    </a>
                                </Reveal>
                            );
                        })}
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}
