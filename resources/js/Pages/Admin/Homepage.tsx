import type { PageProps } from '@/types';
import { R } from '@/lib/routes';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input, Textarea, Select } from '@/Components/ui';
import { Reveal } from '@/Components/Reveal';
import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, LayoutDashboard, Megaphone, Sparkles, Settings2, FileText } from 'lucide-react';
import { useState } from 'react';

interface HomepageData {
    hero_badge_available: string;
    hero_badge_role: string;
    hero_socials: { label: string; href: string; platform?: string }[];
    hero_perks: { icon?: string; title: string; desc: string }[];
    hero_eyebrow: string;
    hero_heading_prefix: string;
    hero_heading_highlight: string;
    hero_heading_suffix: string;
    hero_description: string;
    hero_primary_cta_label: string;
    hero_primary_cta_href: string;
    hero_secondary_cta_label: string;
    hero_secondary_cta_href: string;
    hero_stats: { icon?: string; value: number; suffix?: string; label: string }[];
    hero_image_src: string;
    hero_image_alt: string;
    hero_code_lines: string[];
    hero_terminal_badge_top: string;
    hero_terminal_badge_bottom: string;
    hero_terminal_title: string;
    hero_terminal_env: string;
    hero_terminal_footer: string;
    marquee_stack: string[];
    services_eyebrow: string;
    services_heading: string;
    services_cta_label: string;
    process_eyebrow: string;
    process_heading: string;
    process_steps: { n: string; title: string; desc: string }[];
    work_eyebrow: string;
    work_heading: string;
    work_cta_label: string;
    why_eyebrow: string;
    why_heading: string;
    why_points: { title: string; desc: string }[];
    why_code_title: string;
    why_code_content: string;
    why_code_footer: string;
    testimonials_eyebrow: string;
    testimonials_heading: string;
    pricing_eyebrow: string;
    pricing_heading: string;
    faq_eyebrow: string;
    faq_heading: string;
    faq_footer_text: string;
    cta_eyebrow: string;
    cta_heading: string;
    cta_description: string;
    cta_primary_label: string;
    cta_primary_href: string;
    cta_secondary_label: string;
    cta_secondary_href: string;
    announcement_text: string;
    announcement_text_mobile: string;
    announcement_cta_label: string;
    announcement_cta_href: string;
    footer_description: string;
    footer_tech_label: string;
}

interface Props extends PageProps {
    homepage: HomepageData;
}

const tabs = [
    { id: 'hero', label: 'Hero', icon: Sparkles },
    { id: 'stats', label: 'Perks & Stats', icon: LayoutDashboard },
    { id: 'terminal', label: 'Terminal & Marquee', icon: FileText },
    { id: 'process', label: 'Process & Services', icon: Settings2 },
    { id: 'why', label: 'Why & Work', icon: Megaphone },
    { id: 'cta', label: 'CTA & Global', icon: Save },
] as const;

function SectionCard({
    icon: Icon,
    title,
    description,
    action,
    children,
}: {
    icon: typeof Sparkles;
    title: string;
    description?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        <Icon className="size-4" strokeWidth={1.7} />
                    </span>
                    <div>
                        <h3 className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">{title}</h3>
                        {description && <p className="mt-0.5 max-w-[48ch] text-xs leading-relaxed text-slate-400 dark:text-slate-500">{description}</p>}
                    </div>
                </div>
                {action}
            </div>
            <div className="mt-6 space-y-5">{children}</div>
        </Card>
    );
}

function RowCard({ children }: { children: React.ReactNode }) {
    return <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">{children}</div>;
}

