import type { Service } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatIDR } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { SeoHead } from '@/Components/SeoHead';
import { Reveal } from '@/Components/Reveal';
import { Badge, ButtonLink, Eyebrow } from '@/Components/ui';
import { router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Calculator, Check, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Complexity { id: string; label: string; multiplier: number; desc: string }
interface FeatureOption { id: string; label: string; price: number }
interface Urgency { id: string; label: string; multiplier: number }

interface Props {
    services: Pick<Service, 'id' | 'slug' | 'title' | 'starting_price'>[];
    complexities?: Complexity[];
    featureOptions?: FeatureOption[];
    urgencies?: Urgency[];
}

const defaultComplexities: Complexity[] = [
    { id: 'simple', label: 'Sederhana', multiplier: 1, desc: 'Halaman statis, pola standar' },
    { id: 'moderate', label: 'Menengah', multiplier: 1.8, desc: 'Logika kustom, integrasi' },
    { id: 'complex', label: 'Kompleks', multiplier: 3.2, desc: 'Sistem multi-peran, fitur real-time' },
];

const defaultFeatureOptions: FeatureOption[] = [
    { id: 'auth', label: 'Akun & peran pengguna', price: 2_500_000 },
    { id: 'payment', label: 'Gerbang pembayaran', price: 3_500_000 },
    { id: 'admin', label: 'Dasbor admin', price: 4_000_000 },
    { id: 'api', label: 'API publik / siap mobile', price: 5_500_000 },
    { id: 'seo', label: 'Setup SEO & analitik', price: 1_500_000 },
    { id: 'multilang', label: 'Konten multibahasa', price: 3_000_000 },
];

const defaultUrgencies: Urgency[] = [
    { id: 'relaxed', label: 'Santai (6+ minggu)', multiplier: 1 },
    { id: 'standard', label: 'Standar (3–5 minggu)', multiplier: 1.15 },
    { id: 'rush', label: 'Cepat (< 3 minggu)', multiplier: 1.45 },
];

export default function Estimator({ services, complexities: propComplexities, featureOptions: propFeatures, urgencies: propUrgencies }: Props) {
    const complexities = propComplexities?.length ? propComplexities : defaultComplexities;
    const featureOptions = propFeatures?.length ? propFeatures : defaultFeatureOptions;
    const urgencies = propUrgencies?.length ? propUrgencies : defaultUrgencies;

    const user = usePage<{ auth: { user: { role: string } | null } }>().props.auth.user;
    const orderHref = user ? R.clientOrder : R.login;

    const [serviceId, setServiceId] = useState<number>(services[0]?.id ?? 0);
    const [complexity, setComplexity] = useState<string>(complexities[0]?.id ?? 'simple');
    const [features, setFeatures] = useState<string[]>([]);
    const [urgency, setUrgency] = useState<string>(urgencies.find((u) => u.id === 'standard')?.id ?? urgencies[0]?.id ?? 'standard');
    const [wa, setWa] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState(''); // honeypot
    const [saving, setSaving] = useState(false);

    const estimate = useMemo(() => {
        const base = services.find((s) => s.id === serviceId)?.starting_price ?? 0;
        const complexityMultiplier = complexities.find((c) => c.id === complexity)?.multiplier ?? 1;
        const urgencyMultiplier = urgencies.find((u) => u.id === urgency)?.multiplier ?? 1;
        const featureTotal = features.reduce((sum, f) => sum + (featureOptions.find((o) => o.id === f)?.price ?? 0), 0);

        const mid = Math.round(((base * complexityMultiplier + featureTotal) * urgencyMultiplier) / 100_000) * 100_000;
        return { low: Math.round(mid * 0.9), high: Math.round(mid * 1.25) };
    }, [serviceId, complexity, features, urgency, services, complexities, featureOptions, urgencies]);

    const toggleFeature = (id: string) =>
        setFeatures((current) => (current.includes(id) ? current.filter((f) => f !== id) : [...current, id]));

    const handleContinue = () => {
        setSaving(true);
        trackEvent('estimator_submit', {
            service_id: serviceId,
            complexity,
            urgency,
            features_count: features.length,
            low: estimate.low,
            high: estimate.high,
        });
        const payload = {
            service_id: serviceId,
            complexity,
            features,
            urgency,
            low: estimate.low,
            high: estimate.high,
            wa: wa || undefined,
            email: email || undefined,
            website, // honeypot
        };
        router.post('/estimator/lead', payload, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <PublicLayout>
            <SeoHead
                title="Kalkulator Estimasi Biaya Proyek"
                description="Hitung estimasi biaya & waktu pengerjaan pembuatan website atau aplikasi web secara interaktif dalam 30 detik."
            />
            <section className="relative overflow-hidden pt-17">
                <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-24 lg:px-8 lg:pt-24 lg:pb-32">
                    <Reveal>
                        <div className="mx-auto max-w-2xl text-center">
                            <Eyebrow>Estimasi Biaya</Eyebrow>
                            <h1 className="text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">
                                Perkirakan anggaran Anda dalam 30 detik.
                            </h1>
                            <p className="mt-5 text-lg leading-relaxed text-ink-2">
                                Atur proyek Anda di bawah — estimasi diperbarui secara langsung. Angka bersifat indikatif; penawaran final diberikan setelah diskusi awal.
                            </p>
                        </div>
                    </Reveal>

                    <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1.25fr_1fr]">
                        {/* Configurator */}
                        <Reveal delay={120}>
                            <div className="space-y-8 rounded-2xl border border-line bg-card p-7 shadow-sm sm:p-9 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
                                <Group icon={<Calculator className="size-4" />} title="1. Apa yang ingin Anda bangun?">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {services.map((service) => (
                                            <button
                                                key={service.id}
                                                onClick={() => setServiceId(service.id)}
                                                className={cn(
                                                    'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                                                    serviceId === service.id
                                                        ? 'border-brand-400 bg-brand-50 text-brand-800 ring-1 ring-brand-300 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/25'
                                                        : 'border-line text-ink-2 hover:border-brand-200 hover:bg-slate-50 dark:hover:border-brand-500/40 dark:hover:bg-white/5',
                                                )}
                                            >
                                                {service.title}
                                            </button>
                                        ))}
                                    </div>
                                </Group>

                                <Group title="2. Seberapa kompleks proyeknya?">
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        {complexities.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setComplexity(c.id)}
                                                className={cn(
                                                    'rounded-xl border px-4 py-3 text-left transition-all duration-200',
                                                    complexity === c.id
                                                        ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300 dark:bg-brand-500/10 dark:ring-brand-500/25'
                                                        : 'border-line hover:border-brand-200 hover:bg-slate-50 dark:hover:border-brand-500/40 dark:hover:bg-white/5',
                                                )}
                                            >
                                                <p className={cn('text-sm font-semibold', complexity === c.id ? 'text-brand-800 dark:text-brand-300' : 'text-ink-2')}>{c.label}</p>
                                                <p className="mt-0.5 text-[11px] leading-snug text-ink-3">{c.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </Group>

                                <Group title="3. Fitur tambahan apa yang Anda butuhkan?">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {featureOptions.map((option) => {
                                            const selected = features.includes(option.id);
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => toggleFeature(option.id)}
                                                    className={cn(
                                                        'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200',
                                                        selected ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300 dark:bg-brand-500/10 dark:ring-brand-500/25' : 'border-line hover:border-brand-200 hover:bg-slate-50 dark:hover:border-brand-500/40 dark:hover:bg-white/5',
                                                    )}
                                                >
                                                    <span className="flex items-center gap-2.5">
                                                        <span
                                                            className={cn(
                                                                'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                                                                selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white dark:border-white/15 dark:bg-white/5',
                                                            )}
                                                        >
                                                            {selected && <Check className="size-3" strokeWidth={3} />}
                                                        </span>
                                                        <span className={cn('text-[13px] font-medium', selected ? 'text-brand-900 dark:text-brand-300' : 'text-ink-2')}>{option.label}</span>
                                                    </span>
                                                    <span className="font-mono text-[11px] whitespace-nowrap text-ink-4">+{formatIDR(option.price).replace('Rp', '')}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Group>

                                <Group icon={<Zap className="size-4" />} title="4. Seberapa cepat Anda membutuhkannya?">
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        {urgencies.map((u) => (
                                            <button
                                                key={u.id}
                                                onClick={() => setUrgency(u.id)}
                                                className={cn(
                                                    'rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200',
                                                    urgency === u.id
                                                        ? 'border-brand-400 bg-brand-50 text-brand-800 ring-1 ring-brand-300 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/25'
                                                        : 'border-line text-ink-2 hover:border-brand-200 hover:bg-slate-50 dark:hover:border-brand-500/40 dark:hover:bg-white/5',
                                                )}
                                            >
                                                {u.label}
                                            </button>
                                        ))}
                                    </div>
                                </Group>
                            </div>
                        </Reveal>

                        {/* Live result */}
                        <Reveal delay={220} direction="left" className="lg:sticky lg:top-28">
                            <div className="overflow-hidden rounded-2xl border border-line shadow-lg shadow-slate-900/5 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
                                <div className="bg-slate-950 px-7 py-5">
                                    <p className="font-mono text-xs tracking-widest text-brand-400 uppercase">// estimasi_langsung.json</p>
                                </div>
                                <div className="bg-card p-7">
                                    <motion.p key={estimate.low} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-xs font-medium text-ink-3">
                                        Perkiraan rentang investasi
                                    </motion.p>
                                    <motion.div
                                        key={`${estimate.low}-${estimate.high}`}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35 }}
                                        className="mt-2"
                                    >
                                        <span className="font-mono text-3xl font-bold tracking-tight text-ink">{formatIDR(estimate.low)}</span>
                                        <span className="mx-2 font-mono text-xl text-slate-300 dark:text-slate-600">—</span>
                                        <span className="font-mono text-3xl font-bold tracking-tight text-brand-700">{formatIDR(estimate.high)}</span>
                                    </motion.div>

                                    <ul className="mt-6 space-y-2.5 border-t border-dashed border-line pt-5 text-[13px]">
                                        <EstimateRow label="Layanan dasar" value={services.find((s) => s.id === serviceId)?.title ?? '—'} mono />
                                        <EstimateRow label="Kompleksitas" value={`×${complexities.find((c) => c.id === complexity)?.multiplier}`} />
                                        <EstimateRow label="Fitur tambahan terpilih" value={`${features.length} fitur`} />
                                        <EstimateRow label="Tenggat waktu" value={urgencies.find((u) => u.id === urgency)?.label.split(' (')[0] ?? ''} />
                                    </ul>

                                    {/* optional contact for follow-up */}
                                    <div className="mt-6 space-y-2 border-t border-dashed border-line pt-4">
                                        <p className="text-xs font-semibold text-ink">Mau kami follow-up? (opsional)</p>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <input value={wa} onChange={e=>setWa(e.target.value)} placeholder="WA (08xxx)" className="rounded-lg border border-line bg-card px-3 py-2 text-sm placeholder:text-ink-4 focus:border-brand-400 focus:outline-none" />
                                            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="rounded-lg border border-line bg-card px-3 py-2 text-sm placeholder:text-ink-4 focus:border-brand-400 focus:outline-none" />
                                        </div>
                                        <input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
                                    </div>

                                    <button onClick={handleContinue} disabled={saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-brand-700 disabled:opacity-60">
                                        {saving ? 'Menyimpan...' : 'Lanjutkan dengan spesifikasi ini →'}
                                    </button>
                                    <a href={`${orderHref}?service=${services.find((s) => s.id === serviceId)?.slug}&budget=${estimate.low}`} className="mt-2 block text-center text-xs font-medium text-ink-3 hover:text-brand-600">Lewati, langsung ke order →</a>
                                    <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-4">
                                        Estimasi sudah termasuk eksplorasi, desain, pengembangan & peluncuran. Penawaran final dikonfirmasi setelah diskusi penjajakan gratis.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-center">
                                <Badge tone="green">✓ Tidak perlu email untuk melihat estimasi</Badge>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

function Group({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <fieldset>
            <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                {icon}
                {title}
            </legend>
            {children}
        </fieldset>
    );
}

function EstimateRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <li className="flex items-center justify-between gap-4">
            <span className="text-ink-3">{label}</span>
            <span className={cn('font-semibold text-ink', mono && 'font-mono')}>{value}</span>
        </li>
    );
}
