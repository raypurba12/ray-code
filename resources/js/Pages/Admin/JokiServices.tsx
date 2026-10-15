import type { PageProps } from '@/types';
import { R } from '@/lib/routes';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Badge, Button, Card, Input, Select, Textarea } from '@/Components/ui';
import { Modal } from '@/Components/Modal';
import { Reveal } from '@/Components/Reveal';
import { router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Blocks, Pencil, Plus, Search, Trash2, Layers, Sparkles } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useConfirm } from '@/Components/useConfirm';

interface JokiServiceRow {
    id: number;
    slug: string;
    title: string;
    title_en: string | null;
    desc: string;
    desc_en: string | null;
    category: string;
    category_en: string | null;
    icon: string;
    logo: string | null;
    sort_order: number;
    is_active: boolean;
}

interface Props extends PageProps {
    services: JokiServiceRow[];
    categories: string[];
    filters: { category?: string | null; search?: string | null };
    stats: { total: number; active: number };
    header: { badge: string; badge_en: string; title: string; title_en: string; desc: string; desc_en: string };
}

const iconOptions = [
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'monitor-smartphone', label: 'Monitor Smartphone' },
    { value: 'code2', label: 'Code2' },
    { value: 'globe', label: 'Globe' },
    { value: 'layers', label: 'Layers' },
    { value: 'server', label: 'Server' },
    { value: 'database', label: 'Database' },
    { value: 'blocks', label: 'Blocks' },
    { value: 'brain-circuit', label: 'Brain Circuit' },
    { value: 'bar-chart3', label: 'Bar Chart' },
    { value: 'graduation-cap', label: 'Graduation Cap' },
    { value: 'file-text', label: 'File Text' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'calculator', label: 'Calculator' },
    { value: 'gamepad2', label: 'Gamepad' },
    { value: 'cpu', label: 'CPU' },
    { value: 'network', label: 'Network' },
    { value: 'shield', label: 'Shield' },
    { value: 'bug', label: 'Bug' },
];

const defaultCategories = [
    'Mobile Development',
    'Web Development',
    'Database & Backend',
    'DevOps & Deployment',
    'AI & Machine Learning',
    'Data Science',
    'Layanan Perkuliahan',
    'Game & Multimedia',
    'IoT & Hardware',
    'Networking',
    'Cybersecurity',
];

