import type { PageProps, Service } from '@/types';
import { R } from '@/lib/routes';
import { formatIDR } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input, Textarea } from '@/Components/ui';
import { Modal } from '@/Components/Modal';
import { Reveal } from '@/Components/Reveal';
import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Layers } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

type ServiceRow = Omit<Service, 'description' | 'features'> & { description: string; features: string[] };

interface Props extends PageProps {
    services: ServiceRow[];
}

const emptyForm = {
    title: '',
    icon: 'globe',
    short_desc: '',
    description: '',
    features: '',
    starting_price: 0,
    delivery_days: 14,
    is_featured: false as boolean,
};

export default function AdminServices({ services }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ServiceRow | null>(null);
    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        ...emptyForm,
        features: '',
    });

    const openCreate = () => {
        setEditing(null);
        reset();
        setModalOpen(true);
    };

    const openEdit = (service: ServiceRow) => {
        setEditing(service);
        setData({
            title: service.title,
            icon: service.icon,
            short_desc: service.short_desc,
            description: service.description,
            features: (service.features ?? []).join('\n'),
            starting_price: service.starting_price,
            delivery_days: service.delivery_days,
            is_featured: !!service.is_featured,
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

    const destroy = (service: ServiceRow) => {
        if (confirm(`Hapus layanan "${service.title}"? Pesanan yang sudah ada tetap tersimpan.`)) {
            router.delete(R.adminServicesDestroy(service.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Layanan" description="Kelola layanan reguler yang tampil di /layanan-reguler dan homepage">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {services.length} layanan terdaftar · tampil di katalog dan homepage
                </p>
                <Button onClick={openCreate}>
                    <Plus className="size-4" />
                    Tambah Layanan
                </Button>
            </div>

            {services.length === 0 ? (
                <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-500">
                        <Layers className="size-5" />
                    </span>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Belum ada layanan</h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                        Tambah layanan pertama untuk ditampilkan di halaman /layanan-reguler dan homepage.
                    </p>
                    <Button onClick={openCreate} className="mt-5">
                        <Plus className="size-4" /> Tambah Layanan
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {services.map((service, i) => (
                        <Reveal key={service.id} delay={Math.min(i * 30, 120)}>
                            <Card className="flex h-full flex-col p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <span className="font-mono text-xs font-semibold tracking-widest text-slate-400 dark:text-slate-500">
                                        #{String(service.id).padStart(2, '0')}
                                    </span>
                                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10">
                                        {service.icon}
                                    </span>
                                </div>

                                <h3 className="mt-3 text-[15px] font-bold leading-tight text-slate-900 dark:text-white">{service.title}</h3>
                                <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                    {service.short_desc}
                                </p>

                                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-dashed border-slate-200 pt-4 dark:border-white/10">
                                    <div>
                                        <dt className="text-xs text-slate-400 dark:text-slate-500">Harga mulai</dt>
                                        <dd className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-white">
                                            {formatIDR(service.starting_price)}
                                        </dd>
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

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? `Edit: ${editing.title}` : 'Tambah Layanan'}
                description={editing ? 'Perbarui detail layanan dan simpan perubahan.' : 'Isi detail layanan baru yang akan tampil di katalog.'}
                wide
            >
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
                        <Input
                            label="Judul layanan"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            error={errors.title}
                            required
                            autoFocus
                            placeholder="Website Company Profile"
                        />
                        <Input
                            label="Icon key"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                            placeholder="globe / bug / layers"
                            error={errors.icon}
                            required
                        />
                    </div>

                    <Input
                        label="Deskripsi singkat"
                        value={data.short_desc}
                        onChange={(e) => setData('short_desc', e.target.value)}
                        error={errors.short_desc}
                        required
                        placeholder="Ringkasan singkat untuk kartu katalog (1–2 baris)"
                    />

                    <Textarea
                        label="Deskripsi lengkap (pisahkan paragraf dengan baris kosong)"
                        rows={5}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                        required
                        placeholder="Jelaskan ruang lingkup, proses, dan hasil yang didapat klien..."
                    />

                    <Textarea
                        label="Fitur (satu per baris)"
                        rows={5}
                        value={data.features}
                        onChange={(e) => setData('features', e.target.value)}
                        error={errors.features}
                        required
                        placeholder="Desain responsif&#10;Optimasi SEO dasar&#10;CMS mudah kelola"
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                            label="Harga mulai (IDR)"
                            type="number"
                            min={0}
                            value={data.starting_price}
                            onChange={(e) => setData('starting_price', Number(e.target.value))}
                            error={errors.starting_price}
                            required
                        />
                        <Input
                            label="Estimasi pengerjaan (hari)"
                            type="number"
                            min={1}
                            value={data.delivery_days}
                            onChange={(e) => setData('delivery_days', Number(e.target.value))}
                            error={errors.delivery_days}
                            required
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
        </AdminLayout>
    );
}
