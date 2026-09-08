import type { PageProps, Faq } from '@/types';
import { R } from '@/lib/routes';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input, Textarea, Select, Badge } from '@/Components/ui';
import { Modal } from '@/Components/Modal';
import { Reveal } from '@/Components/Reveal';
import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, HelpCircle, Filter } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface Props extends PageProps {
    faqs: (Faq & { id: number; category: string; sort_order: number; is_active: boolean })[];
    categories: string[];
    filters: { category?: string | null };
}

const emptyForm = {
    question: '',
    answer: '',
    category: 'Umum',
    sort_order: 0,
    is_active: true,
};

export default function AdminFaqs({ faqs, categories, filters }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<(Faq & { id: number }) | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const openCreate = () => {
        setEditing(null);
        reset();
        setData(emptyForm);
        setModalOpen(true);
    };
    const openEdit = (faq: any) => {
        setEditing(faq);
        setData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            sort_order: faq.sort_order ?? 0,
            is_active: !!faq.is_active,
        });
        setModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            put(R.adminFaqsUpdate(editing.id), { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        } else {
            post(R.adminFaqsStore, { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        }
    };

    const destroy = (faq: any) => {
        if (confirm(`Hapus FAQ "${faq.question}"?`)) {
            router.delete(R.adminFaqsDestroy(faq.id), { preserveScroll: true });
        }
    };

    const categoryOptions = ['Umum', 'Harga', 'Teknis', 'Dukungan', 'Tagihan', ...categories.filter((c) => !['Umum', 'Harga', 'Teknis', 'Dukungan', 'Tagihan'].includes(c))];

    return (
        <AdminLayout title="FAQ">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">FAQ</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola pertanyaan yang tampil di homepage (5 teratas) dan halaman /faq. Kategori dipakai untuk filter di halaman FAQ.</p>
                </div>
                <Button onClick={openCreate}><Plus className="size-4" /> Tambah FAQ</Button>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Filter className="size-3.5" /> Kategori:</span>
                <button onClick={() => router.get(R.adminFaqs, {}, { preserveState: true })} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${!filters.category ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10'}`}>Semua</button>
                {categoryOptions.slice(0, 8).map((cat) => (
                    <button key={cat} onClick={() => router.get(R.adminFaqs, { category: cat }, { preserveState: true })} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${filters.category === cat ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10'}`}>{cat}</button>
                ))}
            </div>

            <div className="space-y-3">
                {faqs.map((faq, i) => (
                    <Reveal key={faq.id} delay={Math.min(i * 40, 200)}>
                        <Card className={`p-5 ${!faq.is_active ? 'opacity-60' : ''}`}>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-[240px] flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20"><HelpCircle className="size-3.5" /></span>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{faq.question}</h3>
                                        <Badge tone={faq.is_active ? 'green' : 'slate'}>{faq.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                        <Badge tone="blue">{faq.category}</Badge>
                                        <span className="font-mono text-xs text-slate-400">#{(faq as any).sort_order}</span>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{faq.answer}</p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => openEdit(faq)}><Pencil className="size-3.5" /> Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => destroy(faq)}><Trash2 className="size-3.5" /></Button>
                                </div>
                            </div>
                        </Card>
                    </Reveal>
                ))}
                {faqs.length === 0 && (
                    <Card className="p-12 text-center"><p className="text-sm text-slate-500">Tidak ada FAQ untuk filter ini.</p></Card>
                )}
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit FAQ' : 'Tambah FAQ'} wide>
                <form onSubmit={submit} className="space-y-5">
                    <Input label="Pertanyaan" value={data.question} onChange={(e) => setData('question', e.target.value)} error={errors.question} required autoFocus />
                    <Textarea label="Jawaban" rows={4} value={data.answer} onChange={(e) => setData('answer', e.target.value)} error={errors.answer} required />
                    <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
                        <Input label="Kategori" value={data.category} onChange={(e) => setData('category', e.target.value)} list="faq-categories" error={errors.category} required />
                        <datalist id="faq-categories">{categoryOptions.map((c) => <option key={c} value={c} />)}</datalist>
                        <Input label="Sort order" type="number" value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} error={errors.sort_order} />
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="size-4 rounded accent-brand-600" /> Aktif (tampilkan di FAQ & homepage)</label>
                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah FAQ'}</Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
