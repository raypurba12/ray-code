import { R } from '@/lib/routes';
import { PublicLayout } from '@/Components/layout/PublicLayout';
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
    jokiServices: JokiService[];
    jokiHeader: { badge: string; title: string; desc: string };
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

export default function ServicesIndex({ jokiServices, jokiHeader }: Props) {
    const { t, locale } = useI18n();
    const { settings } = usePage<{ settings: Record<string, string> }>().props as unknown as { settings: Record<string, string> };
    const waNumber = (settings?.whatsapp ?? '+6281234567890').replace(/[^0-9]/g, '');
    const waHref = `https://wa.me/${waNumber}?text=Halo%20Raycode!%20Saya%20tertarik%20dengan%20jasa%20coding`;
    const [active, setActive] = useState<string>(() => t('common.all'));

    // helper to get localized field
    const loc = (id: string, en: string | null) => (locale === 'en' && en ? en : id);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(jokiServices.map((s) => loc(s.category, s.category_en)))).sort();
        return [t('common.all'), ...cats];
    }, [jokiServices, locale]);

    const filtered = useMemo(() => {
        if (active === t('common.all')) return jokiServices;
        return jokiServices.filter((s) => loc(s.category, s.category_en) === active);
    }, [active, jokiServices, locale]);

    useEffect(() => {
        setActive(t('common.all'));
    }, [locale]);

    return (
        <PublicLayout>
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

                    <div className="mt-10 flex flex-wrap justify-center gap-2">
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
                        {t('services.showCount')} {filtered.length} {t('services.of')} {jokiServices.length} {t('services.services')}
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
                {filtered.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('services.empty')}</p>
                        <p className="mt-1 text-xs text-slate-400">{t('services.emptyHint')}</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((service, i) => {
                            const Icon = getIcon(service.icon);
                            const title = loc(service.title, service.title_en);
                            const desc = loc(service.desc, service.desc_en);
                            const cat = loc(service.category, service.category_en);
                            return (
                                <Reveal key={service.slug} delay={(i % 4) * 40}>
                                    <a
                                        href={R.contact}
                                        className="group flex h-full flex-col rounded-2xl border border-line bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_16px_40px_-16px_rgb(37_99_235/0.18)] dark:border-white/[0.06] dark:hover:border-brand-500/30 dark:hover:bg-white/[0.03]"
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
