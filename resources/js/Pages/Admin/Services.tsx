import type { PageProps, Service } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatIDR } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input, Select, Textarea } from '@/Components/ui';
import { Modal } from '@/Components/Modal';
import { Reveal } from '@/Components/Reveal';
import { Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Layers, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useConfirm } from '@/Components/useConfirm';

type ServiceRow = Omit<Service, 'description' | 'features'> & { description: string; features: string[]; type: 'package'|'joki'; category?: string | null; logo?: string | null };

interface Props extends PageProps {
    services: {
        data: ServiceRow[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { q?: string | null; type?: string | null };
    counts: { all:number; package:number; joki:number };
}

const emptyForm = {
    title: '',
    icon: 'globe',
    logo: '',
    short_desc: '',
    description: '',
    features: '',
    starting_price: 0,
    delivery_days: 14,
    is_featured: false as boolean,
    type: 'package' as 'package'|'joki',
    category: '',
};

function ServicesInner({ services, filters, counts }: Pick<Props, 'services' | 'filters' | 'counts'>) {
    const { confirm } = useConfirm();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ServiceRow | null>(null);
    const [q, setQ] = useState(filters.q ?? '');
    const [inlinePriceId, setInlinePriceId] = useState<number|null>(null);
    const [inlinePriceVal, setInlinePriceVal] = useState<number>(0);
    const [inlineSaving, setInlineSaving] = useState(false);
    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        ...emptyForm,
        features: '',
    });

    const openCreate = () => {
        setEditing(null);
        reset();
        setData({ ...emptyForm, type: (filters.type as any) || 'package' });
        setModalOpen(true);
    };

