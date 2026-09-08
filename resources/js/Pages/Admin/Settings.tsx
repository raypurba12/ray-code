import type { PageProps } from '@/types';
import { R } from '@/lib/routes';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input } from '@/Components/ui';
import { useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';

interface Props extends PageProps {
    settings: Record<string, string>;
}

export default function AdminSettings({ settings }: Props) {
    const { data, setData, put, processing, recentlySuccessful } = useForm({
        site_name: settings.site_name ?? '',
        site_tagline: settings.site_tagline ?? '',
        contact_email: settings.contact_email ?? '',
        contact_phone: settings.contact_phone ?? '',
        whatsapp: settings.whatsapp ?? '',
        address: settings.address ?? '',
        invoice_tax_rate: settings.invoice_tax_rate ?? '11',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(R.adminSettingsUpdate, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Pengaturan" description="Konfigurasi global website dan invoice">
            <Card className="max-w-2xl p-6">
                <form onSubmit={submit} className="space-y-6">
                    <fieldset>
                        <legend className="mb-4 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Identitas Website
                        </legend>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input label="Nama situs" value={data.site_name} onChange={(e) => setData('site_name', e.target.value)} required />
                            <Input label="Tagline" value={data.site_tagline} onChange={(e) => setData('site_tagline', e.target.value)} />
                        </div>
                    </fieldset>

                    <fieldset className="border-t border-slate-200 pt-6 dark:border-slate-800">
                        <legend className="mb-4 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Kontak
                        </legend>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input label="Email publik" type="email" value={data.contact_email} onChange={(e) => setData('contact_email', e.target.value)} required />
                            <Input label="Telepon" value={data.contact_phone} onChange={(e) => setData('contact_phone', e.target.value)} />
                            <Input label="Nomor WhatsApp" placeholder="+62812..." value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} />
                            <Input label="Alamat" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        </div>
                    </fieldset>

                    <fieldset className="border-t border-slate-200 pt-6 dark:border-slate-800">
                        <legend className="mb-4 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Penagihan
                        </legend>
                        <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                            <Input label="Tarif pajak invoice (%)" type="number" min={0} max={50} step={0.5} value={data.invoice_tax_rate} onChange={(e) => setData('invoice_tax_rate', e.target.value)} />
                            <p className="self-end pb-2.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Diterapkan pada invoice baru. Mengubah nilai ini tidak mengubah invoice yang sudah diterbitkan.
                            </p>
                        </div>
                    </fieldset>

                    <div className="flex items-center gap-4 border-t border-slate-200 pt-5 dark:border-slate-800">
                        <Button type="submit" disabled={processing}>
                            <Save className="size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </Button>
                        {recentlySuccessful && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Tersimpan ✓</span>}
                    </div>
                </form>
            </Card>
        </AdminLayout>
    );
}