export default function AdminHomepage({ homepage }: Props) {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('hero');

    const { data, setData, put, processing, recentlySuccessful, errors } = useForm<HomepageData>({
        hero_badge_available: homepage.hero_badge_available ?? '',
        hero_badge_role: homepage.hero_badge_role ?? '',
        hero_socials: homepage.hero_socials ?? [],
        hero_perks: homepage.hero_perks ?? [],
        hero_eyebrow: homepage.hero_eyebrow ?? '',
        hero_heading_prefix: homepage.hero_heading_prefix ?? '',
        hero_heading_highlight: homepage.hero_heading_highlight ?? '',
        hero_heading_suffix: homepage.hero_heading_suffix ?? '',
        hero_description: homepage.hero_description ?? '',
        hero_primary_cta_label: homepage.hero_primary_cta_label ?? '',
        hero_primary_cta_href: homepage.hero_primary_cta_href ?? '',
        hero_secondary_cta_label: homepage.hero_secondary_cta_label ?? '',
        hero_secondary_cta_href: homepage.hero_secondary_cta_href ?? '',
        hero_stats: homepage.hero_stats ?? [],
        hero_image_src: homepage.hero_image_src ?? '',
        hero_image_alt: homepage.hero_image_alt ?? '',
        hero_code_lines: homepage.hero_code_lines ?? [],
        hero_terminal_badge_top: homepage.hero_terminal_badge_top ?? '',
        hero_terminal_badge_bottom: homepage.hero_terminal_badge_bottom ?? '',
        hero_terminal_title: homepage.hero_terminal_title ?? '',
        hero_terminal_env: homepage.hero_terminal_env ?? '',
        hero_terminal_footer: homepage.hero_terminal_footer ?? '',
        marquee_stack: homepage.marquee_stack ?? [],
        services_eyebrow: homepage.services_eyebrow ?? '',
        services_heading: homepage.services_heading ?? '',
        services_cta_label: homepage.services_cta_label ?? '',
        process_eyebrow: homepage.process_eyebrow ?? '',
        process_heading: homepage.process_heading ?? '',
        process_steps: homepage.process_steps ?? [],
        work_eyebrow: homepage.work_eyebrow ?? '',
        work_heading: homepage.work_heading ?? '',
        work_cta_label: homepage.work_cta_label ?? '',
        why_eyebrow: homepage.why_eyebrow ?? '',
        why_heading: homepage.why_heading ?? '',
        why_points: homepage.why_points ?? [],
        why_code_title: homepage.why_code_title ?? '',
        why_code_content: homepage.why_code_content ?? '',
        why_code_footer: homepage.why_code_footer ?? '',
        testimonials_eyebrow: homepage.testimonials_eyebrow ?? '',
        testimonials_heading: homepage.testimonials_heading ?? '',
        pricing_eyebrow: homepage.pricing_eyebrow ?? '',
        pricing_heading: homepage.pricing_heading ?? '',
        faq_eyebrow: homepage.faq_eyebrow ?? '',
        faq_heading: homepage.faq_heading ?? '',
        faq_footer_text: homepage.faq_footer_text ?? '',
        cta_eyebrow: homepage.cta_eyebrow ?? '',
        cta_heading: homepage.cta_heading ?? '',
        cta_description: homepage.cta_description ?? '',
        cta_primary_label: homepage.cta_primary_label ?? '',
        cta_primary_href: homepage.cta_primary_href ?? '',
        cta_secondary_label: homepage.cta_secondary_label ?? '',
        cta_secondary_href: homepage.cta_secondary_href ?? '',
        announcement_text: homepage.announcement_text ?? '',
        announcement_text_mobile: homepage.announcement_text_mobile ?? '',
        announcement_cta_label: homepage.announcement_cta_label ?? '',
        announcement_cta_href: homepage.announcement_cta_href ?? '',
        footer_description: homepage.footer_description ?? '',
        footer_tech_label: homepage.footer_tech_label ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(R.adminHomepageUpdate, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Halaman Depan" description="Kelola semua teks dan section di homepage tanpa coding">
            <form onSubmit={submit} className="space-y-6">
                {/* Tabs — subtle, professional */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${active ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}
                            >
                                <tab.icon className="size-4" strokeWidth={1.7} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === 'hero' && (
                    <Reveal>
                        <div className="grid gap-6">
                            <SectionCard icon={Sparkles} title="Hero — Badge & Heading" description="Badge, eyebrow, heading, deskripsi dan CTA utama di hero">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input label="Badge tersedia" value={data.hero_badge_available} onChange={(e) => setData('hero_badge_available', e.target.value)} placeholder="Tersedia untuk proyek baru · Q3 2026" />
                                    <Input label="Badge role" value={data.hero_badge_role} onChange={(e) => setData('hero_badge_role', e.target.value)} placeholder="Full-stack · Product-minded" />
                                </div>
                                <Input label="Eyebrow" value={data.hero_eyebrow} onChange={(e) => setData('hero_eyebrow', e.target.value)} placeholder="Pengembangan Web · UI/UX · Maintenance" />
                                <div className="grid gap-5 sm:grid-cols-3">
                                    <Input label="Heading prefix" value={data.hero_heading_prefix} onChange={(e) => setData('hero_heading_prefix', e.target.value)} placeholder="Bangun Produk" />
                                    <Input label="Heading highlight" value={data.hero_heading_highlight} onChange={(e) => setData('hero_heading_highlight', e.target.value)} placeholder="Digital" />
                                    <Input label="Heading suffix" value={data.hero_heading_suffix} onChange={(e) => setData('hero_heading_suffix', e.target.value)} placeholder="Modern." />
                                </div>
                                <Textarea label="Deskripsi hero" value={data.hero_description} onChange={(e) => setData('hero_description', e.target.value)} rows={3} placeholder="Satu baris value proposition yang jelas ..." />
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input label="Primary CTA label" value={data.hero_primary_cta_label} onChange={(e) => setData('hero_primary_cta_label', e.target.value)} placeholder="Mulai Proyek" />
                                    <Input label="Primary CTA href" value={data.hero_primary_cta_href} onChange={(e) => setData('hero_primary_cta_href', e.target.value)} placeholder="/contact" />
                                    <Input label="Secondary CTA label" value={data.hero_secondary_cta_label} onChange={(e) => setData('hero_secondary_cta_label', e.target.value)} placeholder="Lihat Karya" />
                                    <Input label="Secondary CTA href" value={data.hero_secondary_cta_href} onChange={(e) => setData('hero_secondary_cta_href', e.target.value)} placeholder="/portfolio" />
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input label="Image src" value={data.hero_image_src} onChange={(e) => setData('hero_image_src', e.target.value)} placeholder="/images/hero-woman.webp" />
                                    <Input label="Image alt" value={data.hero_image_alt} onChange={(e) => setData('hero_image_alt', e.target.value)} placeholder="Deskripsi alt untuk aksesibilitas" />
                                </div>
                            </SectionCard>

                            <SectionCard
                                icon={Megaphone}
                                title="Social pills"
                                description="Link yang tampil di bawah heading hero"
                                action={
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setData('hero_socials', [...data.hero_socials, { label: '', href: '', platform: 'whatsapp' }])}>
                                        <Plus className="size-4" /> Tambah
                                    </Button>
                                }
                            >
                                {data.hero_socials.length === 0 ? (
                                    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">Belum ada social pill. Klik Tambah untuk menambahkan.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {data.hero_socials.map((s, idx) => (
                                            <RowCard key={idx}>
                                                <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr_140px_auto] sm:items-end">
                                                    <Input placeholder="@raycode" value={s.label} onChange={(e) => { const v = [...data.hero_socials]; v[idx].label = e.target.value; setData('hero_socials', v); }} label={idx === 0 ? 'Label' : undefined} />
                                                    <Input placeholder="https://wa.me/..." value={s.href} onChange={(e) => { const v = [...data.hero_socials]; v[idx].href = e.target.value; setData('hero_socials', v); }} label={idx === 0 ? 'Href' : undefined} />
                                                    <Select value={s.platform} onChange={(e) => { const v = [...data.hero_socials]; v[idx].platform = e.target.value; setData('hero_socials', v); }} label={idx === 0 ? 'Icon' : undefined}>
                                                        <option value="whatsapp">WhatsApp</option>
                                                        <option value="linkedin">LinkedIn</option>
                                                        <option value="github">GitHub</option>
                                                        <option value="email">Email</option>
                                                    </Select>
                                                    <button type="button" onClick={() => setData('hero_socials', data.hero_socials.filter((_, i) => i !== idx))} className="flex size-10 items-center justify-center self-end rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400" aria-label="Hapus">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </RowCard>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        </div>
                    </Reveal>
                )}

                {activeTab === 'stats' && (
                    <Reveal>
                        <div className="grid gap-6">
                            <SectionCard
                                icon={Sparkles}
                                title="Perks — 3 kartu di hero"
                                description="Keunggulan singkat yang tampil sebagai 3 kartu di area hero"
                                action={
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setData('hero_perks', [...data.hero_perks, { icon: 'zap', title: '', desc: '' }])}>
                                        <Plus className="size-4" /> Tambah
                                    </Button>
                                }
                            >
                                {data.hero_perks.length === 0 ? (
                                    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">Belum ada perk. Tambahkan minimal 3 untuk layout ideal.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {data.hero_perks.map((p, idx) => (
                                            <RowCard key={idx}>
                                                <div className="grid gap-3 sm:grid-cols-[140px_1fr_1.2fr_auto] sm:items-end">
                                                    <Select label={idx === 0 ? 'Icon' : undefined} value={p.icon} onChange={(e) => { const v = [...data.hero_perks]; v[idx].icon = e.target.value; setData('hero_perks', v); }}>
                                                        <option value="monitor-smartphone">Monitor</option>
                                                        <option value="braces">Braces</option>
                                                        <option value="zap">Zap</option>
                                                        <option value="rocket">Rocket</option>
                                                        <option value="shield-check">Shield</option>
                                                    </Select>
                                                    <Input label={idx === 0 ? 'Title' : undefined} value={p.title} onChange={(e) => { const v = [...data.hero_perks]; v[idx].title = e.target.value; setData('hero_perks', v); }} placeholder="Modern & Responsif" />
                                                    <Input label={idx === 0 ? 'Desc' : undefined} value={p.desc} onChange={(e) => { const v = [...data.hero_perks]; v[idx].desc = e.target.value; setData('hero_perks', v); }} placeholder="UI yang clean dan cepat di semua device" />
                                                    <button type="button" onClick={() => setData('hero_perks', data.hero_perks.filter((_, i) => i !== idx))} className="flex size-10 items-center justify-center self-end rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </RowCard>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            <SectionCard
                                icon={LayoutDashboard}
                                title="Stats — angka di hero"
                                description="Statistik angka yang tampil di bawah hero"
                                action={
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setData('hero_stats', [...data.hero_stats, { icon: 'rocket', value: 0, suffix: '+', label: '' }])}>
                                        <Plus className="size-4" /> Tambah
                                    </Button>
                                }
                            >
                                {data.hero_stats.length === 0 ? (
                                    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">Belum ada stat.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {data.hero_stats.map((s, idx) => (
                                            <RowCard key={idx}>
                                                <div className="grid gap-3 sm:grid-cols-[130px_100px_80px_1fr_auto] sm:items-end">
                                                    <Select label={idx === 0 ? 'Icon' : undefined} value={s.icon} onChange={(e) => { const v = [...data.hero_stats]; v[idx].icon = e.target.value; setData('hero_stats', v); }}>
                                                        <option value="rocket">Rocket</option>
                                                        <option value="braces">Braces</option>
                                                        <option value="shield-check">Shield</option>
                                                        <option value="zap">Zap</option>
                                                    </Select>
                                                    <Input label={idx === 0 ? 'Value' : undefined} type="number" value={String(s.value)} onChange={(e) => { const v = [...data.hero_stats]; v[idx].value = parseInt(e.target.value) || 0; setData('hero_stats', v); }} />
                                                    <Input label={idx === 0 ? 'Suffix' : undefined} value={s.suffix ?? ''} onChange={(e) => { const v = [...data.hero_stats]; v[idx].suffix = e.target.value; setData('hero_stats', v); }} placeholder="+" />
                                                    <Input label={idx === 0 ? 'Label' : undefined} value={s.label} onChange={(e) => { const v = [...data.hero_stats]; v[idx].label = e.target.value; setData('hero_stats', v); }} placeholder="Proyek Selesai" />
                                                    <button type="button" onClick={() => setData('hero_stats', data.hero_stats.filter((_, i) => i !== idx))} className="flex size-10 items-center justify-center self-end rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </RowCard>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        </div>
                    </Reveal>
                )}

                {activeTab === 'terminal' && (
                    <Reveal>
                        <div className="grid gap-6">
                            <SectionCard icon={FileText} title="Terminal kaca — hero kanan" description="Panel terminal dekoratif di sisi kanan hero">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input label="Title" value={data.hero_terminal_title} onChange={(e) => setData('hero_terminal_title', e.target.value)} placeholder="raycode — zsh" />
                                    <Input label="Env badge" value={data.hero_terminal_env} onChange={(e) => setData('hero_terminal_env', e.target.value)} placeholder="produksi" />
                                    <Input label="Badge atas" value={data.hero_terminal_badge_top} onChange={(e) => setData('hero_terminal_badge_top', e.target.value)} placeholder="Deploy ready" />
                                    <Input label="Badge bawah" value={data.hero_terminal_badge_bottom} onChange={(e) => setData('hero_terminal_badge_bottom', e.target.value)} placeholder="v2.4.0" />
                                </div>
                                <Input label="Footer" value={data.hero_terminal_footer} onChange={(e) => setData('hero_terminal_footer', e.target.value)} placeholder="uptime 99.9% · edge-cached" />
                                <div>
                                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Code lines</span>
                                    <p className="mb-3 text-xs text-slate-400">Satu baris per input, urutan menentukan animasi ketik.</p>
                                    <div className="space-y-3">
                                        {data.hero_code_lines.map((line, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <Input value={line} onChange={(e) => { const v = [...data.hero_code_lines]; v[idx] = e.target.value; setData('hero_code_lines', v); }} placeholder="$ raycode build --prod" className="flex-1 font-mono text-sm" />
                                                <button type="button" onClick={() => setData('hero_code_lines', data.hero_code_lines.filter((_, i) => i !== idx))} className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-900">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="secondary" size="sm" onClick={() => setData('hero_code_lines', [...data.hero_code_lines, ''])}><Plus className="size-4" /> Tambah baris</Button>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard icon={LayoutDashboard} title="Marquee — tumpukan teknologi" description="Teks berjalan di bawah hero. Tambah atau hapus teknologi.">
                                <div className="flex flex-wrap gap-2">
                                    {data.marquee_stack.map((tech, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800">
                                            <Input value={tech} onChange={(e) => { const v = [...data.marquee_stack]; v[idx] = e.target.value; setData('marquee_stack', v); }} className="h-7 w-32 border-0 bg-transparent p-0 text-sm shadow-none focus:ring-0 dark:bg-transparent" />
                                            <button type="button" onClick={() => setData('marquee_stack', data.marquee_stack.filter((_, i) => i !== idx))} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-700"><Trash2 className="size-3.5" /></button>
                                        </span>
                                    ))}
                                    {data.marquee_stack.length === 0 && <span className="text-sm text-slate-400">Belum ada item marquee.</span>}
                                </div>
                                <div>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setData('marquee_stack', [...data.marquee_stack, 'New Tech'])}><Plus className="size-4" /> Tambah stack</Button>
                                </div>
                            </SectionCard>
                        </div>
                    </Reveal>
                )}

                {activeTab === 'process' && (
                    <Reveal>
                        <div className="grid gap-6">
                            <SectionCard icon={Sparkles} title="Services — header" description="Judul section layanan">
                                <Input label="Eyebrow" value={data.services_eyebrow} onChange={(e) => setData('services_eyebrow', e.target.value)} placeholder="// Layanan" />
                                <Input label="Heading" value={data.services_heading} onChange={(e) => setData('services_heading', e.target.value)} placeholder="Solusi yang kami tawarkan" />
                                <Input label="CTA label" value={data.services_cta_label} onChange={(e) => setData('services_cta_label', e.target.value)} placeholder="Lihat semua layanan" />
                            </SectionCard>

                            <SectionCard
                                icon={Settings2}
                                title="Process — langkah"
                                description="Alur kerja 3–4 langkah yang tampil di homepage"
                                action={
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setData('process_steps', [...data.process_steps, { n: String(data.process_steps.length + 1).padStart(2, '0'), title: '', desc: '' }])}><Plus className="size-4" /> Tambah</Button>
                                }
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input label="Eyebrow" value={data.process_eyebrow} onChange={(e) => setData('process_eyebrow', e.target.value)} placeholder="// Proses" />
                                    <Input label="Heading" value={data.process_heading} onChange={(e) => setData('process_heading', e.target.value)} placeholder="Bagaimana kami bekerja" />
                                </div>
                                {data.process_steps.length === 0 ? (
                                    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">Belum ada langkah. Klik Tambah untuk menambahkan.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {data.process_steps.map((step, idx) => (
                                            <RowCard key={idx}>
                                                <div className="grid gap-3 sm:grid-cols-[80px_190px_1fr_auto] sm:items-end">
                                                    <Input label={idx === 0 ? 'No' : undefined} value={step.n} onChange={(e) => { const v = [...data.process_steps]; v[idx].n = e.target.value; setData('process_steps', v); }} placeholder="01" />
                                                    <Input label={idx === 0 ? 'Title' : undefined} value={step.title} onChange={(e) => { const v = [...data.process_steps]; v[idx].title = e.target.value; setData('process_steps', v); }} placeholder="Discovery" />
                                                    <Input label={idx === 0 ? 'Desc' : undefined} value={step.desc} onChange={(e) => { const v = [...data.process_steps]; v[idx].desc = e.target.value; setData('process_steps', v); }} placeholder="Memahami tujuan bisnis & kebutuhan pengguna" />
                                                    <button type="button" onClick={() => setData('process_steps', data.process_steps.filter((_, i) => i !== idx))} className="flex size-10 items-center justify-center self-end rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-900">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </RowCard>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            <SectionCard icon={LayoutDashboard} title="Work — header" description="Judul section karya / portofolio terbaru">
                                <Input label="Eyebrow" value={data.work_eyebrow} onChange={(e) => setData('work_eyebrow', e.target.value)} placeholder="// Karya" />
                                <Input label="Heading" value={data.work_heading} onChange={(e) => setData('work_heading', e.target.value)} placeholder="Proyek pilihan" />
                                <Input label="CTA label" value={data.work_cta_label} onChange={(e) => setData('work_cta_label', e.target.value)} placeholder="Lihat semua karya" />
                            </SectionCard>
                        </div>
                    </Reveal>
                )}

                {activeTab === 'why' && (
                    <Reveal>
                        <div className="grid gap-6">
                            <SectionCard icon={Megaphone} title="Why — keunggulan" description="Alasan memilih Raycode, tampil sebagai bullet points">
                                <Input label="Eyebrow" value={data.why_eyebrow} onChange={(e) => setData('why_eyebrow', e.target.value)} placeholder="// Mengapa Raycode" />
                                <Textarea label="Heading" value={data.why_heading} onChange={(e) => setData('why_heading', e.target.value)} rows={2} placeholder="Kenapa tim mempercayakan produknya pada kami" />
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Poin keunggulan</span>
                                        <Button type="button" variant="secondary" size="sm" onClick={() => setData('why_points', [...data.why_points, { title: '', desc: '' }])}><Plus className="size-4" /> Tambah poin</Button>
                                    </div>
                                    <div className="mt-3 space-y-3">
                                        {data.why_points.length === 0 ? (
                                            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">Belum ada poin.</p>
                                        ) : (
                                            data.why_points.map((p, idx) => (
                                                <RowCard key={idx}>
                                                    <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
                                                        <Input value={p.title} onChange={(e) => { const v = [...data.why_points]; v[idx].title = e.target.value; setData('why_points', v); }} placeholder="Judul poin" label={idx === 0 ? 'Title' : undefined} />
                                                        <Input value={p.desc} onChange={(e) => { const v = [...data.why_points]; v[idx].desc = e.target.value; setData('why_points', v); }} placeholder="Deskripsi singkat" label={idx === 0 ? 'Desc' : undefined} />
                                                        <button type="button" onClick={() => setData('why_points', data.why_points.filter((_, i) => i !== idx))} className="flex size-10 items-center justify-center self-end rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:bg-slate-900"><Trash2 className="size-4" /></button>
                                                    </div>
                                                </RowCard>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <Input label="Code block title" value={data.why_code_title} onChange={(e) => setData('why_code_title', e.target.value)} placeholder="raycode.config.ts" />
                                <Textarea label="Code block content" value={data.why_code_content} onChange={(e) => setData('why_code_content', e.target.value)} rows={7} className="font-mono text-xs leading-relaxed" placeholder={`export default {\n  framework: 'Laravel + React',\n  quality: 'typed & tested',\n}`} />
                                <Input label="Code footer" value={data.why_code_footer} onChange={(e) => setData('why_code_footer', e.target.value)} placeholder="deploy · preview · ship" />
                            </SectionCard>

                            <SectionCard icon={FileText} title="Headers lain — Testimonial, Pricing, FAQ" description="Eyebrow & heading untuk section-section bawah">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input label="Testimonials eyebrow" value={data.testimonials_eyebrow} onChange={(e) => setData('testimonials_eyebrow', e.target.value)} />
                                    <Input label="Testimonials heading" value={data.testimonials_heading} onChange={(e) => setData('testimonials_heading', e.target.value)} />
                                    <Input label="Pricing eyebrow" value={data.pricing_eyebrow} onChange={(e) => setData('pricing_eyebrow', e.target.value)} />
                                    <Input label="Pricing heading" value={data.pricing_heading} onChange={(e) => setData('pricing_heading', e.target.value)} />
                                    <Input label="FAQ eyebrow" value={data.faq_eyebrow} onChange={(e) => setData('faq_eyebrow', e.target.value)} />
                                    <Input label="FAQ heading" value={data.faq_heading} onChange={(e) => setData('faq_heading', e.target.value)} />
                                </div>
                                <Textarea label="FAQ footer text" value={data.faq_footer_text} onChange={(e) => setData('faq_footer_text', e.target.value)} rows={2} placeholder="Masih ada pertanyaan? Hubungi kami ... " />
                            </SectionCard>
                        </div>
                    </Reveal>
                )}

                {activeTab === 'cta' && (
                    <Reveal>
                        <div className="grid gap-6">
                            <SectionCard icon={Megaphone} title="CTA band — bawah" description="Section ajakan akhir sebelum footer">
                                <Input label="Eyebrow" value={data.cta_eyebrow} onChange={(e) => setData('cta_eyebrow', e.target.value)} placeholder="// Siap memulai?" />
                                <Input label="Heading" value={data.cta_heading} onChange={(e) => setData('cta_heading', e.target.value)} placeholder="Wujudkan produk digital Anda" />
                                <Textarea label="Description" value={data.cta_description} onChange={(e) => setData('cta_description', e.target.value)} rows={2} placeholder="Ceritakan kebutuhan Anda, kami bantu dari ide hingga launch." />
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input label="Primary label" value={data.cta_primary_label} onChange={(e) => setData('cta_primary_label', e.target.value)} placeholder="Konsultasi Gratis" />
                                    <Input label="Primary href" value={data.cta_primary_href} onChange={(e) => setData('cta_primary_href', e.target.value)} placeholder="/contact" />
                                    <Input label="Secondary label" value={data.cta_secondary_label} onChange={(e) => setData('cta_secondary_label', e.target.value)} placeholder="Lihat Harga" />
                                    <Input label="Secondary href" value={data.cta_secondary_href} onChange={(e) => setData('cta_secondary_href', e.target.value)} placeholder="/pricing" />
                                </div>
                            </SectionCard>

                            <SectionCard icon={Settings2} title="Global — Announcement & Footer" description="Bagian ini tampil di semua halaman via layout">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Input label="Announcement text (desktop)" value={data.announcement_text} onChange={(e) => setData('announcement_text', e.target.value)} placeholder="Slot terbatas untuk Q3 — booking sekarang" />
                                    <Input label="Announcement text (mobile)" value={data.announcement_text_mobile} onChange={(e) => setData('announcement_text_mobile', e.target.value)} placeholder="Q3 booking open" />
                                    <Input label="Announcement CTA label" value={data.announcement_cta_label} onChange={(e) => setData('announcement_cta_label', e.target.value)} placeholder="Ambil slot" />
                                    <Input label="Announcement CTA href" value={data.announcement_cta_href} onChange={(e) => setData('announcement_cta_href', e.target.value)} placeholder="/contact" />
                                </div>
                                <Textarea label="Footer description" value={data.footer_description} onChange={(e) => setData('footer_description', e.target.value)} rows={2} placeholder="Studio pengembangan web yang fokus pada kecepatan, kualitas kode, dan hasil bisnis." />
                                <Input label="Footer tech label" value={data.footer_tech_label} onChange={(e) => setData('footer_tech_label', e.target.value)} placeholder="Laravel · React · Tailwind" />
                            </SectionCard>
                        </div>
                    </Reveal>
                )}

                {/* Validation errors */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Periksa isian:</p>
                        <ul className="mt-2 list-disc pl-5 text-xs text-red-600 dark:text-red-400">
                            {Object.entries(errors).map(([k, v]) => (
                                <li key={k}>
                                    {k}: {String(v)}
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Sticky save bar */}
                <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="hidden size-2 rounded-full bg-emerald-500 sm:inline-block" aria-hidden />
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Siap menyimpan perubahan?</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Perubahan akan langsung tampil di halaman depan.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 self-stretch sm:self-auto">
                        {recentlySuccessful && (
                            <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="hidden text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:inline">
                                Tersimpan ✓
                            </motion.span>
                        )}
                        <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                            <Save className="size-4" />
                            {processing ? 'Menyimpan…' : 'Simpan Halaman Depan'}
                        </Button>
                    </div>
                </div>
                {recentlySuccessful && <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:hidden">Tersimpan ✓</p>}
            </form>
        </AdminLayout>
    );
}
