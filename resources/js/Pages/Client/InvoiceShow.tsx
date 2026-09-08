import type { Invoice, PageProps } from '@/types';
import { R } from '@/lib/routes';
import { formatDate, formatIDR } from '@/lib/utils';
import { ClientLayout } from '@/Components/layout/ClientLayout';
import { Badge, Button, ButtonLink, Card, StatusPill } from '@/Components/ui';
import { usePage } from '@inertiajs/react';
import { ArrowLeft, Building2, Mail, Printer } from 'lucide-react';

interface Props extends PageProps {
    invoice: Invoice & {
        project?: { id: number; title: string; service?: { id: number; title: string } | null };
        user?: Pick<import('@/types').User, 'id' | 'name' | 'email' | 'company'>;
    };
}

export default function InvoiceShow({ invoice }: Props) {
    const user = usePage<PageProps>().props.auth.user!;
    const taxRate = invoice.amount > 0 ? Math.round((invoice.tax / invoice.amount) * 100) : 11;

    const print = () => window.print();

    return (
        <ClientLayout title={`Invoice ${invoice.number}`}>
            <a
                href={R.clientInvoices}
                className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-brand-600"
            >
                <ArrowLeft className="size-4" />
                All invoices
            </a>

            <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
                {/* Invoice document */}
                <Card className="overflow-hidden">
                    {/* Header band */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-alt/70 px-8 py-6">
                        <div>
                            <p className="font-mono text-xs tracking-widest text-ink-4 uppercase">INVOICE</p>
                            <p className="mt-1 font-mono text-xl font-bold text-ink">{invoice.number}</p>
                        </div>
                        <div className="text-right">
                            <Badge tone={invoice.status === 'paid' ? 'green' : invoice.status === 'unpaid' ? 'amber' : 'slate'}>
                                {invoice.status.toUpperCase()}
                            </Badge>
                            <p className="mt-2 text-xs text-ink-3">
                                Issued {formatDate(invoice.created_at)} · Due {formatDate(invoice.due_date)}
                            </p>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="grid gap-8 px-8 py-7 sm:grid-cols-2">
                        <div>
                            <p className="text-[11px] font-semibold tracking-widest text-ink-4 uppercase">From</p>
                            <div className="mt-3">
                                <p className="flex items-center gap-1.5 font-bold text-ink">
                                    <Building2 className="size-3.5 text-brand-600" />
                                    Raycode Studio
                                </p>
                                <p className="mt-1 text-sm text-ink-3">Jakarta, Indonesia</p>
                                <p className="text-sm text-ink-3">hello@raycode.dev</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold tracking-widest text-ink-4 uppercase">Bill to</p>
                            <div className="mt-3">
                                <p className="font-bold text-ink">{invoice.user?.company ?? invoice.user?.name ?? '—'}</p>
                                <p className="mt-1 text-sm text-ink-3">{invoice.user?.name}</p>
                                <p className="flex items-center gap-1.5 text-sm text-ink-3">
                                    <Mail className="size-3.5" />
                                    {invoice.user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="px-8 pb-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-y border-line text-left text-xs tracking-wider text-slate-400 uppercase dark:bg-white/[0.03]">
                                    <th className="py-3.5 font-semibold">Description</th>
                                    <th className="py-3.5 text-right font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-line">
                                    <td className="py-5">
                                        <p className="font-semibold text-ink">{invoice.project?.title ?? 'Development services'}</p>
                                        <p className="mt-0.5 text-xs text-ink-3">
                                            {invoice.project?.service?.title ?? 'Custom development'} — milestone billing
                                        </p>
                                    </td>
                                    <td className="py-5 text-right font-mono font-semibold whitespace-nowrap text-ink">{formatIDR(invoice.amount)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end px-8 pb-8">
                        <dl className="w-full max-w-xs space-y-2.5 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-ink-3">Subtotal</dt>
                                <dd className="font-mono text-ink">{formatIDR(invoice.amount)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-ink-3">Tax ({taxRate}%)</dt>
                                <dd className="font-mono text-ink">{formatIDR(invoice.tax)}</dd>
                            </div>
                            <div className="flex justify-between border-t-2 border-slate-900 pt-3 dark:border-white/30">
                                <dt className="font-bold text-ink">Total due</dt>
                                <dd className="font-mono text-lg font-bold text-brand-700 dark:text-brand-300">{formatIDR(invoice.total)}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="border-t border-dashed border-line bg-alt/60 px-8 py-4 text-xs text-ink-4">
                        Payment via bank transfer · BCA 123-456-789 (Raycode Studio) · Include invoice number as reference.
                    </div>
                </Card>

                {/* Actions sidebar */}
                <Card className="p-6 lg:sticky lg:top-24">
                    <h3 className="font-semibold text-ink">Payment status</h3>
                    <div className="mt-3">
                        <StatusPill status={invoice.status} />
                    </div>

                    {invoice.paid_at ? (
                        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            Paid on {formatDate(invoice.paid_at)}. Thank you!
                        </p>
                    ) : (
                        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                            Transfer to the bank account above before{' '}
                            <span className="font-semibold">{formatDate(invoice.due_date)}</span>, then send the receipt to our team for confirmation.
                        </p>
                    )}

                    <Button variant="secondary" className="mt-5 w-full" onClick={print}>
                        <Printer className="size-4" />
                        Print / Save PDF
                    </Button>

                    {invoice.paid_at && (
                        <ButtonLink href={R.clientOrder} variant="primary" className="mt-3 w-full">
                            Start another project →
                        </ButtonLink>
                    )}
                    <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-4">
                        Questions about this invoice? Message us from the Messages tab — we'll reconcile within one business day.
                    </p>
                </Card>
            </div>
        </ClientLayout>
    );
}
