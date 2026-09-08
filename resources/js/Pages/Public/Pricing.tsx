import type { Faq, PricingPlan } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatIDR } from '@/lib/utils';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { Reveal } from '@/Components/Reveal';
import { ButtonLink, Eyebrow, SectionHeading } from '@/Components/ui';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/Accordion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

interface Props {
    plans: PricingPlan[];
    faqs: Faq[];
}

export default function Pricing({ plans, faqs }: Props) {
    return (
        <PublicLayout>
            <section className="relative overflow-hidden pt-17">
                <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-12 text-center lg:px-8 lg:pt-24">
                    <Reveal>
                        <div className="mx-auto max-w-2xl">
                            <Eyebrow>Harga</Eyebrow>
                            <h1 className="text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">
                                Harga jujur. Tanpa tagihan kejutan.
                            </h1>
                            <p className="mt-5 text-lg leading-relaxed text-ink-2">
                                Penawaran tetap disepakati di awal. Jika kami salah memperkirakan upaya, itu tanggung jawab kami — bukan biaya tambahan untuk Anda.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Plans */}
            <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {plans.map((plan, i) => (
                        <Reveal key={plan.id} delay={i * 90}>
                            <div
                                className={cn(
                                    'relative flex h-full flex-col rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1.5',
                                    plan.is_popular
                                        ? 'border-brand-300 shadow-[0_20px_48px_-18px_rgb(37_99_235/0.3)] ring-1 ring-brand-200 dark:border-brand-500/40 dark:bg-gradient-to-b dark:from-brand-500/[0.08] dark:to-transparent dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:ring-brand-500/25'
                                        : 'border-line shadow-[0_1px_3px_rgb(15_23_42/0.04)] hover:border-brand-200 hover:shadow-[0_16px_40px_-16px_rgb(37_99_235/0.18)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40',
                                )}
                            >
                                {plan.is_popular && (
                                    <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-md shadow-brand-600/30">
                                        <Sparkles className="size-3" /> Paling Populer
                                    </span>
                                )}

                                <h2 className="text-lg font-bold text-ink">{plan.name}</h2>
                                <p className="mt-1.5 min-h-10 text-[13px] leading-relaxed text-ink-3">{plan.tagline}</p>

                                <p className="mt-6 font-mono text-[2rem] leading-none font-bold tracking-tight text-ink">
                                    {formatIDR(plan.price)}
                                </p>
                                <p className="mt-1 text-xs font-medium text-ink-4">per {plan.unit.replace(/\//g, '')}</p>

                                <ButtonLink href={R.contact} variant={plan.is_popular ? 'primary' : 'secondary'} className="mt-6 w-full">
                                    {plan.cta_text}
                                </ButtonLink>

                                <ul className="mt-7 space-y-3 border-t border-dashed border-line pt-6">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-2">
                                            <Check className={cn('mt-0.5 size-4 shrink-0', plan.is_popular ? 'text-brand-600' : 'text-emerald-500')} strokeWidth={2.5} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={200}>
                    <p className="mt-10 text-center text-sm text-ink-3">
                        Bingung pilih paket yang cocok?{' '}
                        <a href={R.estimator} className="font-semibold text-brand-600 hover:text-brand-700">
                            Dapatkan estimasi instan →
                        </a>
                    </p>
                </Reveal>
            </section>

            {/* Comparison note + FAQ */}
            <section className="mx-auto max-w-3xl px-5 py-20 lg:py-28">
                <Reveal>
                    <SectionHeading eyebrow="FAQ Tagihan" title="Pertanyaan seputar biaya." align="center" />
                </Reveal>
                <Reveal delay={120}>
                    <Accordion type="single" collapsible className="mt-10">
                        {(faqs.length ? faqs : fallbackFaqs).map((faq) => (
                            <AccordionItem key={faq.question} value={faq.question}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Reveal>
            </section>
        </PublicLayout>
    );
}

const fallbackFaqs = [
    {
        question: 'Metode pembayaran apa yang Anda terima?',
        answer: 'Transfer bank (BCA, Mandiri), virtual account, QRIS, dan kartu internasional via Stripe. Ketentuan standar 50% di muka, 50% saat selesai.',
    },
];
