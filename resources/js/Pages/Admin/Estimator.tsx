import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input } from '@/Components/ui';
import { R } from '@/lib/routes';
import { useForm } from '@inertiajs/react';
import { Calculator, Clock, Layers, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Complexity { id: string; label: string; multiplier: number; desc: string }
interface Feature { id: string; label: string; price: number }
interface Urgency { id: string; label: string; multiplier: number }

interface Lead {
    id: number;
    service: { id:number; title:string; slug:string } | null;
    complexity: string;
    features: string[];
    urgency: string;
    low_estimate: number;
    high_estimate: number;
    email: string | null;
    wa: string | null;
    ip: string | null;
    created_at: string;
}
interface Props {
    complexities: Complexity[];
    features: Feature[];
    urgencies: Urgency[];
    leads: Lead[];
    leadsCount: number;
}

export default function AdminEstimator({ complexities: initComplexities, features: initFeatures, urgencies: initUrgencies, leads, leadsCount }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        complexities: initComplexities,
        features: initFeatures,
        urgencies: initUrgencies,
    });
    const [saved, setSaved] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(R.adminEstimatorUpdate, {
            preserveScroll: true,
            onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); },
        });
    };

    const addComplexity = () => {
        setData('complexities', [...data.complexities, { id: `level-${Date.now()}`, label: 'Level baru', multiplier: 1, desc: '' }]);
    };
    const addFeature = () => {
        setData('features', [...data.features, { id: `fitur-${Date.now()}`, label: 'Fitur baru', price: 1000000 }]);
    };
    const addUrgency = () => {
        setData('urgencies', [...data.urgencies, { id: `urgency-${Date.now()}`, label: 'Jangka waktu baru', multiplier: 1 }]);
    };

    return (
        <AdminLayout title="Estimator" description="Atur opsi yang tampil di http://localhost:8000/estimator — perubahan langsung terpakai di publik">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">Estimator</h1>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                        Kelola 3 kelompok opsi estimator. <span className="font-mono text-xs">complexities</span> (pengali), <span className="font-mono text-xs">features</span> (harga tambah), <span className="font-mono text-xs">urgencies</span> (pengali waktu). ID dipakai sebagai key — otomatis di-slug.
                    </p>
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Harga layanan dasar tetap diambil dari <a href={R.adminServices} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Admin → Layanan</a> (field starting_price).</p>
                </div>
                <div className="flex items-center gap-2">
                    {saved && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">✓ Tersimpan</span>}
                    <Button onClick={submit as any} disabled={processing} className="min-w-[140px]"><Save className="size-4" /> {processing ? 'Menyimpan...' : 'Simpan Semua'}</Button>
                </div>
            </div>

            {Object.keys(errors).length > 0 && (
                <Card className="mb-6 border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Periksa isian:</p>
                    <ul className="mt-1 list-disc pl-5 text-xs text-red-600 dark:text-red-400">
                        {Object.entries(errors).map(([k, v]) => <li key={k}><span className="font-mono">{k}</span>: {v as string}</li>)}
                    </ul>
                </Card>
            )}

            <form onSubmit={submit} className="space-y-8">
                {/* Complexities */}
                <Card className="p-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-800 uppercase dark:text-slate-200"><Layers className="size-4 text-brand-600" /> Kompleksitas ({data.complexities.length})</h2>
                        <Button type="button" variant="secondary" size="sm" onClick={addComplexity}><Plus className="size-3.5" /> Tambah</Button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Pengali harga dasar. Contoh: 1 = normal, 1.8 = +80%, 3.2 = +220%</p>
                    <div className="mt-5 grid gap-4">
                        {data.complexities.map((c, idx) => (
                            <div key={idx} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02] sm:grid-cols-[1.2fr_1fr_1.6fr_auto] sm:items-end">
                                <Input label={`#${idx + 1} ID (slug)`} value={c.id} onChange={(e) => { const v=[...data.complexities]; v[idx].id=e.target.value; setData('complexities', v); }} placeholder="simple" />
                                <Input label="Label" value={c.label} onChange={(e) => { const v=[...data.complexities]; v[idx].label=e.target.value; setData('complexities', v); }} placeholder="Sederhana" />
                                <Input label="Pengali" type="number" step="0.01" min={0.1} max={10} value={String(c.multiplier)} onChange={(e) => { const v=[...data.complexities]; v[idx].multiplier=Number(e.target.value)||0; setData('complexities', v); }} />
                                <Input label="Deskripsi" className="sm:col-span-3" value={c.desc} onChange={(e) => { const v=[...data.complexities]; v[idx].desc=e.target.value; setData('complexities', v); }} placeholder="Halaman statis..." />
                                <div className="flex items-center gap-2 sm:col-span-4">
                                    <span className="flex-1 text-xs text-slate-400">ID = key yang disimpan, label tampil di publik</span>
                                    <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:text-red-400" onClick={() => setData('complexities', data.complexities.filter((_, i) => i !== idx))} disabled={data.complexities.length <= 1}><Trash2 className="size-3.5" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Features */}
                <Card className="p-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-800 uppercase dark:text-slate-200"><Calculator className="size-4 text-brand-600" /> Fitur Tambahan ({data.features.length})</h2>
                        <Button type="button" variant="secondary" size="sm" onClick={addFeature}><Plus className="size-3.5" /> Tambah</Button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Harga tambah per fitur (IDR). Ditambahkan ke harga dasar sebelum pengali urgensi.</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {data.features.map((f, idx) => (
                            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
                                <Input label="ID" value={f.id} onChange={(e) => { const v=[...data.features]; v[idx].id=e.target.value; setData('features', v); }} placeholder="auth" />
                                <div className="mt-3">
                                    <Input label="Label" value={f.label} onChange={(e) => { const v=[...data.features]; v[idx].label=e.target.value; setData('features', v); }} placeholder="Akun & peran pengguna" />
                                </div>
                                <div className="mt-3">
                                    <Input label="Harga (IDR)" type="number" min={0} step={100000} value={String(f.price)} onChange={(e) => { const v=[...data.features]; v[idx].price=Number(e.target.value)||0; setData('features', v); }} />
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:text-red-400" onClick={() => setData('features', data.features.filter((_, i) => i !== idx))} disabled={data.features.length <= 1}><Trash2 className="size-3.5" /> Hapus</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Urgencies */}
                <Card className="p-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-800 uppercase dark:text-slate-200"><Clock className="size-4 text-brand-600" /> Urgensi / Tenggat ({data.urgencies.length})</h2>
                        <Button type="button" variant="secondary" size="sm" onClick={addUrgency}><Plus className="size-3.5" /> Tambah</Button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Pengali total. 1 = normal, 1.15 = +15%, 1.45 = +45%</p>
                    <div className="mt-5 grid gap-4">
                        {data.urgencies.map((u, idx) => (
                            <div key={idx} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02] sm:grid-cols-[1.2fr_1.8fr_0.8fr_auto] sm:items-end">
                                <Input label="ID" value={u.id} onChange={(e) => { const v=[...data.urgencies]; v[idx].id=e.target.value; setData('urgencies', v); }} placeholder="standard" />
                                <Input label="Label" value={u.label} onChange={(e) => { const v=[...data.urgencies]; v[idx].label=e.target.value; setData('urgencies', v); }} placeholder="Standar (3–5 minggu)" />
                                <Input label="Pengali" type="number" step="0.01" min={0.1} max={10} value={String(u.multiplier)} onChange={(e) => { const v=[...data.urgencies]; v[idx].multiplier=Number(e.target.value)||0; setData('urgencies', v); }} />
                                <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:text-red-400" onClick={() => setData('urgencies', data.urgencies.filter((_, i) => i !== idx))} disabled={data.urgencies.length <= 1}><Trash2 className="size-3.5" /></Button>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="flex justify-end border-t border-slate-200 pt-6 dark:border-white/10">
                    <Button type="submit" disabled={processing} className="min-w-[180px]"><Save className="size-4" /> {processing ? 'Menyimpan...' : 'Simpan Pengaturan Estimator'}</Button>
                </div>
                <p className="text-center text-xs text-slate-400">Rumus: <span className="font-mono">((base * kompleksitas) + totalFitur) * urgensi</span> → low 0.9×, high 1.25×, pembulatan 100rb</p>
            </form>

            {/* Leads PRD FR-6 */}
            <Card className="mt-8 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Leads Estimator — {leadsCount} total (50 terbaru)</h2>
                    <a href="/admin/estimator-leads" className="text-xs font-semibold text-brand-600 hover:underline">Lihat semua →</a>
                </div>
                {leads.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Belum ada lead. Estimator baru capture setelah frontend update.</p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b text-slate-500"><tr><th className="py-2">Waktu</th><th>Layanan</th><th>Estimasi</th><th>Kontak</th><th>IP</th></tr></thead>
                            <tbody>
                                {leads.map(l=> (
                                    <tr key={l.id} className="border-b border-slate-100 dark:border-white/5">
                                        <td className="py-2 font-mono">{new Date(l.created_at).toLocaleString('id-ID')}</td>
                                        <td className="py-2">{l.service?.title ?? '-'}</td>
                                        <td className="py-2 font-mono">Rp {l.low_estimate.toLocaleString('id-ID')} — {l.high_estimate.toLocaleString('id-ID')}</td>
                                        <td className="py-2">{[l.wa, l.email].filter(Boolean).join(' / ') || <span className="text-slate-400">anon</span>}</td>
                                        <td className="py-2 font-mono text-slate-400">{l.ip ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </AdminLayout>
    );
}
