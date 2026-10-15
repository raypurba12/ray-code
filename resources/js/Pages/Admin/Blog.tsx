import type { PageProps } from '@/types';
import { R } from '@/lib/routes';
import { formatDate } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Badge, Button, Card, Input, Textarea } from '@/Components/ui';
import { Modal } from '@/Components/Modal';
import { router } from '@inertiajs/react';
import { Copy, ExternalLink, Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useConfirm } from '@/Components/useConfirm';

interface PostRow {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    cover_url: string | null;
    category: string;
    tags: string[] | null;
    published_at: string | null;
    author?: { name: string } | null;
}

interface Props extends PageProps {
    posts: PostRow[];
}

export default function AdminBlog({ posts }: Props) {
    const { confirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<PostRow | null>(null);
    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Engineering',
        cover_url: '',
        tags: '',
        is_published: true,
    });

    const openCreate = () => {
        setEditing(null);
        reset();
        setData({ title: '', slug: '', excerpt: '', content: '', category: 'Engineering', cover_url: '', tags: '', is_published: true });
        setModalOpen(true);
    };

    const openEdit = (row: PostRow) => {
        setEditing(row);
        setData({
            title: row.title,
            slug: row.slug,
            excerpt: row.excerpt,
            content: row.content,
            category: row.category,
            cover_url: row.cover_url ?? '',
            tags: (row.tags ?? []).join(', '),
            is_published: !!row.published_at,
        });
        setModalOpen(true);
    };

    const clonePost = (row: PostRow) => {
        setEditing(null);
        reset();
        setData({
            title: `${row.title} (Salinan)`,
            slug: `${row.slug}-salinan`,
            excerpt: row.excerpt,
            content: row.content,
            category: row.category,
            cover_url: row.cover_url ?? '',
            tags: (row.tags ?? []).join(', '),
            is_published: false,
        });
        setModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform(() => ({
            ...data,
            cover_url: data.cover_url || undefined,
            slug: data.slug || undefined,
            tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }));

        if (editing) {
            put(R.adminBlogUpdate(editing.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    setEditing(null);
                },
            });
        } else {
            post(R.adminBlogStore, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setModalOpen(false);
                },
            });
        }
    };

    const destroy = async (post_: PostRow) => {
        if (await confirm({
            title: `Hapus Artikel Blog`,
            description: `Hapus artikel "${post_.title}"? Artikel ini tidak dapat dikembalikan dan tautan publiknya akan menjadi 404.`,
            variant: 'danger',
            confirmLabel: 'Ya, Hapus Artikel',
        })) {
            router.delete(R.adminBlogDestroy(post_.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Artikel" description="Kelola post blog — tambah, edit, hapus. Cover image tampil di /blog dan homepage.">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{posts.length} artikel · cover image optional</p>
                <Button onClick={openCreate}>
                    <Plus className="size-4" />
                    Tulis Artikel
                </Button>
            </div>

            {posts.length === 0 ? (
                <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                        <Newspaper className="size-5" />
                    </span>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Belum ada artikel</h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">Tulis artikel pertama untuk ditampilkan di blog dan homepage.</p>
                    <Button onClick={openCreate} className="mt-5">
                        <Plus className="size-4" /> Tulis Artikel
                    </Button>
                </Card>
            ) : (
                <div className="space-y-3">
                    {posts.map((post_) => (
                        <Card key={post_.id} className="flex flex-wrap items-center gap-4 p-5">
                            {post_.cover_url ? (
                                <img src={post_.cover_url} alt="" className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-white/10" loading="lazy" />
                            ) : (
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <Newspaper className="size-5" />
                                </span>
                            )}
                            <div className="min-w-[220px] flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{post_.title}</h3>
                                    <Badge tone="slate">{post_.category}</Badge>
                                    <span className="font-mono text-[11px] text-slate-400">/{post_.slug}</span>
                                </div>
                                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{post_.excerpt}</p>
                            </div>
                            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                                <p>{post_.author?.name ?? '—'}</p>
                                <p className="mt-0.5 font-mono text-[11px]">{formatDate(post_.published_at)}</p>
                            </div>
                            <div className="flex gap-1.5">
                                <Button size="sm" variant="secondary" onClick={() => openEdit(post_)}>
                                    <Pencil className="size-3.5" /> Edit
                                </Button>
                                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => destroy(post_)} aria-label={`Hapus ${post_.title}`}>
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit: ${editing.title}` : 'Tulis Artikel Baru'} description={editing ? 'Perbarui detail artikel. Kosongkan cover untuk hapus gambar.' : 'Isi detail artikel yang akan dipublikasikan di blog.'} wide>
                <form onSubmit={submit} className="space-y-5">
                    <Input label="Judul" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} required autoFocus placeholder="Judul artikel" />
                    <Input label="Slug (auto jika kosong)" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} placeholder="judul-artikel" />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input label="Kategori" value={data.category} onChange={(e) => setData('category', e.target.value)} error={errors.category} required />
                        <Input label="URL Cover (opsional)" type="url" value={data.cover_url} onChange={(e) => setData('cover_url', e.target.value)} error={errors.cover_url as string} placeholder="https://.../cover.jpg" />
                    </div>
                    {data.cover_url && (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-800">
                            <img src={data.cover_url} alt="Preview cover" className="h-48 w-full object-cover" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
                        </div>
                    )}
                    <Input label="Tag (pisahkan dengan koma)" placeholder="laravel, performance" value={data.tags} onChange={(e) => setData('tags', e.target.value)} error={errors.tags as string} />
                    <Textarea label="Ringkasan" rows={2} value={data.excerpt} onChange={(e) => setData('excerpt', e.target.value)} error={errors.excerpt} required placeholder="Ringkasan singkat artikel" />
                    <Textarea label="Konten" rows={9} value={data.content} onChange={(e) => setData('content', e.target.value)} error={errors.content} required placeholder="Tulis konten artikel di sini..." />
                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
