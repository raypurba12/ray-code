import type { Faq, Testimonial } from '@/types';
import { R } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { PublicLayout } from '@/Components/layout/PublicLayout';
import { SeoHead } from '@/Components/SeoHead';
import { Reveal } from '@/Components/Reveal';
import { ButtonLink, Eyebrow, Stars } from '@/Components/ui';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/Accordion';
import { MessageCircleQuestion, Quote } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    faqs: Faq[];
    testimonials: Testimonial[];
}

export default function Faq({ faqs, testimonials }: Props) {
    const categories = useMemo(() => ['All', ...Array.from(new Set(faqs.map((f) => f.category ?? 'General')))], [faqs]);
    const [activeCategory, setActiveCategory] = useState('All');

    const visible = activeCategory === 'All' ? faqs : faqs.filter((f) => f.category === activeCategory);

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
    };

    return (
        <PublicLayout>
            <SeoHead
                title="Pertanyaan Umum (FAQ)"
                description="Jawaban atas pertanyaan yang sering diajukan mengenai pengerjaan proyek, garansi perbaikan bug, pembayaran, dan sesi konsultasi."
                breadcrumbs={[
                    { name: 'Home', item: '/' },
                    { name: 'FAQ', item: '/faq' },
                ]}
                jsonLd={faqSchema}
            />
            <section className="relative overflow-hidden pt-17">
                <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative mx-auto max-w-3xl px-5 pt-16 pb-10 text-center lg:px-8 lg:pt-24">
                    <Reveal>
                        <span className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/25">
                            <MessageCircleQuestion className="size-7" strokeWidth={1.8} />
                        </span>
                        <Eyebrow>FAQ</Eyebrow>
                        <h1 className="text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">
                            Semua yang ditanyakan klien sebelum bekerja sama.
                        </h1>
                        <p className="mt-5 text-lg leading-relaxed text-ink-2">
                            Jawaban lugas seputar proses, harga, dan teknologi. Masih penasaran? Kami hanya sejauh satu pesan.
                        </p>
                    </Reveal>

                    <Reveal delay={140}>
                        <div className="mt-9 flex flex-wrap justify-center gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200',
                                        activeCategory === cat
                                            ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/25'
                                            : 'border-line bg-card text-ink-2 hover:border-brand-300 hover:text-brand-700',
                                    )}
                                >
                                    {cat === 'All' ? 'Semua' : cat === 'General' ? 'Umum' : cat}
                                </button>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-5 pb-20 lg:pb-28">
                <Reveal delay={200}>
                    {visible.length > 0 ? (
                        <Accordion type="single" collapsible defaultValue={[visible[0]?.question ?? '']} className="rounded-2xl border border-line bg-card px-6 shadow-sm sm:px-8 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
                            {visible.map((faq) => (
                                <AccordionItem key={faq.question} value={faq.question}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : null}
                </Reveal>
            </section>

            {testimonials.length > 0 && (
<section className="border-t border-line bg-alt">
                        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
                            <Reveal>
                                <h2 className="font-mono text-sm font-semibold tracking-widest text-ink-4 uppercase">// Selagi Anda di sini</h2>
                        </Reveal>
                        <div className="mt-8 grid gap-5 md:grid-cols-3">
                            {testimonials.map((t, i) => (
                                <Reveal key={t.id} delay={i * 100}>
                                    <figure className="flex h-full flex-col rounded-2xl border border-line bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40">
                                        <Quote className="size-6 fill-brand-100 text-brand-200 dark:fill-brand-500/20 dark:text-brand-500/40" aria-hidden />
                                        <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">"{t.content}"</blockquote>
                                        <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                                            <div>
                                                <p className="text-sm font-semibold text-ink">{t.name}</p>
                                                <p className="text-xs text-ink-3">{t.company}</p>
                                            </div>
                                            <Stars rating={t.rating} />
                                        </figcaption>
                                    </figure>
                                </Reveal>
                            ))}
                        </div>

                        <Reveal delay={220}>
                            <div className="mt-12 text-center">
                                <ButtonLink href={R.contact} size="lg">
                                    Tanyakan langsung kepada kami →
                                </ButtonLink>
                            </div>
                        </Reveal>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
