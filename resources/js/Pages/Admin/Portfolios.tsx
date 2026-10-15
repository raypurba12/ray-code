import type { PageProps, PortfolioItem } from '@/types';
import { R } from '@/lib/routes';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input, Textarea } from '@/Components/ui';
import { Modal } from '@/Components/Modal';
import { Reveal } from '@/Components/Reveal';
import { router } from '@inertiajs/react';
import { Image as ImageIcon, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useConfirm } from '@/Components/useConfirm';
import { getVideoKind, getYoutubeEmbedUrl, getVimeoEmbedUrl } from '@/lib/video';

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
    thumbnail_file: null as File | null,
    remove_thumbnail: false as boolean,
    video_url: '',
    video_file: null as File | null,
    remove_video: false as boolean,
    gallery_urls: '',
    gallery_files: [] as File[],
    description: '',
    tech_stack: '',
    live_url: '',
    is_featured: false as boolean,
};

export default function AdminPortfolios({ portfolios }: Props) {
    const { confirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<PortfolioRow | null>(null);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [thumbPreview, setThumbPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const { data, setData, post, put, processing, errors, reset, transform } = useForm(emptyForm);

    useEffect(() => {
        return () => {
            if (localPreview) URL.revokeObjectURL(localPreview);
            if (thumbPreview) URL.revokeObjectURL(thumbPreview);
            galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [localPreview, thumbPreview, galleryPreviews]);

    const openCreate = () => {
        setEditing(null);
        reset();
        if (localPreview) {
            URL.revokeObjectURL(localPreview);
            setLocalPreview(null);
        }
        if (thumbPreview) {
            URL.revokeObjectURL(thumbPreview);
            setThumbPreview(null);
        }
        galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
        setGalleryPreviews([]);
        setData({ ...emptyForm, year: new Date().getFullYear() } as typeof emptyForm);
        setModalOpen(true);
    };

    const openEdit = (item: PortfolioRow) => {
        setEditing(item);
        if (localPreview) {
            URL.revokeObjectURL(localPreview);
            setLocalPreview(null);
        }
        if (thumbPreview) {
            URL.revokeObjectURL(thumbPreview);
            setThumbPreview(null);
        }
        galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
        setGalleryPreviews([]);
        setData({
            title: item.title,
            category: item.category,
            client_name: item.client_name,
            year: item.year,
            thumbnail_url: item.thumbnail_url ?? '',
            thumbnail_file: null,
            remove_thumbnail: false,
            video_url: (item as unknown as { video_url?: string | null }).video_url ?? '',
            video_file: null,
            remove_video: false,
            gallery_urls: (item.gallery_urls ?? []).join('\n'),
            gallery_files: [],
            description: item.description,
            tech_stack: item.tech_stack.join(', '),
            live_url: item.live_url ?? '',
            is_featured: !!item.is_featured,
        });
        setModalOpen(true);
    };

    const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (localPreview) URL.revokeObjectURL(localPreview);
        if (file) {
            const url = URL.createObjectURL(file);
            setLocalPreview(url);
            setData('video_file', file);
            setData('remove_video', false);
        } else {
            setLocalPreview(null);
            setData('video_file', null);
        }
    };

    const clearLocalVideo = () => {
        if (localPreview) URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
        setData('video_file', null);
        // reset file input
        const el = document.getElementById('video_file_input') as HTMLInputElement | null;
        if (el) el.value = '';
    };

    const handleThumbFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (thumbPreview) URL.revokeObjectURL(thumbPreview);
        if (file) {
            const url = URL.createObjectURL(file);
            setThumbPreview(url);
            setData('thumbnail_file', file);
            setData('remove_thumbnail', false);
        } else {
            setThumbPreview(null);
            setData('thumbnail_file', null);
        }
    };

    const clearThumbFile = () => {
        if (thumbPreview) URL.revokeObjectURL(thumbPreview);
        setThumbPreview(null);
        setData('thumbnail_file', null);
        const el = document.getElementById('thumbnail_file_input') as HTMLInputElement | null;
        if (el) el.value = '';
    };

    const handleGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        // revoke old previews
        galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
        if (files.length === 0) {
            setGalleryPreviews([]);
            setData('gallery_files', []);
            return;
        }
        const urls = files.map((f) => URL.createObjectURL(f));
        setGalleryPreviews(urls);
        setData('gallery_files', files);
    };

    const clearGalleryFiles = () => {
        galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
        setGalleryPreviews([]);
        setData('gallery_files', []);
        const el = document.getElementById('gallery_files_input') as HTMLInputElement | null;
        if (el) el.value = '';
    };

    const removeGalleryPreviewAt = (idx: number) => {
        const newFiles = [...(data.gallery_files as File[])];
        newFiles.splice(idx, 1);
        URL.revokeObjectURL(galleryPreviews[idx]);
        const newPreviews = galleryPreviews.filter((_, i) => i !== idx);
        setGalleryPreviews(newPreviews);
        setData('gallery_files', newFiles);
        // keep input in sync - if no files left clear input
        if (newFiles.length === 0) {
            const el = document.getElementById('gallery_files_input') as HTMLInputElement | null;
            if (el) el.value = '';
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // pakai transform yang benar — terima data param biar tidak stale
        transform((current) => ({
            title: current.title,
            category: current.category,
            client_name: current.client_name,
            year: current.year,
            thumbnail_url: current.thumbnail_url || null,
            thumbnail_file: (current as unknown as { thumbnail_file: File | null }).thumbnail_file ?? undefined,
            remove_thumbnail: (current as unknown as { remove_thumbnail: boolean }).remove_thumbnail,
            video_url: current.video_url || null,
            video_file: current.video_file ?? undefined,
            remove_video: current.remove_video,
            gallery_urls: current.gallery_urls
                .split('\n')
                .map((u) => u.trim())
                .filter(Boolean),
            gallery_files: (current as unknown as { gallery_files: File[] }).gallery_files?.length ? (current as unknown as { gallery_files: File[] }).gallery_files : undefined,
            description: current.description,
            tech_stack: current.tech_stack
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            live_url: current.live_url || null,
            is_featured: current.is_featured,
        }));

        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                if (localPreview) {
                    URL.revokeObjectURL(localPreview);
                    setLocalPreview(null);
                }
                if (thumbPreview) {
                    URL.revokeObjectURL(thumbPreview);
                    setThumbPreview(null);
                }
                galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
                setGalleryPreviews([]);
                setModalOpen(false);
            },
            onError: (errs: Record<string, string>) => {
                console.error('Portfolio save errors', errs);
            },
        } as unknown as Record<string, unknown>;

        // Inertia otomatis pakai FormData kalau ada File — tidak perlu forceFormData
        if (editing) {
            put(R.adminPortfoliosUpdate(editing.id), opts as never);
        } else {
            post(R.adminPortfoliosStore, opts as never);
        }
    };

    const destroy = async (item: PortfolioRow) => {
        if (await confirm({
            title: `Hapus Studi Kasus Portofolio`,
            description: `Hapus studi kasus "${item.title}"? Item ini tidak akan lagi tampil di halaman showcase portofolio.`,
            variant: 'danger',
            confirmLabel: 'Ya, Hapus Portofolio',
        })) {
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
                                {(item as unknown as { video_url?: string }).video_url && (
                                    <span className="absolute bottom-3 left-3 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold tracking-widest text-white shadow-sm">
                                        ▶ VIDEO
                                    </span>
                                )}
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

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit: ${editing.title}` : 'New case study'} description="Thumbnail & gallery use image URLs. Video URL mendukung YouTube, Vimeo, atau file lokal — akan auto-play muted di halaman portfolio. (build v4)" wide>
                <form onSubmit={submit} className="space-y-5">
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                            <p className="font-semibold">Gagal simpan — cek error:</p>
                            <ul className="mt-1 list-disc pl-4">
                                {Object.entries(errors).map(([k, v]) => (
                                    <li key={k}>
                                        {k}: {String(v)}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2 text-[11px] opacity-70">Buka DevTools (F12) → Network → klik request → Preview untuk detail.</p>
                        </div>
                    )}
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
                    <Input label="Tech stack (comma separated)" placeholder="Laravel, React, MySQL" value={data.tech_stack} onChange={(e) => setData('tech_stack', e.target.value)} error={errors.tech_stack} required />

                    <div className="rounded-xl border border-line bg-alt p-4 space-y-5">
                        <div>
                            <p className="text-sm font-semibold text-ink">Foto Thumbnail & Galeri</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Upload file lokal (jpeg/png/webp, max 10MB) ATAU tempel URL. File lokal akan disimpan di storage dan prioritas dibanding URL.</p>
                        </div>

                        {/* Thumbnail */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-ink-2">Thumbnail — upload file lokal</label>
                            <div className="flex flex-wrap items-center gap-3">
                                <label htmlFor="thumbnail_file_input" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-ink hover:bg-alt">
                                    <ImageIcon className="size-4" />
                                    {data.thumbnail_file ? 'Ganti foto' : 'Pilih foto'}
                                </label>
                                <input id="thumbnail_file_input" type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.gif" onChange={handleThumbFile} className="hidden" />
                                {data.thumbnail_file && <span className="text-xs text-ink-2">{data.thumbnail_file.name} ({(data.thumbnail_file.size / 1024 / 1024).toFixed(2)} MB)</span>}
                                {data.thumbnail_file && (
                                    <button type="button" onClick={clearThumbFile} className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-600">
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            {(errors as unknown as { thumbnail_file?: string }).thumbnail_file && <p className="text-xs text-red-600">{(errors as unknown as { thumbnail_file?: string }).thumbnail_file}</p>}
                            {thumbPreview ? (
                                <div className="overflow-hidden rounded-xl border border-line bg-card">
                                    <img src={thumbPreview} alt="Preview thumbnail" className="h-36 w-full object-cover sm:h-44" />
                                    <p className="bg-black/5 px-3 py-1 text-center text-[11px] text-ink-3">Preview file lokal — akan tersimpan setelah Save</p>
                                </div>
                            ) : data.thumbnail_url ? (
                                <div className="overflow-hidden rounded-xl border border-line bg-card">
                                    <img src={data.thumbnail_url} alt="Current thumbnail" className="h-36 w-full object-cover sm:h-44" onError={(e) => ((e.target as HTMLImageElement).style.display='none')} />
                                    <p className="bg-black/5 px-3 py-1 text-center text-[11px] text-ink-3 truncate">URL saat ini: {data.thumbnail_url}</p>
                                </div>
                            ) : editing?.thumbnail_url ? (
                                <div className="overflow-hidden rounded-xl border border-line bg-card">
                                    <img src={editing.thumbnail_url} alt="Existing thumbnail" className="h-36 w-full object-cover sm:h-44" onError={(e) => ((e.target as HTMLImageElement).style.display='none')} />
                                    <p className="bg-black/5 px-3 py-1 text-center text-[11px] text-ink-3">Thumbnail saat ini (storage / URL)</p>
                                </div>
                            ) : null}
                            <Input label="Atau tempel Thumbnail URL (optional)" type="text" placeholder="https://cdn.com/image.jpg atau /storage/..." value={data.thumbnail_url} onChange={(e) => setData('thumbnail_url', e.target.value)} error={errors.thumbnail_url} />
                            <p className="text-xs text-slate-500 dark:text-slate-400">Jika upload file & URL diisi bersamaan, <b>file lokal yang dipakai</b>.</p>
                            {editing?.thumbnail_url && (
                                <label className="flex items-center gap-2 text-xs font-medium text-red-600 select-none">
                                    <input type="checkbox" checked={(data as unknown as { remove_thumbnail: boolean }).remove_thumbnail} onChange={(e) => setData('remove_thumbnail', e.target.checked)} className="size-4 rounded border-slate-300 text-red-600" />
                                    Hapus thumbnail saat disimpan
                                </label>
                            )}
                        </div>

                        <div className="h-px bg-line" />

                        {/* Gallery */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-ink-2">Galeri — upload multiple foto (optional)</label>
                            <div className="flex flex-wrap items-center gap-3">
                                <label htmlFor="gallery_files_input" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-ink hover:bg-alt">
                                    <Upload className="size-4" />
                                    {galleryPreviews.length ? `Tambah lagi (${galleryPreviews.length} terpilih)` : 'Pilih foto-foto'}
                                </label>
                                <input id="gallery_files_input" type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.gif" multiple onChange={handleGalleryFiles} className="hidden" />
                                {galleryPreviews.length > 0 && <span className="text-xs text-ink-2">{galleryPreviews.length} file baru</span>}
                                {galleryPreviews.length > 0 && (
                                    <button type="button" onClick={clearGalleryFiles} className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-600">
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            {(errors as unknown as { gallery_files?: string }).gallery_files && <p className="text-xs text-red-600">{(errors as unknown as { gallery_files?: string }).gallery_files}</p>}
                            {galleryPreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {galleryPreviews.map((src, i) => (
                                        <div key={src} className="group relative overflow-hidden rounded-lg border border-line bg-card">
                                            <img src={src} alt={`Preview ${i+1}`} className="h-24 w-full object-cover" />
                                            <button type="button" onClick={() => removeGalleryPreviewAt(i)} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100">
                                                <X className="size-3" />
                                            </button>
                                            <p className="truncate bg-black/5 px-1 py-0.5 text-center text-[10px] text-ink-3">{(data.gallery_files as File[])[i]?.name.slice(0,18)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {editing?.gallery_urls && editing.gallery_urls.length > 0 && (
                                <div className="space-y-1">
                                    <p className="text-[11px] font-medium text-ink-3">Foto galeri saat ini ({editing.gallery_urls.length}):</p>
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                        {editing.gallery_urls.map((url) => (
                                            <div key={url} className="overflow-hidden rounded-lg border border-line bg-card">
                                                <img src={url} alt="Existing gallery" className="h-24 w-full object-cover" loading="lazy" onError={(e) => ((e.target as HTMLImageElement).style.display='none')} />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-500">Hapus baris URL di bawah untuk menghapus foto terkait dari galeri (file storage akan ikut terhapus saat Save).</p>
                                </div>
                            )}
                            <Textarea label="Atau tempel Gallery URLs eksternal (one per line, optional)" rows={2} value={data.gallery_urls} onChange={(e) => setData('gallery_urls', e.target.value)} placeholder="https://cdn.com/img1.jpg" />
                            <p className="text-[11px] text-slate-500 -mt-3">Gabungan: file upload di atas + baris URL ini akan jadi galeri. File baru otomatis ditambah, hapus baris untuk hapus foto lama.</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-line bg-alt p-4 space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-ink">Video Demo (otomatis play)</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Upload file lokal ATAU tempel URL YouTube/Vimeo/mp4. File lokal akan disimpan di storage dan auto-play muted + loop.</p>
                        </div>

                        {/* Upload file lokal */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-ink-2">Upload file lokal (mp4 / webm / ogg / mov, max 40MB — php limit)</label>
                            <div className="flex items-center gap-3">
                                <label htmlFor="video_file_input" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-ink hover:bg-alt">
                                    <Upload className="size-4" />
                                    {data.video_file ? 'Ganti file' : 'Pilih file'}
                                </label>
                                <input id="video_file_input" type="file" accept="video/*,.mp4,.webm,.ogg,.mov,.qt,.m4v,.avi,.mkv" onChange={handleVideoFile} className="hidden" />
                                {data.video_file && <span className="text-xs text-ink-2">{data.video_file.name} ({(data.video_file.size / 1024 / 1024).toFixed(2)} MB)</span>}
                                {data.video_file && (
                                    <button type="button" onClick={clearLocalVideo} className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-600">
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            {(errors as unknown as { video_file?: string }).video_file && <p className="text-xs text-red-600">{(errors as unknown as { video_file?: string }).video_file}</p>}
                            {editing && (editing as unknown as { video_url?: string }).video_url?.startsWith('/storage/') && !localPreview && !data.video_file && (
                                <p className="text-xs text-emerald-600">File saat ini: {(editing as unknown as { video_url: string }).video_url} — upload file baru untuk mengganti.</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-line" />
                            <span className="text-xs font-mono text-ink-4">ATAU</span>
                            <div className="h-px flex-1 bg-line" />
                        </div>

                        <Input
                            label="Tempel URL YouTube / Vimeo / mp4"
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=... atau https://cdn.com/demo.mp4"
                            value={data.video_url}
                            onChange={(e) => {
                                setData('video_url', e.target.value);
                                if (e.target.value && data.video_file) {
                                    // if user types URL, keep file but warn; file takes priority
                                }
                            }}
                            error={(errors as unknown as { video_url?: string }).video_url}
                        />
                        <p className=" -mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Kosongkan jika tidak ada video. Jika upload file & URL diisi bersamaan, <b>file lokal yang dipakai</b>.
                        </p>

                        {/* Preview area */}
                        {localPreview ? (
                            <div className="rounded-xl border border-line bg-black p-3">
                                <p className="mb-2 text-xs font-semibold text-white/80">Preview file lokal (akan auto-play setelah disimpan):</p>
                                <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
                                    <div className="aspect-video">
                                        <video src={localPreview} controls muted playsInline className="size-full object-contain" />
                                    </div>
                                </div>
                            </div>
                        ) : data.video_url ? (
                            <div className="rounded-xl border border-line bg-black p-3">
                                <p className="mb-2 text-xs font-semibold text-white/80">Preview URL:</p>
                                <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
                                    <div className="aspect-video">
                                        <PreviewVideo url={data.video_url} />
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {editing && (editing as unknown as { video_url?: string }).video_url && (
                            <label className="flex items-center gap-2 text-xs font-medium text-red-600 select-none">
                                <input type="checkbox" checked={data.remove_video} onChange={(e) => setData('remove_video', e.target.checked)} className="size-4 rounded border-slate-300 text-red-600" />
                                Hapus video saat disimpan (kosongkan video)
                            </label>
                        )}
                    </div>
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

function PreviewVideo({ url }: { url: string }) {
    const kind = getVideoKind(url);
    if (kind === 'youtube') {
        const embed = getYoutubeEmbedUrl(url, { autoplay: false, mute: true, loop: false, controls: true });
        if (!embed) return <div className="flex h-full items-center justify-center p-4 text-xs text-white/60">URL YouTube tidak valid</div>;
        return <iframe src={embed} title="Preview" className="size-full" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />;
    }
    if (kind === 'vimeo') {
        const embed = getVimeoEmbedUrl(url, { autoplay: false, mute: true, loop: false, controls: true });
        if (!embed) return <div className="flex h-full items-center justify-center p-4 text-xs text-white/60">URL Vimeo tidak valid</div>;
        return <iframe src={embed} title="Preview" className="size-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />;
    }
    if (kind === 'mp4') {
        return <video src={url} controls muted playsInline className="size-full object-contain" />;
    }
    return <div className="flex h-full items-center justify-center p-4 text-center text-xs text-white/60">URL tidak dikenali — gunakan YouTube, Vimeo, atau link .mp4/.webm</div>;
}
