import type { PageProps, Testimonial } from '@/types';
import { R } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input, Stars, Textarea } from '@/Components/ui';
import { Modal } from '@/Components/Modal';
import { router } from '@inertiajs/react';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useConfirm } from '@/Components/useConfirm';

interface Props extends PageProps {
    testimonials: Testimonial[];
}

export default function AdminTestimonials({ testimonials }: Props) {
    const { confirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        role: '',
        company: '',
        content: '',
        rating: 5,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(R.adminTestimonialsStore, { preserveScroll: true, onSuccess: () => { reset(); setModalOpen(false); } });
    };

    const toggleApproved = (t: Testimonial) => {
        router.patch(R.adminTestimonialsUpdate(t.id), { toggle_approved: true }, { preserveScroll: true });
    };

    const destroy = async (t: Testimonial) => {
        if (await confirm({
            title: `Hapus Testimoni`,
            description: `Hapus testimoni dari "${t.name}" (${t.company})? Tindakan ini tidak dapat dibatalkan.`,
            variant: 'danger',
            confirmLabel: 'Ya, Hapus Testimoni',
        })) {
            router.delete(R.adminTestimonialsDestroy(t.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Testimoni" description="Kelola testimoni klien">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {testimonials.filter((t) => t.is_approved).length} tayang · {testimonials.length} total
                </p>
                <Button onClick={() => setModalOpen(true)}>
                    <Plus className="size-4" />
                    Tambah Testimoni
                </Button>
            </div>

            {testimonials.length === 0 ? (
                <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                        <Eye className="size-5" />
                    </span>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Belum ada testimoni</h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Tambahkan testimoni pertama dari klien.</p>
                    <Button onClick={() => setModalOpen(true)} className="mt-5">
                        <Plus className="size-4" /> Tambah Testimoni
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {testimonials.map((t) => (
                        <Card key={t.id} className={cn('flex h-full flex-col p-6', !t.is_approved && 'border-dashed opacity-80')}>
                            <div className="flex items-start justify-between gap-3">
                                <Stars rating={t.rating} />
                                <button
                                    onClick={() => toggleApproved(t)}
                                    className={cn(
                                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
                                        t.is_approved
                                            ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                                            : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
                                    )}
                                >
                                    {t.is_approved ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                                    {t.is_approved ? 'Tayang' : 'Tersembunyi'}
                                </button>
                            </div>
                            <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">"{t.content}"</p>
                            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t.role}, {t.company}
                                    </p>
                                </div>
                                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => destroy(t)} aria-label={`Hapus ${t.name}`}>
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Testimoni" description="Tambahkan testimoni klien untuk ditampilkan di website.">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input label="Nama klien" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required autoFocus placeholder="Nama lengkap" />
                        <Input label="Perusahaan" value={data.company} onChange={(e) => setData('company', e.target.value)} error={errors.company} required placeholder="PT Contoh" />
                    </div>
                    <Input label="Jabatan" placeholder="CEO, Product Lead..." value={data.role} onChange={(e) => setData('role', e.target.value)} error={errors.role} required />
                    <Textarea label="Kutipan" rows={4} value={data.content} onChange={(e) => setData('content', e.target.value)} error={errors.content} required placeholder="Tulis testimoni klien..." />
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Rating</span>
                        <select
                            value={data.rating}
                            onChange={(e) => setData('rating', Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-white dark:focus:ring-white/10"
                        >
                            {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>
                                    {'★'.repeat(n)} ({n})
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Publikasikan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
