import type { PageProps, PortfolioItem } from '@/types';
import { R } from '@/lib/routes';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input, Textarea } from '@/Components/ui';
import { Modal } from '@/Components/Modal';
import { Reveal } from '@/Components/Reveal';
import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

type PortfolioRow = Omit<PortfolioItem, 'description' | 'tech_stack'> & {
    description: string;
    tech_stack: string[];
};

interface Props extends PageProps {
    portfolios: PortfolioRow[];
}

const emptyForm = {
    title: '',
    category: 'Website',
    client_name: '',
    year: new Date().getFullYear(),
    thumbnail_url: '',
    gallery_urls: '',
    description: '',
    tech_stack: '',
    live_url: '',
    is_featured: false as boolean,
};

export default function AdminPortfolios({ portfolios }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<PortfolioRow | null>(null);
    const { data, setData, post, put, processing, errors, reset, transform } = useForm(emptyForm);

    const openCreate = () => {
        setEditing(null);
        reset();
        setModalOpen(true);
    };

    const openEdit = (item: PortfolioRow) => {
        setEditing(item);
        setData({
            title: item.title,
            category: item.category,
            client_name: item.client_name,
            year: item.year,
            thumbnail_url: item.thumbnail_url ?? '',
            gallery_urls: (item.gallery_urls ?? []).join('\n'),
            description: item.description,
            tech_stack: item.tech_stack.join(', '),
            live_url: item.live_url ?? '',
            is_featured: !!item.is_featured,
        });
        setModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform(() => ({
            ...data,
            thumbnail_url: data.thumbnail_url || undefined,
            live_url: data.live_url || undefined,
            gallery_urls: data.gallery_urls
                .split('\n')
                .map((u) => u.trim())
                .filter(Boolean),
            tech_stack: data.tech_stack
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        }));

        if (editing) {
            put(R.adminPortfoliosUpdate(editing.id), { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        } else {
            post(R.adminPortfoliosStore, { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        }
    };

    const destroy = (item: PortfolioRow) => {
        if (confirm(`Delete case study "${item.title}"?`)) {
            router.delete(R.adminPortfoliosDestroy(item.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Portofolio" description="Kelola studi kasus yang tampil di homepage">
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">{portfolios.length} studi kasus terpublikasi</p>
                <Button size="sm" onClick={openCreate}>
                    <Plus className="size-4" />
                    Tambah studi kasus
                </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {portfolios.map((item, i) => (
                    <Reveal key={item.id} delay={(i % 3) * 70}>
                        <Card className="flex h-full flex-col overflow-hidden">
                            <div className="relative h-36 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                {item.thumbnail_url ? (
                                    <img src={item.thumbnail_url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700" />
                                )}
                                <span className="absolute top-3 left-3 rounded-md bg-white px-2 py-1 text-[11px] font-medium tracking-wide text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                                    {item.category}
                                </span>
                                {item.is_featured && (
                                    <span className="absolute top-3 right-3 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-bold tracking-widest text-white shadow-sm dark:bg-white dark:text-slate-900">
                                        UNGGULAN
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {item.client_name} · {item.year}
                                </p>
                                <p className="mt-2.5 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{item.description}</p>
                                {item.tech_stack.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {item.tech_stack.slice(0, 3).map((tech) => (
                                            <span key={tech} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                {tech}
                                            </span>
                                        ))}
                                        {item.tech_stack.length > 3 && (
                                            <span className="px-1 py-0.5 text-[10px] text-slate-400">+{item.tech_stack.length - 3}</span>
                                        )}
                                    </div>
                                )}
                                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(item)}>
                                        <Pencil className="size-3.5" />
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => destroy(item)} aria-label={`Delete ${item.title}`}>
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Reveal>
                ))}
            </div>

            {portfolios.length === 0 && (
                <Card className="mt-6 p-12 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada studi kasus. Tambah studi kasus pertama untuk tampil di homepage.</p>
                </Card>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit: ${editing.title}` : 'New case study'} description="Thumbnail & gallery use image URLs (CDN or storage)." wide>
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-[1fr_150px_110px]">
                        <Input label="Title" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} required autoFocus />
                        <Input label="Category" value={data.category} onChange={(e) => setData('category', e.target.value)} error={errors.category} required />
                        <Input label="Year" type="number" value={data.year} onChange={(e) => setData('year', Number(e.target.value))} error={errors.year} required />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input label="Client name" value={data.client_name} onChange={(e) => setData('client_name', e.target.value)} error={errors.client_name} required />
                        <Input label="Live URL (optional)" type="url" placeholder="https://..." value={data.live_url} onChange={(e) => setData('live_url', e.target.value)} error={errors.live_url} />
                    </div>
                    <Textarea label="Description (blank line between paragraphs)" rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} error={errors.description} required />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input label="Tech stack (comma separated)" placeholder="Laravel, React, MySQL" value={data.tech_stack} onChange={(e) => setData('tech_stack', e.target.value)} error={errors.tech_stack} required />
                        <Input label="Thumbnail URL (optional)" type="url" value={data.thumbnail_url} onChange={(e) => setData('thumbnail_url', e.target.value)} error={errors.thumbnail_url} />
                    </div>
                    <Textarea label="Gallery URLs (one per line, optional)" rows={2} value={data.gallery_urls} onChange={(e) => setData('gallery_urls', e.target.value)} />
                    <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                        <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} className="size-4 rounded border-slate-300 text-slate-900 accent-slate-900 dark:border-slate-600" />
                        Show in homepage featured section
                    </label>
                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : editing ? 'Save changes' : 'Publish case study'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
