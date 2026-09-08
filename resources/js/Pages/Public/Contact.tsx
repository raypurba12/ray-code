import { R } from '@/lib/routes';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Reveal } from '@/Components/Reveal';
import { Button, Eyebrow, Input, Select, Textarea } from '@/Components/ui';
import { useForm, usePage } from '@inertiajs/react';
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
    const { settings } = usePage<{ settings: Record<string, string> }>().props as unknown as { settings: Record<string, string> };
    const waRaw = settings?.whatsapp ?? '+6281234567890';
    const waNumber = waRaw.replace(/[^0-9]/g, '');
    const contactEmail = settings?.contact_email ?? 'hello@raycode.dev';
    const contactPhone = settings?.contact_phone ?? '+62 812 3456 7890';
    const address = settings?.address ?? 'Jakarta, Indonesia — remote-first ke seluruh dunia';
    const [method, setMethod] = useState<'wa' | 'email'>('wa');

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: 'Pengembangan Website',
        message: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (method === 'wa') {
            const text = `Halo Raycode!%0A%0ANama: ${encodeURIComponent(data.name)}%0ANo. WA: ${encodeURIComponent(data.phone)}%0AKeperluan: ${encodeURIComponent(data.subject)}%0APesan: ${encodeURIComponent(data.message)}`;
            window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank', 'noreferrer,noopener');
            return;
        }
        post(R.contact, { preserveScroll: true });
    };

    return (
        <PublicLayout>
            <section className="relative overflow-hidden pt-17">
                <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-24 lg:px-8 lg:pt-24 lg:pb-32">
                    <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
                        {/* Info side */}
                        <Reveal>
                            <Eyebrow>Kontak</Eyebrow>
                            <h1 className="text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">
                                Mari bicarakan proyek Anda.
                            </h1>
                            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">
                                Ceritakan apa yang sedang Anda bangun. Dalam satu hari kerja Anda akan mendapat umpan balik jujur dan langkah selanjutnya yang jelas — tanpa skrip penjualan.
                            </p>

                            {/* Pilihan WA / Email - prominent */}
                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setMethod('wa')}
                                    className={
                                        method === 'wa'
                                            ? 'flex items-center gap-3 rounded-2xl border-2 border-[#25D366] bg-[#25D366]/10 p-4 text-left shadow-sm dark:bg-[#25D366]/15'
                                            : 'flex items-center gap-3 rounded-2xl border border-line bg-card p-4 text-left transition-colors hover:border-[#25D366]/40 hover:bg-[#25D366]/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
                                    }
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm">
                                        <WhatsAppIcon className="size-6" />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-bold text-ink dark:text-white">Chat via WhatsApp</span>
                                        <span className="text-xs text-ink-3">{contactPhone}</span>
                                    </span>
                                    {method === 'wa' && <span className="ml-auto size-2 rounded-full bg-[#25D366] animate-pulse" aria-hidden />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMethod('email')}
                                    className={
                                        method === 'email'
                                            ? 'flex items-center gap-3 rounded-2xl border-2 border-brand-500 bg-brand-50 p-4 text-left shadow-sm dark:border-brand-500/50 dark:bg-brand-500/10'
                                            : 'flex items-center gap-3 rounded-2xl border border-line bg-card p-4 text-left transition-colors hover:border-brand-200 hover:bg-brand-50/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
                                    }
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                                        <Mail className="size-5" />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-bold text-ink dark:text-white">Kirim Email</span>
                                        <span className="text-xs text-ink-3">{contactEmail}</span>
                                    </span>
                                    {method === 'email' && <span className="ml-auto size-2 rounded-full bg-brand-500 animate-pulse" aria-hidden />}
                                </button>
                            </div>
                            <p className="mt-3 text-xs text-ink-4">Pilih metode yang paling nyaman — kami balas &lt; 24 jam di hari kerja.</p>

                            <dl className="mt-8 space-y-5">
                                <ContactRow icon={<MapPin className="size-4" />} label="Lokasi" value={address} />
                                <ContactRow icon={<Clock className="size-4" />} label="Waktu respons" value="< 24 jam di hari kerja" />
                            </dl>

                            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-6 font-mono text-[13px] leading-7 text-slate-400 shadow-lg">
                                <p><span className="text-slate-600">$</span> <span className="text-emerald-400">curl</span> -X POST https://raycode.dev/contact \</p>
                                <p>{'   '}<span className="text-brand-300">-d</span> "project=your_idea"</p>
                                <p className="mt-1 text-slate-500">→ 201 Created — balasan dalam 24 jam ⚡</p>
                            </div>
                        </Reveal>

                        {/* Form side */}
                        <Reveal delay={140} direction="left">
                            <div className="rounded-2xl border border-line bg-card p-7 shadow-xl shadow-slate-900/5 sm:p-9 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_24px_64px_-24px_rgb(0_0_0/0.7)]">
                                {recentlySuccessful && (
                                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                                        Pesan terkirim! Periksa kotak masuk Anda untuk konfirmasi.
                                    </div>
                                )}

                                {/* Method toggle header */}
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-base font-bold text-ink dark:text-white">
                                        {method === 'wa' ? 'Hubungi via WhatsApp' : 'Kirim via Email'}
                                    </h2>
                                    <span className={method === 'wa' ? 'inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1 text-xs font-bold text-white' : 'inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white'}>
                                        {method === 'wa' ? <><Phone className="size-3" /> WhatsApp</> : <><Mail className="size-3" /> Email</>}
                                    </span>
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Input
                                            label="Nama Anda"
                                            placeholder="Ada Lovelace"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            error={errors.name}
                                            required
                                            autoFocus
                                        />
                                        {method === 'wa' ? (
                                            <Input
                                                label="No. WhatsApp"
                                                type="tel"
                                                placeholder="+62 812 3456 7890"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                error={errors.phone as string | undefined}
                                                required
                                            />
                                        ) : (
                                            <Input
                                                label="Email"
                                                type="email"
                                                placeholder="ada@company.com"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                error={errors.email}
                                                required
                                            />
                                        )}
                                    </div>

                                    {/* For WA we still need email? Keep hidden email as optional for WA mode */}
                                    {method === 'wa' && (
                                        <Input
                                            label="Email (opsional)"
                                            type="email"
                                            placeholder="ada@company.com"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            error={errors.email}
                                        />
                                    )}
                                    {method === 'email' && data.phone === '' ? null : method === 'email' ? (
                                        <Input
                                            label="No. WhatsApp (opsional)"
                                            type="tel"
                                            placeholder="+62 812 3456 7890"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                    ) : null}

                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-ink-2">Saya tertarik pada</span>
                                        <Select
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                        >
                                            <option>Pengembangan Website</option>
                                            <option>Pengembangan Aplikasi Web</option>
                                            <option>Perbaikan Bug</option>
                                            <option>Tinjauan & Audit Kode</option>
                                            <option>Konsultasi Pemrograman</option>
                                            <option>Dukungan Teknis Berkelanjutan</option>
                                            <option>Lainnya</option>
                                        </Select>
                                    </label>

                                    <Textarea
                                        label="Detail proyek"
                                        placeholder="Apa yang sedang Anda bangun? Masalah apa yang ingin diselesaikan? Linimasa? Ada tautan ke sistem yang sudah ada?"
                                        rows={6}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        error={errors.message}
                                        required
                                    />

                                    <Button type="submit" size="lg" disabled={processing} className={method === 'wa' ? 'w-full bg-[#25D366] hover:bg-[#1fb255] focus-visible:ring-[#25D366]' : 'w-full'}>
                                        {processing ? (
                                            'Mengirim...'
                                        ) : method === 'wa' ? (
                                            <>
                                                <MessageCircle className="size-4" /> Kirim via WhatsApp
                                            </>
                                        ) : (
                                            <>
                                                Kirim via Email
                                                <Send className="size-4" />
                                            </>
                                        )}
                                    </Button>

                                    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-4">
                                        {method === 'wa' ? (
                                            <>Akan membuka WhatsApp dengan pesan terisi otomatis</>
                                        ) : (
                                            <>
                                                <Mail className="size-3.5" />
                                                Email kami langsung di {contactEmail}
                                            </>
                                        )}
                                    </p>
                                </form>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className ?? 'size-5 fill-white'} aria-hidden fill="white">
            <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9 1 1-2.9-.2-.3a8.2 8.2 0 1 1 6.6 3.6Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
        </svg>
    );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
    const content = (
        <>
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/25">{icon}</span>
            <span>
                <dt className="text-xs font-semibold tracking-wide text-ink-4 uppercase">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
            </span>
        </>
    );

    return href ? (
        <a href={href} className="group flex items-center gap-4 rounded-xl transition-colors hover:bg-slate-50 p-2 -m-2 dark:hover:bg-white/5">
            {content}
        </a>
    ) : (
        <div className="flex items-center gap-4">{content}</div>
    );
}
