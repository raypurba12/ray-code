import type { Service } from '@/types';
import { R } from '@/lib/routes';
import { formatIDR } from '@/lib/utils';
import { ServiceIcon } from '@/lib/icons';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Reveal } from '@/Components/Reveal';
import { Badge, ButtonLink, Eyebrow } from '@/Components/ui';
import { usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Clock, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
    service: Service;
    relatedServices: Pick<Service, 'slug' | 'title' | 'short_desc' | 'icon'>[];
}

export default function ServiceShow({ service, relatedServices }: Props) {
    const user = usePage<{ auth: { user: { role: string } | null } }>().props.auth.user;
    const orderHref = user ? (user.role === 'client' ? R.clientOrder : R.contact) : R.contact;

    return (
        <PublicLayout>
            <article className="pt-17">
                {/* Header */}
                <section className="relative overflow-hidden border-b border-line bg-alt">
                    <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                    <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                        <Reveal>
                            <a
                                href={R.servicesIndex}
                                className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-brand-600"
                            >
                                <ArrowLeft className="size-4" />
                                Semua layanan
                            </a>
                        </Reveal>

                        <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
                            <Reveal delay={80}>
                                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
                                    <ServiceIcon name={service.icon} className="size-6" />
                                </span>
                                <Eyebrow>Layanan</Eyebrow>
                                <h1 className="text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">{service.title}</h1>
                                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">{service.short_desc}</p>

                                <div className="mt-7 flex flex-wrap items-center gap-3">
                                    <Badge tone="blue">
                                        <Clock className="size-3.5" /> Estimasi pengerjaan: {service.delivery_days} hari
                                    </Badge>
                                    <Badge tone="green">
                                        <ShieldCheck className="size-3.5" /> Termasuk garansi perbaikan bug
                                    </Badge>
                                </div>
                            </Reveal>

                            <Reveal delay={180} direction="left">
                                <div className="rounded-2xl border border-line bg-card p-7 shadow-xl shadow-slate-900/5 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
                                    <p className="text-xs font-semibold tracking-widest text-ink-4 uppercase">Mulai dari</p>
                                    <p className="mt-2 font-mono text-4xl font-bold tracking-tight text-ink">{formatIDR(service.starting_price)}</p>
                                    <p className="mt-1 text-xs text-ink-3">Harga final dikonfirmasi setelah sesi konsultasi awal — tanpa biaya tersembunyi.</p>
                                    <ButtonLink href={orderHref} className="mt-6 w-full" size="lg">
                                        Mulai dengan layanan ini
                                        <ArrowRight className="size-4" />
                                    </ButtonLink>
                                    <ButtonLink href={R.estimator} variant="secondary" className="mt-3 w-full">
                                        Estimasi anggaran saya
                                    </ButtonLink>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* Body */}
                <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
                    <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
                        <Reveal>
                            <h2 className="text-2xl font-bold tracking-tight text-ink">Yang akan Anda dapatkan</h2>
                            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-2">
                                {(service.description ?? '').split('\n\n').map((paragraph) => (
                                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                                ))}
                            </div>
                        </Reveal>

                        <Reveal delay={120}>
                            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-7 dark:border-brand-500/25 dark:bg-brand-500/10">
                                <h3 className="flex items-center gap-2 font-bold text-ink">
                                    <Sparkles className="size-4 text-brand-600 dark:text-brand-400" />
                                    Termasuk di setiap pengerjaan
                                </h3>
                                <ul className="mt-4 space-y-3">
                                    {(service.features ?? []).map((feature) => (
                                        <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-2">
                                            <Check className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-400" strokeWidth={2.5} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* Related */}
                {relatedServices.length > 0 && (
                    <section className="border-t border-line bg-alt">
                        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
                            <Reveal>
                                <h2 className="font-mono text-sm font-semibold tracking-widest text-ink-4 uppercase">// Sering dikombinasikan dengan</h2>
                            </Reveal>
                            <div className="mt-8 grid gap-5 md:grid-cols-3">
                                {relatedServices.map((related, i) => (
                                    <Reveal key={related.slug} delay={i * 90}>
                                        <a
                                            href={R.servicesShow(related.slug)}
                                            className="group flex h-full flex-col rounded-2xl border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40"
                                        >
                                            <ServiceIcon name={related.icon} className="size-6 text-brand-600 dark:text-brand-400" />
                                            <h3 className="mt-4 font-bold text-ink group-hover:text-brand-700">{related.title}</h3>
                                            <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-2">{related.short_desc}</p>
                                        </a>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </article>
        </PublicLayout>
    );
}
