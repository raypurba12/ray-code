import type { PageProps, PricingPlan } from '@/types';
import { R } from '@/lib/routes';
import { formatIDR } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Badge, Button, Card, Input, Textarea } from '@/Components/ui';
import { Modal } from '@/Components/Modal';
import { Reveal } from '@/Components/Reveal';
import { router } from '@inertiajs/react';
import { Check, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface Props extends PageProps {
    plans: PricingPlan[];
}

const emptyForm = {
    name: '',
    slug: '',
    tagline: '',
    price: 0,
    unit: '/proyek',
    features: '',
    is_popular: false,
    is_active: true,
    cta_text: 'Mulai Proyek',
    sort_order: 0,
};

export default function AdminPricingPlans({ plans }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<PricingPlan | null>(null);
    const { data, setData, post, put, processing, errors, reset, transform } = useForm(emptyForm);

    const openCreate = () => {
        setEditing(null);
        reset();
        setData(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (plan: PricingPlan) => {
        setEditing(plan);
        setData({
            name: plan.name,
            slug: plan.slug,
            tagline: plan.tagline,
            price: plan.price,
            unit: plan.unit,
            features: plan.features.join('\n'),
            is_popular: !!plan.is_popular,
            is_active: plan.is_active ?? true,
            cta_text: plan.cta_text,
            sort_order: (plan as any).sort_order ?? 0,
        });
        setModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform(() => ({
            ...data,
            features: data.features.split('\n').map((f) => f.trim()).filter(Boolean),
        }));
        if (editing) {
            put(R.adminPricingPlansUpdate(editing.id), { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        } else {
            post(R.adminPricingPlansStore, { preserveScroll: true, onSuccess: () => setModalOpen(false) });
        }
    };

    const destroy = (plan: PricingPlan) => {
        if (confirm(`Hapus paket "${plan.name}"?`)) {
            router.delete(R.adminPricingPlansDestroy(plan.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Paket Harga">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">Paket Harga</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola 4 paket yang tampil di homepage dan halaman /pricing. Urutan diatur via Sort Order.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="size-4" /> Tambah Paket
                </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {plans.map((plan, i) => (
                    <Reveal key={plan.id} delay={(i % 4) * 60}>
                        <Card hover className={`flex h-full flex-col p-6 ${plan.is_popular ? 'ring-1 ring-amber-200 dark:ring-amber-500/30' : ''}`}>
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">{plan.tagline}</p>
                                </div>
                                {plan.is_popular && <Badge tone="amber"><Star className="size-3" /> Populer</Badge>}
                            </div>
                            <p className="mt-4 font-mono text-2xl font-bold text-slate-900 dark:text-white">{formatIDR(plan.price)}<span className="text-xs font-medium text-slate-400">{plan.unit}</span></p>
                            <p className="mt-1 text-xs text-slate-400">{plan.is_active === false ? 'Nonaktif' : 'Aktif'} · Sort #{(plan as any).sort_order} · {plan.cta_text}</p>
                            <ul className="mt-4 flex-1 space-y-1.5 border-t border-dashed border-slate-200 pt-4 dark:border-white/10">
                                {plan.features.slice(0, 4).map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />{f}</li>
                                ))}
                                {plan.features.length > 4 && <li className="text-xs text-slate-400">+{plan.features.length - 4} lainnya</li>}
                            </ul>
                            <div className="mt-4 flex gap-2">
                                <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(plan)}><Pencil className="size-3.5" /> Edit</Button>
                                <Button size="sm" variant="danger" onClick={() => destroy(plan)}><Trash2 className="size-3.5" /></Button>
                            </div>
                        </Card>
                    </Reveal>
                ))}
            </div>

            {plans.length === 0 && (
                <Card className="mt-6 p-12 text-center">
                    <p className="text-sm text-slate-500">Belum ada paket. Tambah paket pertama untuk tampil di pricing.</p>
                </Card>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit: ${editing.name}` : 'Tambah Paket Harga'} wide>
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">
                        <Input label="Nama paket" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required autoFocus />
                        <Input label="Slug (kosongkan auto)" value={data.slug} onChange={(e) => setData('slug', e.target.value)} placeholder="starter" error={errors.slug} />
                    </div>
                    <Input label="Tagline" value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} error={errors.tagline} required />
                    <div className="grid gap-5 sm:grid-cols-3">
                        <Input label="Harga (IDR)" type="number" min={0} value={data.price} onChange={(e) => setData('price', Number(e.target.value))} error={errors.price} required />
                        <Input label="Unit" value={data.unit} onChange={(e) => setData('unit', e.target.value)} placeholder="/proyek /bulan" error={errors.unit} required />
                        <Input label="Sort order" type="number" value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} error={errors.sort_order} />
                    </div>
                    <Textarea label="Fitur (satu per baris)" rows={6} value={data.features} onChange={(e) => setData('features', e.target.value)} error={errors.features} required placeholder="Hingga 5 halaman&#10;Desain kustom" />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input label="CTA text" value={data.cta_text} onChange={(e) => setData('cta_text', e.target.value)} error={errors.cta_text} required />
                        <div className="flex flex-col gap-3 pt-6">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" checked={data.is_popular} onChange={(e) => setData('is_popular', e.target.checked)} className="size-4 rounded accent-amber-500" /> Tandai sebagai Populer</label>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="size-4 rounded accent-brand-600" /> Aktif (tampilkan di pricing)</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Buat Paket'}</Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
