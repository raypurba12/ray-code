import type { Invoice, PageProps } from '@/types';
import { R } from '@/lib/routes';
import { formatDate, formatIDR } from '@/lib/utils';
import { ClientLayout } from '@/Components/layout/ClientLayout';
import { Card, EmptyState, StatusPill } from '@/Components/ui';
import { Reveal } from '@/Components/Reveal';
import { ReceiptText } from 'lucide-react';

interface Props extends PageProps {
    invoices: (Invoice & { project?: { id: number; title: string } })[];
}

export default function Invoices({ invoices }: Props) {
    const totalUnpaid = invoices.filter((i) => i.status === 'unpaid').reduce((sum, i) => sum + i.total, 0);
    const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);

    return (
        <ClientLayout title="Invoices">
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Outstanding" value={formatIDR(totalUnpaid)} tone={totalUnpaid > 0 ? 'text-red-600 dark:text-red-400' : 'text-ink'} />
                <SummaryCard label="Paid to date" value={formatIDR(totalPaid)} tone="text-emerald-600 dark:text-emerald-300" />
                <SummaryCard label="Total invoices" value={String(invoices.length)} tone="text-ink" />
            </div>

            {invoices.length === 0 ? (
                <EmptyState icon={<ReceiptText className="size-5" />} title="No invoices yet" description="When a project kicks off, your invoice will land here." />
            ) : (
                <Reveal>
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead>
                                    <tr className="border-b border-line text-left text-xs tracking-wider text-slate-400 uppercase dark:bg-white/[0.03]">
                                        <th className="px-6 py-4 font-semibold">Invoice</th>
                                        <th className="px-6 py-4 font-semibold">Project</th>
                                        <th className="px-6 py-4 font-semibold">Due date</th>
                                        <th className="px-6 py-4 text-right font-semibold">Amount</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-hairline">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="group transition-colors hover:bg-hover">
                                            <td className="px-6 py-4 font-mono font-semibold whitespace-nowrap text-ink">{invoice.number}</td>
                                            <td className="max-w-[220px] truncate px-6 py-4 text-ink-2">{invoice.project?.title ?? '—'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-ink-2">{formatDate(invoice.due_date)}</td>
                                            <td className="px-6 py-4 text-right font-mono font-bold whitespace-nowrap text-ink">{formatIDR(invoice.total)}</td>
                                            <td className="px-6 py-4">
                                                <StatusPill status={invoice.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={R.clientInvoice(invoice.id)}
                                                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/10"
                                                >
                                                    View →
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </Reveal>
            )}
        </ClientLayout>
    );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: string }) {
    return (
        <div className="rounded-2xl border border-line bg-card p-5 shadow-[0_1px_3px_rgb(15_23_42/0.04)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]">
            <p className="text-xs font-medium text-ink-3">{label}</p>
            <p className={`mt-1.5 font-mono text-xl font-bold tracking-tight ${tone}`}>{value}</p>
        </div>
    );
}
