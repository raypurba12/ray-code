import type { PageProps, Project } from '@/types';
import { R } from '@/lib/routes';
import { formatDate, formatIDRShort } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Card, StatusPill } from '@/Components/ui';
import { AlertCircle, ArrowRight, FolderKanban, Rocket, TrendingUp, Users, Wallet } from 'lucide-react';

interface Props extends PageProps {
    stats: {
        revenue: number;
        pendingRevenue: number;
        projects: number;
        activeProjects: number;
        clients: number;
        unreadContacts: number;
    };
    recentOrders: (Project & { user?: { id: number; name: string }; service?: { id: number; title: string } | null })[];
    monthlyRevenue: { month: string; total: number }[];
}

export default function AdminDashboard({ stats, recentOrders, monthlyRevenue }: Props) {
    const maxRevenue = Math.max(...monthlyRevenue.map((r) => r.total), 1);

    return (
        <AdminLayout title="Dashboard" description="Ringkasan performa studio">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard icon={<Wallet className="size-5" />} label="Paid revenue" value={formatIDRShort(stats.revenue)} sub="lifetime confirmed payments" />
                <StatCard icon={<TrendingUp className="size-5" />} label="Pending payments" value={formatIDRShort(stats.pendingRevenue)} sub="awaiting client transfer" />
                <StatCard icon={<Rocket className="size-5" />} label="Active projects" value={String(stats.activeProjects)} sub={`of ${stats.projects} total`} />
                <StatCard icon={<Users className="size-5" />} label="Clients" value={String(stats.clients)} sub="registered accounts" />
                <StatCard icon={<FolderKanban className="size-5" />} label="All-time orders" value={String(stats.projects)} sub="every project placed" />
                <StatCard icon={<AlertCircle className="size-5" />} label="Unread contacts" value={String(stats.unreadContacts)} sub={stats.unreadContacts > 0 ? 'needs triage today' : 'inbox zero'} />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                {/* Revenue chart */}
                <Card className="p-6">
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Pendapatan tahun ini</h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pembayaran invoice terkonfirmasi per bulan</p>
                    </div>

                    {monthlyRevenue.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada pembayaran — grafik akan tampil di sini.</p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">No paid invoices yet</p>
                        </div>
                    ) : (
                        <div className="flex h-52 items-end gap-2 sm:gap-3">
                            {monthlyRevenue.map((row) => {
                                const height = Math.max((row.total / maxRevenue) * 100, 6);
                                return (
                                    <div key={row.month} className="group flex flex-1 flex-col items-center gap-2">
                                        <span className="whitespace-nowrap text-[10px] font-medium text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-400">
                                            {formatIDRShort(row.total)}
                                        </span>
                                        <div
                                            style={{ height: `${height}%` }}
                                            className="w-full max-w-9 rounded-t-md bg-slate-900 transition-colors group-hover:bg-slate-800 dark:bg-white dark:group-hover:bg-slate-100"
                                        />
                                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{row.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* Latest orders */}
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Pesanan terbaru</h2>
                        <a href={R.adminOrders} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                            Lihat semua <ArrowRight className="size-3.5" />
                        </a>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                            Belum ada pesanan.
                        </p>
                    ) : (
                        <ul className="mt-5 space-y-2.5">
                            {recentOrders.map((order) => (
                                <li key={order.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{order.title}</p>
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                            {order.user?.name} · {order.service?.title ?? 'Custom'} · {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <StatusPill status={order.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">{label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{icon}</span>
            </div>
        </Card>
    );
}
