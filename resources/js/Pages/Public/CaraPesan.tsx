import { R } from '@/lib/routes';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { SeoHead } from '@/Components/SeoHead';
import { Reveal } from '@/Components/Reveal';
import { usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock, CreditCard, FileText, MessageCircle, PackageCheck, Send } from 'lucide-react';

export default function CaraPesan() {
    const { settings } = usePage<{ settings: Record<string, string> }>().props as unknown as { settings: Record<string, string> };
    const waNumber = (settings?.whatsapp ?? '+6281234567890').replace(/[^0-9]/g, '');
    const waHref = `https://wa.me/${waNumber}?text=Halo%20Raycode!%20Saya%20ingin%20pesan%20jasa%20coding`;
    const waHrefConsult = `https://wa.me/${waNumber}?text=Halo%20Raycode!%20Saya%20ingin%20konsultasi%20pesanan`;
    const steps = [
        {
            n: '01',
            title: 'Contact Raycode lewat WhatsApp',
            desc: 'Klik tombol di bawah, langsung chat Raycode.',
            icon: MessageCircle,
            cta: 'Chat Raycode',
            href: waHref,
        },
        {
            n: '02',
            title: 'Kasih Tau Detail Tugasmu',
            desc: 'Jelaskan detail tugas kamu lalu kirim foto serta deadline-nya.',
            icon: FileText,
        },
        {
            n: '03',
            title: 'Penentuan Harga serta Pembayaran DP 50%',
            desc: 'Kami tentukan harganya dan kamu DP 50% sebagai tanda jadi.',
            icon: CreditCard,
        },
        {
            n: '04',
            title: 'Menunggu Hasil Tugas',
            desc: 'Jika pengerjaan sudah selesai, kami akan kasih tau.',
            icon: Clock,
        },
        {
            n: '05',
            title: 'Pelunasan Pembayaran',
            desc: 'Suka dan cocok dengan hasilnya? Lanjut pelunasan.',
            icon: CheckCircle2,
        },
        {
            n: '06',
            title: 'Pemberian Hasil Tugas',
            desc: 'Kami kasih hasil dari yang sudah dikerjakan, DONE.',
            icon: PackageCheck,
        },
    ];
    return (
        <PublicLayout>
            <SeoHead
                title="Cara Pemesanan Layanan & Joki"
                description="Panduan 6 langkah mudah memesan proyek web development & joki koding di Raycode Studio."
            />
            <section className="relative overflow-hidden">
                <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-10 lg:px-8 lg:pt-20">
                    <Reveal>
                        <div className="mx-auto max-w-3xl text-center">
                            <span className="inline-flex items-center rounded-full bg-amber-400 px-4 py-1.5 text-xs font-extrabold tracking-widest text-slate-900 uppercase shadow-sm">
                                DEADLINE MEPET? KAMI SIAP 24 JAM
                            </span>
                            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                                Cara Pesan di Raycode!
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-2">
                                Pesan layanan di Raycode dengan mudah dan cepat! Ikuti langkah-langkah berikut untuk mendapatkan bantuan terbaik dari kami.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {steps.map((step, i) => (
                        <Reveal key={step.n} delay={(i % 3) * 80}>
                            <div className="group flex h-full flex-col rounded-2xl border border-line bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_16px_40px_-16px_rgb(37_99_235/0.18)] dark:border-white/[0.06] dark:hover:border-brand-500/30 dark:hover:bg-white/[0.03]">
                                <div className="flex items-start justify-between">
                                    <span className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-white/[0.06] dark:text-brand-300 dark:ring-white/10 dark:group-hover:bg-brand-500">
                                        <step.icon className="size-6" aria-hidden />
                                    </span>
                                    <span className="font-mono text-sm font-bold text-slate-200 dark:text-slate-700">{step.n}</span>
                                </div>
                                <h3 className="mt-5 text-base font-bold text-ink dark:text-white">{step.title}</h3>
                                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-3">{step.desc}</p>
                                {step.cta && step.href && (
                                    <a
                                        href={step.href}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                                    >
                                        <Send className="size-4" /> {step.cta}
                                    </a>
                                )}
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={200}>
                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <a
                            href={waHrefConsult}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-8 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgb(37_211_102/0.5)] transition-all hover:-translate-y-0.5 hover:bg-[#1fb255]"
                        >
                            <MessageCircle className="size-5" /> Konsultasi via WhatsApp
                        </a>
                        <a
                            href={R.contact}
                            className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-card px-8 text-sm font-semibold text-ink transition-colors hover:bg-hover dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
                        >
                            Hubungi via Form <ArrowRight className="size-4" />
                        </a>
                    </div>
                </Reveal>
            </section>
        </PublicLayout>
    );
}
