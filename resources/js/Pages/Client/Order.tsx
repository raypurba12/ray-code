import type { PageProps, Service } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatIDR } from '@/lib/utils';
import { ClientLayout } from '@/Components/layout/ClientLayout';
import { Button, Card, Input, Textarea } from '@/Components/ui';
import { Reveal } from '@/Components/Reveal';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Send, Wallet } from 'lucide-react';
import { useForm } from '@inertiajs/react';

interface Props extends PageProps {
    services: Pick<Service, 'id' | 'slug' | 'title' | 'starting_price' | 'delivery_days'>[];
    prefill: {
        service_id?: string | null;
        budget?: string | null;
        title?: string | null;
        deadline?: string | null;
    };
}

export default function Order({ services, prefill }: Props) {
    const preselected = services.find((s) => String(s.id) === prefill.service_id || s.slug === prefill.service_id);

    const { data, setData, post, processing, errors } = useForm({
        title: prefill.title ?? '',
        service_id: (preselected?.id ?? services[0]?.id ?? 0).toString(),
        requirements: '',
        budget: prefill.budget ?? '',
        deadline: prefill.deadline ?? '',
    });

    const selectedService = services.find((s) => String(s.id) === data.service_id);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(R.clientOrder);
    };

    return (
        <ClientLayout title="Place a new order">
            <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
                <Reveal>
                    <Card className="p-7 sm:p-9">
                        <h2 className="text-lg font-bold text-ink">Tell us what you need</h2>
                        <p className="mt-1 text-sm text-ink-3">The more detail, the sharper the quote. Minimum info is fine too — we'll follow up.</p>

                        <form onSubmit={submit} className="mt-7 space-y-6">
                            <Input
                                label="Project title"
                                placeholder="e.g. Company profile website for my coffee shop"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                error={errors.title}
                                required
                                autoFocus
                            />

                            <fieldset>
                                <legend className="mb-2 text-sm font-medium text-ink-2">Service type</legend>
                                <div className="grid gap-2 sm:grid-cols-3">
                                    {services.map((service) => (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => setData('service_id', String(service.id))}
                                            className={cn(
                                                'rounded-xl border px-4 py-3 text-left transition-all duration-200',
                                                String(service.id) === data.service_id
                                                    ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300 dark:bg-brand-500/10 dark:ring-brand-500/25'
                                                    : 'border-line hover:border-brand-200 hover:bg-hover',
                                            )}
                                        >
                                            <p className={cn('text-[13px] leading-snug font-semibold', String(service.id) === data.service_id ? 'text-brand-800 dark:text-brand-300' : 'text-ink-2')}>
                                                {service.title}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                {errors.service_id && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.service_id}</p>}
                            </fieldset>

                            <Textarea
                                label="Requirements"
                                rows={7}
                                placeholder={
                                    "Describe your project:\n• Goals & target users\n• Key pages / features\n• References you like\n• Anything we must know"
                                }
                                value={data.requirements}
                                onChange={(e) => setData('requirements', e.target.value)}
                                error={errors.requirements}
                                required
                            />

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="relative">
                                    <Wallet className="pointer-events-none absolute top-[2.45rem] left-3.5 size-4 text-ink-4" />
                                    <Input
                                        label="Your budget (IDR)"
                                        type="number"
                                        min={100000}
                                        step={50000}
                                        className="pl-10"
                                        placeholder="6500000"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', e.target.value)}
                                        error={errors.budget}
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute top-[2.45rem] left-3.5 size-4 text-ink-4" />
                                    <Input
                                        label="Ideal deadline"
                                        type="date"
                                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                        value={data.deadline}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                        error={errors.deadline}
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" size="lg" disabled={processing} className="w-full sm:w-auto">
                                {processing ? (
                                    'Placing order...'
                                ) : (
                                    <>
                                        Place order
                                        <Send className="size-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                </Reveal>

                {/* Summary sidebar */}
                <Reveal delay={140} direction="left" className="lg:sticky lg:top-24">
                    <motion.div layout className="overflow-hidden rounded-2xl border border-line shadow-sm dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
                        <div className="bg-slate-950 px-6 py-4">
                            <p className="font-mono text-xs tracking-widest text-brand-400 uppercase">// order_summary</p>
                        </div>
                        <div className="bg-card p-6">
                            <dl className="space-y-4 text-sm">
                                <div>
                                    <dt className="text-xs text-ink-4">Service</dt>
                                    <dd className="mt-0.5 font-semibold text-ink">{selectedService?.title ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-xs text-ink-4">Typical delivery</dt>
                                    <dd className="font-medium text-ink">~{selectedService?.delivery_days ?? '—'} days</dd>
                                </div>
                                <div className="flex justify-between gap-4 border-t border-dashed border-line pt-4">
                                    <dt className="text-xs text-ink-4">Starting price</dt>
                                    <dd className="font-mono font-bold text-brand-700 dark:text-brand-300">{selectedService ? formatIDR(selectedService.starting_price) : '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-xs text-ink-4">Your budget</dt>
                                    <dd className="font-mono font-bold text-ink">{data.budget ? formatIDR(Number(data.budget)) : '—'}</dd>
                                </div>
                            </dl>

                            <ul className="mt-6 space-y-2.5 rounded-xl bg-alt p-4 text-xs text-ink-2">
                                {[
                                    'Fixed quote within 24 hours',
                                    '50% upfront · 50% on completion',
                                    'Free revision rounds in scope',
                                    'Bugfix warranty after launch',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-2">
                                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </Reveal>
            </div>
        </ClientLayout>
    );
}
