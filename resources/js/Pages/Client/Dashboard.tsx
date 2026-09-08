import type { Invoice, PageProps, Project } from '@/types';
import { R } from '@/lib/routes';
import { formatDate, formatIDR } from '@/lib/utils';
import { ClientLayout } from '@/Components/layout/ClientLayout';
import { ButtonLink, Card, EmptyState, StatusPill } from '@/Components/ui';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    FolderKanban,
    Mail,
    Plus,
    ReceiptText,
    Rocket,
} from 'lucide-react';

interface Props extends PageProps {
    stats: { projects: number; activeProjects: number; completed: number; unpaidInvoices: number };
    recentProjects: (Project & { service?: { id: number; title: string; icon: string } | null })[];
    invoices: Invoice[];
}

export default function ClientDashboard({ stats, recentProjects, invoices }: Props) {
    const user = usePage<PageProps>().props.auth.user!;

    return (
        <ClientLayout title={`Welcome back, ${user.name.split(' ')[0]} 👋`}>
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={<FolderKanban className="size-5" />} label="Total projects" value={stats.projects} tone="blue" delay={0} />
                <StatCard icon={<Rocket className="size-5" />} label="Active now" value={stats.activeProjects} tone="violet" delay={60} />
                <StatCard icon={<CheckCircle2 className="size-5" />} label="Completed" value={stats.completed} tone="green" delay={120} />
                <StatCard
                    icon={<ReceiptText className="size-5" />}
                    label="Unpaid invoices"
                    value={stats.unpaidInvoices}
                    tone={stats.unpaidInvoices > 0 ? 'red' : 'slate'}
                    delay={180}
                />
            </div>

            {/* Quick actions */}
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <Card hover className="lg:col-span-2 overflow-hidden">
                    <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white">
                        <div className="bg-grid absolute inset-0 opacity-15" aria-hidden />
                        <div className="relative">
                            <h2 className="text-lg font-bold">Ready to start something new?</h2>
                            <p className="mt-1 text-sm text-brand-100">Place an order and get a fixed quote within 24 hours.</p>
                            <ButtonLink href={R.clientOrder} variant="secondary" size="sm" className="mt-4 border-white/20 bg-white text-brand-700 shadow-none hover:border-white">
                                <Plus className="size-4" />
                                New order
                            </ButtonLink>
                        </div>
                    </div>
                </Card>
                <Card hover className="flex flex-col justify-between p-6">
                    <div>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                            <Mail className="size-5" />
                        </span>
                        <h3 className="mt-3 font-bold text-ink">Need to talk?</h3>
                        <p className="mt-1 text-sm text-ink-3">Message the team directly — we reply fast.</p>
                    </div>
                    <ButtonLink href={R.clientMessages} variant="ghost" size="sm" className="mt-4 justify-start px-0 text-brand-600">
                        Open messages <ArrowRight className="size-4" />
                    </ButtonLink>
                </Card>
            </div>

            {/* Recent projects + invoices */}
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <section aria-label="Recent projects">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold text-ink">Recent projects</h2>
                    </div>

                    {recentProjects.length === 0 ? (
                        <EmptyState
                            icon={<FolderKanban className="size-5" />}
                            title="No projects yet"
                            description="Your orders will appear here once you place your first one."
                            action={<ButtonLink href={R.clientOrder}>Place first order</ButtonLink>}
                        />
                    ) : (
                        <div className="space-y-3">
                            {recentProjects.map((project, i) => (
                                <motion.a
                                    key={project.id}
                                    href={R.clientProject(project.id)}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.35 }}
                                    className="group block rounded-2xl border border-line bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-600/5 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] dark:hover:border-brand-500/40"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="truncate font-semibold text-ink group-hover:text-brand-700 dark:group-hover:text-brand-300">{project.title}</h3>
                                            <p className="mt-0.5 text-xs text-ink-3">
                                                {project.service?.title ?? 'Custom project'} · ordered {formatDate(project.created_at)}
                                            </p>
                                        </div>
                                        <StatusPill status={project.status} />
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center justify-between text-[11px] font-medium text-ink-4">
                                            <span>Progress</span>
                                            <span className="font-mono">{project.progress}%</span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-alt">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${project.progress}%` }}
                                                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.06 }}
                                                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                                            />
                                        </div>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    )}
                </section>

                <section aria-label="Recent invoices">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold text-ink">Invoices</h2>
                        <a href={R.clientInvoices} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                            View all →
                        </a>
                    </div>

                    {invoices.length === 0 ? (
                        <EmptyState icon={<ReceiptText className="size-5" />} title="No invoices yet" description="Invoices appear when a project kicks off." />
                    ) : (
                        <Card>
                            <ul className="divide-y divide-hairline">
                                {invoices.map((invoice) => (
                                    <li key={invoice.id}>
                                        <a href={R.clientInvoice(invoice.id)} className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-hover">
                                            <div className="min-w-0">
                                                <p className="font-mono text-xs font-semibold text-ink">{invoice.number}</p>
                                                <p className="mt-0.5 truncate text-xs text-ink-3">{formatIDR(invoice.total)} · due {formatDate(invoice.due_date)}</p>
                                            </div>
                                            <StatusPill status={invoice.status} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </section>
            </div>
        </ClientLayout>
    );
}

const tones = {
    blue: 'bg-brand-50 text-brand-600 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/25',
    green: 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
    violet: 'bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/25',
    red: 'bg-red-50 text-red-500 ring-red-100 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/25',
    slate: 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
};

function StatCard({ icon, label, value, tone, delay }: { icon: React.ReactNode; label: string; value: number; tone: keyof typeof tones; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="rounded-2xl border border-line bg-card p-5 shadow-[0_1px_3px_rgb(15_23_42/0.04)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.03)]"
        >
            <span className={`flex size-10 items-center justify-center rounded-xl ring-1 ring-inset ${tones[tone]}`}>{icon}</span>
            <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-ink">{value}</p>
            <p className="text-xs font-medium text-ink-3">{label}</p>
        </motion.div>
    );
}