    const openEdit = (service: ServiceRow) => {
        setEditing(service);
        setData({
            title: service.title,
            icon: service.icon,
            logo: (service as any).logo ?? '',
            short_desc: service.short_desc,
            description: service.description,
            features: (service.features ?? []).join('\n'),
            starting_price: service.starting_price,
            delivery_days: service.delivery_days,
            is_featured: !!service.is_featured,
            type: service.type ?? 'package',
            category: (service as any).category ?? '',
        });
        setModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform(() => ({
            ...data,
            features: data.features
                .split('\n')
                .map((f) => f.trim())
                .filter(Boolean),
        }));

        if (editing) {
            put(R.adminServicesUpdate(editing.id), { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        } else {
            post(R.adminServicesStore, { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        }
    };

    const destroy = async (service: ServiceRow) => {
        if (await confirm({
            title: `Hapus Layanan`,
            description: `Hapus layanan "${service.title}"? Pesanan yang sudah ada sebelumnya tetap tersimpan di database.`,
            variant: 'danger',
            confirmLabel: 'Ya, Hapus Layanan',
        })) {
            router.delete(R.adminServicesDestroy(service.id), { preserveScroll: true });
        }
    };

    const setType = (type: string | null) => {
        router.get(R.adminServices, { q: q || undefined, type: type || undefined } as any, { preserveState: true });
    };
    const doSearch = () => router.get(R.adminServices, { q: q || undefined, type: filters.type || undefined } as any, { preserveState: true });

    const startInlinePrice = (s: ServiceRow) => {
        setInlinePriceId(s.id);
        setInlinePriceVal(s.starting_price);
    };
    const cancelInlinePrice = () => setInlinePriceId(null);
    const saveInlinePrice = (s: ServiceRow) => {
        setInlineSaving(true);
        router.put(R.adminServicesUpdate(s.id), {
            title: s.title,
            icon: s.icon,
            logo: (s as any).logo ?? '',
            short_desc: s.short_desc,
            description: s.description,
            features: s.features ?? [],
            starting_price: inlinePriceVal,
            delivery_days: s.delivery_days,
            is_featured: !!s.is_featured,
            type: s.type,
            category: (s as any).category ?? '',
        }, {
            preserveScroll: true,
            onFinish: () => { setInlineSaving(false); setInlinePriceId(null); },
        });
    };

    return (
        <>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5">
                    <Search className="size-3.5 text-slate-400" />
                    <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=> e.key==='Enter' && doSearch()} placeholder="Cari judul/slug..." className="bg-transparent text-sm outline-none placeholder:text-ink-4" />
                    <button onClick={doSearch} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">Cari</button>
                </div>
                {[
                    {label:`Semua (${counts.all})`, val:null},
                    {label:`Paket (${counts.package})`, val:'package'},
                    {label:`Joki (${counts.joki})`, val:'joki'},
                ].map(t=> (
                    <button key={t.label} onClick={()=>setType(t.val)} className={cn('rounded-full px-3.5 py-1.5 text-xs font-medium', filters.type===t.val || (!filters.type && !t.val) ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-line bg-card text-ink-3 hover:bg-hover')}>
                        {t.label}
                    </button>
                ))}
                <Link href="/admin/joki-services" className="ml-auto text-xs font-medium text-amber-600 underline">Lihat legacy Joki (deprecated) →</Link>
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {services.total} layanan · halaman {services.current_page}/{services.last_page} {filters.type ? `· filter: ${filters.type}` : ''}
                </p>
                <Button onClick={openCreate}>
                    <Plus className="size-4" />
                    Tambah Layanan
                </Button>
            </div>

            {services.data.length === 0 ? (
                <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-500">
                        <Layers className="size-5" />
                    </span>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Belum ada layanan</h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                        Tambah layanan pertama untuk ditampilkan di katalog.
                    </p>
                    <Button onClick={openCreate} className="mt-5">
                        <Plus className="size-4" /> Tambah Layanan
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {services.data.map((service, i) => (
                        <Reveal key={service.id} delay={Math.min(i * 30, 120)}>
                            <Card className="flex h-full flex-col p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <span className="font-mono text-xs font-semibold tracking-widest text-slate-400 dark:text-slate-500">
                                        #{String(service.id).padStart(2, '0')}
                                    </span>
                                    <span className={cn('rounded-full px-2 py-1 text-[10px] font-bold ring-1', service.type==='joki' ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300')}>
                                        {service.type}
                                    </span>
                                </div>

                                <h3 className="mt-3 text-[15px] font-bold leading-tight text-slate-900 dark:text-white">{service.title}</h3>
                                <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                    {service.short_desc}
                                </p>
                                {service.category && <p className="mt-1 text-xs text-slate-400">{service.category}</p>}

                                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-dashed border-slate-200 pt-4 dark:border-white/10">
                                    <div>
                                        <dt className="text-xs text-slate-400 dark:text-slate-500">Harga mulai</dt>
                                        {inlinePriceId === service.id ? (
                                            <div className="mt-1 flex items-center gap-1">
                                                <input type="number" value={inlinePriceVal} onChange={e=>setInlinePriceVal(Number(e.target.value))} onKeyDown={e=>{ if(e.key==='Enter') saveInlinePrice(service); if(e.key==='Escape') cancelInlinePrice(); }} onBlur={()=>saveInlinePrice(service)} className="w-full rounded-lg border border-brand-300 px-2 py-1 text-sm font-mono font-semibold dark:border-brand-500/30 dark:bg-slate-800" autoFocus />
                                            </div>
                                        ) : (
                                            <dd onClick={()=>startInlinePrice(service)} className="mt-1 flex cursor-pointer items-center gap-1 font-mono text-sm font-semibold text-slate-900 hover:text-brand-600 dark:text-white" title="Klik untuk edit">
                                                {formatIDR(service.starting_price)} <Pencil className="size-3 text-slate-400" />
                                            </dd>
                                        )}
                                    </div>
                                    <div>
                                        <dt className="text-xs text-slate-400 dark:text-slate-500">Estimasi</dt>
                                        <dd className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-white">
                                            {service.delivery_days} hari
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-5 flex gap-2">
                                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(service)}>
                                        <Pencil className="size-3.5" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => destroy(service)}
                                        aria-label={`Hapus ${service.title}`}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </Card>
                        </Reveal>
                    ))}
                </div>
            )}

            {services.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                    <p className="text-xs text-ink-4">Page {services.current_page} of {services.last_page} · {services.total} total</p>
                    <div className="flex gap-1.5">
                        {services.links.map((link,i)=> link.url ? (
                            <Link key={i} href={link.url} preserveState className={cn('rounded-lg px-3 py-1.5 text-xs font-medium', link.active ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-line bg-card text-ink-3')} dangerouslySetInnerHTML={{__html: link.label}} />
                        ) : null)}
                    </div>
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? `Edit: ${editing.title}` : 'Tambah Layanan'}
                description={editing ? 'Perbarui detail layanan dan simpan perubahan.' : 'Isi detail layanan baru — pilih type package (paket) atau joki (satuan).'}
                wide
            >
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
                        <Input
                            label="Judul Layanan"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            error={errors.title}
                            required
                            autoFocus
                            placeholder="Website Company Profile"
                            tooltip="Nama layanan yang tampil di katalog dan paket penawaran"
                        />
                        <Input
                            label="Icon Key"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                            placeholder="globe / bug / layers"
                            error={errors.icon}
                            required
                            tooltip="Nama ikon Lucide (misal: globe, code, smartphone, layers)"
                        />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Select
                            label="Tipe Layanan"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as any)}
                            required
                            tooltip="Pilih Paket Layanan (bundle proyek lengkap) atau Joki Satuan (tugas/coding spesifik)"
                        >
                            <option value="package">Package — Paket Layanan</option>
                            <option value="joki">Joki — Joki Satuan</option>
                        </Select>
                        <Input
                            label="Kategori"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            placeholder="Web Development"
                            hint="Opsional"
                            tooltip="Kategori untuk pengelompokan filter di halaman layanan"
                        />
                    </div>
                    <Input
                        label="Logo URL"
                        value={data.logo}
                        onChange={(e) => setData('logo', e.target.value)}
                        placeholder="https://cdn.jsdelivr.net/..."
                        hint="Opsional"
                        tooltip="Tautan gambar atau icon logo SVG/PNG kustom jika ada"
                    />

                    <Input
                        label="Deskripsi Singkat"
                        value={data.short_desc}
                        onChange={(e) => setData('short_desc', e.target.value)}
                        error={errors.short_desc}
                        required
                        placeholder="Ringkasan singkat untuk kartu katalog (1–2 baris)"
                        tooltip="Teks ringkas 1-2 baris untuk kartu preview layanan"
                    />

                    <Textarea
                        label="Deskripsi Lengkap"
                        rows={5}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                        required
                        placeholder="Jelaskan ruang lingkup, proses, dan hasil yang didapat klien..."
                        hint="Pisahkan paragraf dengan baris kosong"
                        tooltip="Penjelasan detail tentang ruang lingkup pengerjaan yang dibaca klien"
                    />

                    <Textarea
                        label="Fitur Termasuk"
                        rows={5}
                        value={data.features}
                        onChange={(e) => setData('features', e.target.value)}
                        error={errors.features}
                        required
                        placeholder="Desain responsif&#10;Optimasi SEO dasar&#10;CMS mudah kelola"
                        hint="Satu baris per fitur"
                        tooltip="Daftar poin keunggulan layanan, pisahkan dengan tombol Enter untuk baris baru"
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                            label="Harga Mulai (IDR)"
                            type="number"
                            min={0}
                            value={data.starting_price}
                            onChange={(e) => setData('starting_price', Number(e.target.value))}
                            error={errors.starting_price}
                            required
                            tooltip="Harga dasar sebelum kustomisasi fitur, dalam Rupiah (contoh: 2500000)"
                        />
                        <Input
                            label="Estimasi Pengerjaan"
                            type="number"
                            min={1}
                            value={data.delivery_days}
                            onChange={(e) => setData('delivery_days', Number(e.target.value))}
                            error={errors.delivery_days}
                            required
                            hint="Hari kerja"
                            tooltip="Estimasi waktu pengerjaan normal dalam hitungan hari kalender/kerja"
                        />
                    </div>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 select-none dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={data.is_featured}
                            onChange={(e) => setData('is_featured', e.target.checked)}
                            className="size-4 rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-brand-500 dark:border-slate-600"
                        />
                        Tampilkan sebagai unggulan di homepage
                    </label>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Buat Layanan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
export default function AdminServices({ services, filters, counts }: Props) {
    return (
        <AdminLayout title="Layanan" description="Single source — filter type package/joki (FR-2). Joki legacy via /admin/joki-services redirect 301.">
            <ServicesInner services={services} filters={filters} counts={counts} />
        </AdminLayout>
    );
}