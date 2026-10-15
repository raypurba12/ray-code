import type { PageProps, Project } from '@/types';
import { R } from '@/lib/routes';
import { formatDate, formatIDR } from '@/lib/utils';
import { ClientLayout } from '@/Components/layout/ClientLayout';
import { ButtonLink, Card, StatusPill, Button, Input, Textarea } from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import {
    CalendarDays,
    CircleCheck,
    ClipboardList,
    GitCommitHorizontal,
    ReceiptText,
    Wallet,
    Download,
    FileArchive,
    Star,
    Package,
} from 'lucide-react';
import { useState } from 'react';

interface Props extends PageProps {
    project: Project & {
        service?: { id: number; title: string; slug: string; icon: string } | null;
        updates?: { id: number; title: string; notes: string | null; created_at: string }[];
        invoices?: { id: number; number: string; total: number; status: 'unpaid' | 'paid' | 'cancelled'; due_date: string | null }[];
        files?: { id:number; file_name:string; size:number; version:number; created_at:string }[];
        order_code?: string;
    };
    canTestimonial: boolean;
    hasTestimonial: boolean;
}

const timeline = [
    { status: 'pending', label: 'Order received' },
    { status: 'in_review', label: 'Requirements review' },
    { status: 'in_progress', label: 'Development' },
    { status: 'review', label: 'Your review & feedback' },
    { status: 'completed', label: 'Delivered 🎉' },
];

