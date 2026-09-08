import type { Service } from '@/types';
import { R } from '@/lib/routes';
import { formatIDR } from '@/lib/utils';
import { ServiceIcon } from '@/lib/icons';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Reveal } from '@/Components/Reveal';
import { ButtonLink, Eyebrow } from '@/Components/ui';
import { ArrowUpRight, Check, Clock } from 'lucide-react';

export default function Reguler({ services }: { services: Service[] }) {
    return (
        <PublicLayout>
            <section className="relative overflow-hidden pt-17">
                <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-14 lg:px-8 lg:pt-24">
                    <Reveal>
                        <Eyebrow>Layanan Reguler</Eyebrow>
                        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">
                            Enam layanan inti yang siap membantu proyek Anda.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
                            Layanan reguler kami mencakup seluruh siklus hidup produk — dari website profil hingga dukungan berkelanjutan. Setiap pengerjaan memiliki lingkup yang jelas dan dipimpin oleh tim senior.
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8 lg:pb-32">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {services.map((service, i) => (
                        <Reveal key={service.id} delay={(i % 3) * 90}>
                            <ServiceCard service={service} index={i + 1} />
                        </Reveal>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
    return (
        <a
            href={R.servicesShow(service.slug)}
            className="group flex h-full flex-col rounded-2xl border border-line bg-card p-8 shadow-[0_1px_3px_rgb(15_23_42/0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[0_20px_44px_-18px_rgb(37_99_235/0.22)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40"
        >
            <div className="flex items-start justify-between">
                <span className="font-mono text-sm font-bold text-slate-200 transition-colors group-hover:text-brand-300 dark:text-slate-700">
                    /{String(index).padStart(2, '0')}
                </span>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/25">
                    <ServiceIcon name={service.icon} className="size-5" />
                </span>
            </div>

            <h2 className="mt-6 text-xl font-bold text-ink transition-colors group-hover:text-brand-700">{service.title}</h2>
            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-2">{service.short_desc}</p>

            <ul className="mt-5 space-y-2">
                {(service.features ?? []).slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[13px] text-ink-3">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                        {feature}
                    </li>
                ))}
                {(service.features?.length ?? 0) > 3 && (
                    <li className="text-xs font-medium text-ink-4">+{(service.features?.length ?? 0) - 3} lainnya</li>
                )}
            </ul>

            <div className="mt-7 flex items-center justify-between border-t border-dashed border-line pt-5">
                <div>
                    <p className="text-[11px] font-medium tracking-wide text-ink-4 uppercase">Mulai dari</p>
                    <p className="font-mono text-base font-bold text-ink">{formatIDR(service.starting_price)}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-ink-3">
                    <Clock className="size-3.5" />~{service.delivery_days} hari
                </span>
                <ArrowUpRight className="size-4 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600 dark:text-slate-600" />
            </div>
        </a>
    );
}
