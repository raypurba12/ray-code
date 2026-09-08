import type { Invoice, PageProps, Project } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatDate, formatIDR } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card } from '@/Components/ui';
import { Link, router } from '@inertiajs/react';
import { FileText, Filter, Inbox } from 'lucide-react';

interface Props extends PageProps {
    orders: {
        data: (Project & {
            user?: Pick<import('@/types').User, 'id' | 'name' | 'email'>;
            service?: Pick<import('@/types').Service, 'id' | 'title'> | null;
            invoices?: Invoice[];
        })[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { status: string | null };
}

const statuses = ['pending', 'in_review', 'in_progress', 'review', 'completed', 'cancelled'] as const;

export default function AdminOrders({ orders, filters }: Props) {
    const setFilter = (status: string | null) => {
        router.get(R.adminOrders, status ? { status } : {}, { preserveState: true });
    };

    const setStatus = (order: Project, status: string) => {
        router.patch(R.adminOrdersStatus(order.id), { status }, { preserveScroll: true });
    };

    const generateInvoice = (order: Project) => {
        router.post(R.adminOrdersInvoice(order.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Pesanan" description="Kelola pesanan masuk dan status">
            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                    <Filter className="size-3.5" />
                    Status:
                </span>
                <button
                    onClick={() => setFilter(null)}
                    className={cn(
                        'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                        !filters.status
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                    )}
                >
                    All
                </button>
                {statuses.map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={cn(
                            'rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors',
                            filters.status === status
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                        )}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr className="text-left">
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Order / Client</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Service</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Budget</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Deadline</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Status</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                                            <Inbox className="size-6" />
                                            <p className="text-sm">No orders match this filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {orders.data.map((order) => (
                                <tr key={order.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.title}</p>
                                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                            #{String(order.id).padStart(4, '0')} · {order.user?.name} ({order.user?.email})
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.service?.title ?? '—'}</td>
                                    <td className="px-6 py-4 font-mono text-sm font-semibold whitespace-nowrap text-slate-900 dark:text-white">{formatIDR(order.budget)}</td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDate(order.deadline)}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => setStatus(order, e.target.value)}
                                            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium capitalize text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-white dark:focus:ring-white/10"
                                        >
                                            {statuses.map((s) => (
                                                <option key={s} value={s}>
                                                    {s.replace('_', ' ')}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.invoices && order.invoices.length > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 ring-inset dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                                                <FileText className="size-3.5" />
                                                Invoiced ({order.invoices.length})
                                            </span>
                                        ) : (
                                            <Button size="sm" variant="secondary" onClick={() => generateInvoice(order)}>
                                                Generate invoice
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Page {orders.current_page} of {orders.last_page} · {orders.total} orders
                        </p>
                        <div className="flex gap-1.5">
                            {orders.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveState
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                            link.active
                                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : null,
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </AdminLayout>
    );
}