export default function ProjectShow({ project, canTestimonial, hasTestimonial }: Props) {
    const currentIndex = Math.max(
        0,
        project.status === 'cancelled'
            ? 0
            : timeline.findIndex((t) => t.status === project.status),
    );

    const testiForm = useForm({ content: '', rating: 5 });
    const submitTesti = (e:React.FormEvent) => {
        e.preventDefault();
        testiForm.post(R.clientProjectTestimonial(project.id), { preserveScroll:true, onSuccess:()=> testiForm.reset() });
    };

    return (
        <ClientLayout title={project.title}>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold tracking-tight text-ink">{project.title}</h2>
                        <StatusPill status={project.status} />
                        {project.order_code && <span className="rounded-full bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold tracking-widest text-white dark:bg-white dark:text-slate-900">{project.order_code}</span>}
                    </div>
                    <p className="mt-1 text-sm text-ink-3">
                        {project.service?.title ?? 'Custom'} · ordered {formatDate(project.created_at)}
                        {project.deadline && <> · deadline <span className="font-medium text-ink-2">{formatDate(project.deadline)}</span></>}
                    </p>
                </div>
                <ButtonLink href={R.clientMessages} variant="secondary" size="sm">
                    <ClipboardList className="size-4" />
                    Ask about this project
                </ButtonLink>
            </div>

            {/* Progress */}
            <Card className="mt-6 p-6">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">Overall progress</span>
                    <span className="font-mono font-bold text-brand-600">{project.progress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-alt">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-[width] duration-1000 ease-out"
                        style={{ width: `${project.progress}%` }}
                    />
                </div>

                <ol className="mt-7 grid gap-3 sm:grid-cols-5">
                    {timeline.map((step, i) => {
                        const done = i <= currentIndex && project.status !== 'cancelled';
                        const active = i === currentIndex;
                        return (
                            <li key={step.status} className="flex items-center gap-2.5 sm:flex-col sm:text-center">
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-colors ${
                                        done ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-card text-ink-4'
                                    } ${active ? 'ring-4 ring-brand-100 dark:ring-brand-500/20' : ''}`}
                                >
                                    {done ? '✓' : i + 1}
                                </span>
                                <span className={`text-xs leading-snug ${done ? 'font-semibold text-ink' : 'text-ink-4'}`}>{step.label}</span>
                            </li>
                        );
                    })}
                </ol>
            </Card>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                {/* Requirements */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="flex items-center gap-2 font-semibold text-ink">
                            <ClipboardList className="size-4 text-brand-600" />
                            Your requirements
                        </h3>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{project.requirements}</p>

                        {project.budget > 0 && (
                            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-dashed border-line pt-5">
                                <div className="flex items-center gap-2.5">
                                    <Wallet className="size-4 text-ink-4" />
                                    <div>
                                        <dt className="text-[11px] tracking-wide text-ink-4 uppercase">Budget</dt>
                                        <dd className="font-mono text-sm font-semibold text-ink">{formatIDR(project.budget)}</dd>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <CalendarDays className="size-4 text-ink-4" />
                                    <div>
                                        <dt className="text-[11px] tracking-wide text-ink-4 uppercase">Deadline</dt>
                                        <dd className="text-sm font-semibold text-ink">{formatDate(project.deadline)}</dd>
                                    </div>
                                </div>
                            </dl>
                        )}
                    </Card>

                    {/* Deliverables FR-7 — client download */}
                    <Card className="p-6">
                        <h3 className="flex items-center gap-2 font-semibold text-ink">
                            <Package className="size-4 text-brand-600" /> Deliverables
                            {project.files && project.files.length>0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">{project.files.length} file</span>}
                        </h3>
                        {project.files && project.files.length>0 ? (
                            <div className="mt-4 space-y-3">
                                <ul className="space-y-2">
                                    {project.files.map(f=> (
                                        <li key={f.id} className="flex items-center justify-between rounded-xl border border-line bg-alt px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-ink">{f.file_name} <span className="font-mono text-xs font-bold text-brand-600">v{f.version}</span></p>
                                                <p className="font-mono text-xs text-ink-4">{(f.size/1024).toFixed(1)} KB · {formatDate(f.created_at)}</p>
                                            </div>
                                            <a href={R.clientProjectFileDownload(project.id, f.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                                                <Download className="size-3.5"/> Download
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                <a href={R.clientProjectFilesZip(project.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
                                    <FileArchive className="size-4"/> Download semua sebagai ZIP
                                </a>
                                <p className="text-center text-xs text-ink-4">Link download aman untuk akun kamu saja.</p>
                            </div>
                        ) : (
                            <p className="mt-4 rounded-xl bg-alt px-4 py-6 text-center text-sm text-ink-3">Belum ada deliverable — admin akan upload saat progress berjalan.</p>
                        )}
                    </Card>

                    {/* Updates feed */}
                    <Card className="p-6">
                        <h3 className="flex items-center gap-2 font-semibold text-ink">
                            <GitCommitHorizontal className="size-4 text-brand-600" />
                            Milestone updates
                        </h3>

                        {project.updates && project.updates.length > 0 ? (
                            <ol className="relative mt-5 space-y-6 border-l-2 border-line pl-6">
                                {project.updates.map((update) => (
                                    <li key={update.id} className="relative">
                                        <span className="absolute top-1 -left-[31px] flex size-4 items-center justify-center rounded-full border-2 border-brand-500 bg-card" />
                                        <p className="text-sm font-semibold text-ink">{update.title}</p>
                                        <time className="font-mono text-[11px] text-ink-4">{formatDate(update.created_at)}</time>
                                        {update.notes && <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{update.notes}</p>}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="mt-4 rounded-xl bg-alt px-4 py-6 text-center text-sm text-ink-3">
                                No updates yet — we'll post here as soon as development starts.
                            </p>
                        )}
                    </Card>

                    {/* Testimoni FR-8 */}
                    {project.status==='completed' && (
                        <Card className="p-6 border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/10">
                            <h3 className="flex items-center gap-2 font-semibold text-ink"><Star className="size-4 text-amber-500 fill-amber-500"/> {hasTestimonial ? 'Testimoni terkirim — terima kasih!' : canTestimonial ? 'Beri Testimoni' : 'Testimoni'}</h3>
                            {canTestimonial ? (
                                <form onSubmit={submitTesti} className="mt-4 space-y-3">
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(n=> (
                                            <button key={n} type="button" onClick={()=>testiForm.setData('rating', n)} className={`size-8 rounded-full border ${testiForm.data.rating>=n?'bg-amber-400 border-amber-500 text-white':'bg-white dark:bg-slate-800 border-line'}`}>{n}</button>
                                        ))}
                                        <span className="ml-2 text-sm font-semibold text-ink">{testiForm.data.rating}/5</span>
                                    </div>
                                    <Textarea label="Cerita pengalamanmu (min 20 karakter)" rows={4} value={testiForm.data.content} onChange={e=>testiForm.setData('content', e.target.value)} error={testiForm.errors.content} required />
                                    {testiForm.errors.rating && <p className="text-xs text-red-600">{testiForm.errors.rating}</p>}
                                    <Button type="submit" disabled={testiForm.processing}>{testiForm.processing ? 'Mengirim...' : 'Kirim Testimoni'}</Button>
                                    <p className="text-xs text-ink-4">Akan direview admin sebelum tampil di homepage.</p>
                                </form>
                            ) : hasTestimonial ? (
                                <p className="mt-2 text-sm text-ink-3">Testimoni kamu sedang direview. Terima kasih sudah berbagi!</p>
                            ) : null}
                        </Card>
                    )}
                </div>

                {/* Invoices sidebar */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="flex items-center gap-2 font-semibold text-ink">
                            <ReceiptText className="size-4 text-brand-600" />
                            Project invoices
                        </h3>
                        {project.invoices && project.invoices.length > 0 ? (
                            <ul className="mt-4 space-y-3">
                                {project.invoices.map((invoice) => (
                                    <li key={invoice.id}>
                                        <a
                                            href={R.clientInvoice(invoice.id)}
                                            className="group flex items-center justify-between rounded-xl border border-line p-4 transition-all hover:border-brand-300 hover:bg-brand-50/40 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
                                        >
                                            <div>
                                                <p className="font-mono text-xs font-semibold text-ink">{invoice.number}</p>
                                                <p className="text-xs text-ink-3">due {formatDate(invoice.due_date)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-sm font-bold text-ink">{formatIDR(invoice.total)}</p>
                                                <StatusPill status={invoice.status} />
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-4 flex items-center gap-2 rounded-xl bg-alt px-4 py-5 text-sm text-ink-3">
                                <CircleCheck className="size-4 shrink-0 text-emerald-500" />
                                No invoices generated for this project yet.
                            </p>
                        )}
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white">
                        <h3 className="font-semibold">Happy with the progress?</h3>
                        <p className="mt-1.5 text-sm text-slate-300">Refer a friend and both of you get 10% off your next order.</p>
                        <ButtonLink href={R.contact} variant="secondary" size="sm" className="mt-4 border-white/20 bg-white/10 text-white shadow-none backdrop-blur hover:border-white/40 hover:bg-white/20">
                            Get referral link
                        </ButtonLink>
                    </Card>
                </div>
            </div>
        </ClientLayout>
    );
}
