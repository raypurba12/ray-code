import type { PageProps, Project } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatDate, formatIDR } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input, StatusPill, Textarea } from '@/Components/ui';
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Filter } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface Props extends PageProps {
    projects: {
        data: (Project & {
            user?: Pick<import('@/types').User, 'id' | 'name' | 'email'>;
            service?: Pick<import('@/types').Service, 'id' | 'title'> | null;
            updates?: { id: number; title: string; created_at: string }[];
        })[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { status: string | null };
}

const statuses = ['pending', 'in_review', 'in_progress', 'review', 'completed', 'cancelled'] as const;

export default function AdminProjects({ projects, filters }: Props) {
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <AdminLayout title="Proyek" description="Update progres dan milestone">
            <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                    <Filter className="size-3.5" />
                    Status:
                </span>
                <button
                    onClick={() => router.get(R.adminProjects, {}, { preserveState: true })}
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
                        onClick={() => router.get(R.adminProjects, { status }, { preserveState: true })}
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

            <div className="space-y-3">
                {projects.data.map((project) => (
                    <ProjectRow
                        key={project.id}
                        project={project}
                        expanded={expanded === project.id}
                        onToggle={() => setExpanded(expanded === project.id ? null : project.id)}
                    />
                ))}
                {projects.data.length === 0 && (
                    <Card className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">No projects found.</Card>
                )}
            </div>

            {projects.last_page > 1 && (
                <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    Page {projects.current_page} of {projects.last_page}
                </p>
            )}
        </AdminLayout>
    );
}

function ProjectRow({
    project,
    expanded,
    onToggle,
}: {
    project: Project & { user?: { name: string; email: string }; service?: { title: string } | null; updates?: { id: number; title: string }[] };
    expanded: boolean;
    onToggle: () => void;
}) {
    const { data, setData, patch, processing } = useForm({
        progress: project.progress,
        budget: project.budget,
        update_title: '',
        update_notes: '',
    });

    const save = (e: React.FormEvent) => {
        e.preventDefault();
        patch(R.adminProjectsUpdate(project.id), {
            preserveScroll: true,
            onSuccess: () => {
                setData('update_title', '');
                setData('update_notes', '');
            },
        });
    };

    return (
        <Card className="overflow-hidden p-0">
            {/* Header button */}
            <button
                onClick={onToggle}
                className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                aria-expanded={expanded}
            >
                <div className="min-w-[200px] flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{project.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        #{String(project.id).padStart(4, '0')} · {project.user?.name} · {project.service?.title ?? 'Custom'} · due {formatDate(project.deadline)}
                    </p>
                </div>
                <div className="hidden w-36 sm:block">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <span>Progress</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{project.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-slate-900 dark:bg-white" style={{ width: `${project.progress}%` }} />
                    </div>
                </div>
                <StatusPill status={project.status} />
                <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform duration-200', expanded && 'rotate-180')} />
            </button>

            {/* Expanded editor */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={save} className="border-t border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 sm:p-6">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="mb-2 flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Progress
                                            <span className="font-mono font-semibold text-slate-900 dark:text-white">{data.progress}%</span>
                                        </span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={data.progress}
                                            onChange={(e) => setData('progress', Number(e.target.value))}
                                            className="w-full accent-slate-900 dark:accent-white"
                                        />
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                            <div className="h-full bg-slate-900 dark:bg-white" style={{ width: `${data.progress}%` }} />
                                        </div>
                                    </label>
                                    <Input
                                        label="Budget (IDR)"
                                        type="number"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', Number(e.target.value))}
                                        error=""
                                    />
                                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                        <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Client requirements</p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{project.requirements || '—'}</p>
                                        <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">{formatIDR(project.budget)} · due {formatDate(project.deadline)}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Post a milestone update</p>
                                    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                                        <Input
                                            label="Update title"
                                            placeholder="e.g. Homepage deployed to staging"
                                            value={data.update_title}
                                            onChange={(e) => setData('update_title', e.target.value)}
                                        />
                                        <Textarea
                                            label="Notes (optional)"
                                            rows={3}
                                            placeholder="Details the client will see in their dashboard..."
                                            value={data.update_notes}
                                            onChange={(e) => setData('update_notes', e.target.value)}
                                        />
                                        {project.updates && project.updates.length > 0 && (
                                            <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                                {project.updates.slice(0, 3).map((u) => (
                                                    <li key={u.id} className="truncate">• {u.title}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" size="sm" disabled={processing} className="mt-5">
                                {processing ? 'Saving...' : 'Save changes'}
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