function JokiServicesInner({ services, categories, filters, stats, header }: Pick<Props, 'services' | 'categories' | 'filters' | 'stats' | 'header'>) {
    const { confirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<JokiServiceRow | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        slug: '',
        desc: '',
        category: 'Web Development',
        icon: 'code2',
        logo: '',
        sort_order: 0,
        is_active: true as boolean,
    });

    const headerForm = useForm({
        badge: header.badge ?? '',
        title: header.title ?? '',
        desc: header.desc ?? '',
    });

    const translate = async (text: string): Promise<string> => {
        if (!text.trim()) return text;
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`);
            const json = await res.json();
            return json.responseData?.translatedText || text;
        } catch {
            return text;
        }
    };

    const allCategories = useMemo(() => {
        const merged = Array.from(new Set([...defaultCategories, ...categories]));
        return merged.sort();
    }, [categories]);

    const openCreate = () => {
        setEditing(null);
        reset();
        setData({ title: '', slug: '', desc: '', category: 'Web Development', icon: 'code2', logo: '', sort_order: (services.length ? Math.max(...services.map((s) => s.sort_order)) + 1 : 1), is_active: true });
        setModalOpen(true);
    };

    const openEdit = (row: JokiServiceRow) => {
        setEditing(row);
        setData({
            title: row.title,
            slug: row.slug,
            desc: row.desc,
            category: row.category,
            icon: row.icon,
            logo: row.logo ?? '',
            sort_order: row.sort_order,
            is_active: !!row.is_active,
        });
        setModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            put(`/admin/joki-services/${editing.id}`, { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        } else {
            post('/admin/joki-services', { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        }
    };

    const destroy = async (row: JokiServiceRow) => {
        if (await confirm({
            title: `Hapus Layanan Joki`,
            description: `Hapus layanan "${row.title}"? Layanan ini tidak akan lagi tampil di daftar publik.`,
            variant: 'danger',
            confirmLabel: 'Ya, Hapus Layanan',
        })) {
            router.delete(`/admin/joki-services/${row.id}`, { preserveScroll: true });
        }
    };

    const applySearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/joki-services', { search: search || undefined, category: filters.category || undefined }, { preserveState: true });
    };

    const setCategoryFilter = (cat: string | null) => {
        router.get('/admin/joki-services', { category: cat || undefined, search: filters.search || undefined }, { preserveState: true });
    };

    return (
        <>
            <Card className="mb-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                            <Sparkles className="size-4 text-amber-500" /> Header Halaman
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">Isi 1× saja (Indonesia) — versi English otomatis terisi saat disimpan. Ganti bahasa di frontend via dropdown bendera.</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => router.post('/admin/joki-services/auto-translate', {}, { preserveScroll: true })}>
                        🌐 Translate semua yang kosong ke EN
                    </Button>
                </div>
                <div className="mt-4 grid gap-4">
                    <Input label="Badge" value={headerForm.data.badge} onChange={(e) => headerForm.setData('badge', e.target.value)} placeholder="DEADLINE MEPET? KAMI SIAP 24 JAM" />
                    <Input label="Judul" value={headerForm.data.title} onChange={(e) => headerForm.setData('title', e.target.value)} placeholder="Layanan Yang Diberikan Raycode!" />
                    <Textarea label="Deskripsi" rows={2} value={headerForm.data.desc} onChange={(e) => headerForm.setData('desc', e.target.value)} placeholder="Kami menyediakan jasa..." />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">EN akan otomatis ter-translate saat disimpan (bisa edit manual nanti jika perlu).</p>
                        <Button size="sm" disabled={headerForm.processing} onClick={() => headerForm.put('/admin/joki-services/header', { preserveScroll: true })}>
                            {headerForm.processing ? 'Menyimpan...' : 'Simpan Header'}
                        </Button>
                    </div>
                    {headerForm.recentlySuccessful && <p className="text-xs font-medium text-emerald-600">Header tersimpan — EN otomatis terisi ✓</p>}
                </div>
            </Card>

            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                <p className="font-bold">⚠️ Halaman deprecated — migrasi selesai 11 Sep 2026.</p>
                <p className="mt-1">59 layanan joki sudah disalin ke <code className="rounded bg-white px-1 py-0.5 dark:bg-black/20">services[type=joki]</code>. Kelola ke depan via <a href={R.adminServices} className="underline font-semibold">Paket Layanan</a> (filter type=joki). Halaman ini akan dihapus Sprint 3.</p>
            </div>

            <div className="mt-6 mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Badge tone="slate">{stats.total} total</Badge>
                    <Badge tone="green">{stats.active} aktif</Badge>
                    <Badge tone="blue">{allCategories.length} kategori</Badge>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="size-4" /> Tambah Layanan
                </Button>
            </div>

            <Card className="mb-6 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={applySearch} className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul atau deskripsi..." className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </form>
                    <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => setCategoryFilter(null)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${!filters.category ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>Semua</button>
                        {allCategories.map((cat) => (
                            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filters.category === cat ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{cat}</button>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.map((row, i) => (
                    <Reveal key={row.id} delay={Math.min(i * 20, 120)}>
                        <Card className={`flex h-full flex-col p-5 ${!row.is_active ? 'opacity-60' : ''}`}>
                            <div className="flex items-start justify-between gap-2">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                                    {row.logo ? <img src={row.logo} alt="" className="size-6 object-contain" loading="lazy" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} /> : <Blocks className="size-5 text-slate-400" />}
                                </span>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-mono text-[11px] font-medium text-slate-400">#{String(row.sort_order).padStart(2, '0')}</span>
                                    {!row.is_active && <Badge tone="slate">Nonaktif</Badge>}
                                </div>
                            </div>
                            <h3 className="mt-3 text-sm font-bold leading-tight text-slate-900 dark:text-white line-clamp-2">{row.title}</h3>
                            {row.title_en && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">🇬🇧 {row.title_en}</p>}
                            <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{row.desc}</p>
                            <div className="mt-3 flex items-center justify-between">
                                <Badge tone="blue" className="text-[11px]">{row.category}</Badge>
                                <span className="text-[11px] font-mono text-slate-400">{row.icon}</span>
                            </div>
                            {row.category_en && <p className="mt-1 text-[11px] text-slate-400">🇬🇧 {row.category_en}</p>}
                            <div className="mt-4 flex gap-2 border-t border-dashed border-slate-200 pt-4 dark:border-white/10">
                                <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(row)}><Pencil className="size-3.5" /> Edit</Button>
                                <Button size="sm" variant="danger" onClick={() => destroy(row)}><Trash2 className="size-3.5" /></Button>
                            </div>
                        </Card>
                    </Reveal>
                ))}
            </div>

            {services.length === 0 && (
                <Card className="mt-6 p-12 text-center">
                    <Layers className="mx-auto mb-3 size-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700 dark:text-white">Tidak ada layanan</p>
                    <p className="mt-1 text-xs text-slate-500">Coba ubah filter atau tambah layanan baru.</p>
                    <Button className="mt-4" onClick={openCreate}><Plus className="size-4" /> Tambah Layanan Pertama</Button>
                </Card>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit: ${editing.title}` : 'Tambah Layanan'} description="Cukup isi 1× (Indonesia) — English otomatis terisi saat disimpan. Ganti bahasa di frontend via dropdown bendera." wide>
                <form onSubmit={submit} className="space-y-5">
                    <Input label="Judul *" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} required autoFocus placeholder="Android Development" />
                    <Input label="Slug (auto jika kosong)" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} placeholder="joki-android" />
                    <Textarea label="Deskripsi singkat *" rows={2} value={data.desc} onChange={(e) => setData('desc', e.target.value)} error={errors.desc} required placeholder="Aplikasi Android dengan Java/Kotlin..." />
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Kategori *</label>
                        <input list="joki-categories" value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="Web Development" className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                        <datalist id="joki-categories">{allCategories.map((c) => <option key={c} value={c} />)}</datalist>
                        {errors.category && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.category}</p>}
                        <p className="mt-1 text-xs text-slate-400">EN otomatis terisi — kosongkan EN, sistem translate ID→EN saat simpan.</p>
                    </div>
                    <Select label="Icon (lucide)" value={data.icon} onChange={(e) => setData('icon', e.target.value)} error={errors.icon} required>
                        {iconOptions.map((o) => <option key={o.value} value={o.value}>{o.label} — {o.value}</option>)}
                    </Select>
                    <Input label="Logo URL (opsional, devicon CDN)" value={data.logo} onChange={(e) => setData('logo', e.target.value)} error={errors.logo} placeholder="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" />
                    <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
                        <Input label="Sort order" type="number" value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} error={errors.sort_order} />
                        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="size-4 rounded accent-slate-900" /> Aktif (tampilkan di /services)</label>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Layanan'}</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
export default function AdminJokiServices({ services, categories, filters, stats, header }: Props) {
    return (
        <AdminLayout title="Joki / Satuan (Deprecated)" description="⚠️ DEPRECATED — Data sudah dimigrasi ke Paket Layanan (services[type=joki]). Halaman ini read-only, kelola ke depan via Paket Layanan.">
            <JokiServicesInner services={services} categories={categories} filters={filters} stats={stats} header={header} />
        </AdminLayout>
    );
}
