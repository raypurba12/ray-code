import type { Invoice, PageProps, Project, Service } from '@/types';
import { R } from '@/lib/routes';
import { cn, formatDate, formatIDR } from '@/lib/utils';
import { AdminLayout } from '@/Components/layout/AdminLayout';
import { Button, Card, Input, Textarea } from '@/Components/ui';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { FileText, Filter, Inbox, Plus, Copy, ExternalLink, MessageCircle, Mail, CreditCard, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Props extends PageProps {
    orders: {
        data: (Project & {
            user?: Pick<import('@/types').User, 'id' | 'name' | 'email'> & { phone?: string | null };
            service?: Pick<import('@/types').Service, 'id' | 'title'> | null;
            invoices?: Invoice[];
            order_code?: string;
        })[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { status: string | null };
    services: Pick<Service,'id'|'title'|'slug'|'type'>[];
}

const statuses = ['pending', 'in_review', 'in_progress', 'review', 'completed', 'cancelled'] as const;

function kindBadge(kind?: string | null) {
    if (kind === 'dp') return { label: 'DP 50%', cls: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/20' };
    if (kind === 'final') return { label: 'Pelunasan 50%', cls: 'bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/20' };
    return { label: 'Full', cls: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/10 dark:text-slate-300' };
}

export default function AdminOrders({ orders, filters, services }: Props) {
    const [showManual, setShowManual] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const page = usePage<PageProps & { invoice_payload?: { order_code:string; invoice_number:string; invoice_total:number; payUrl:string; trackUrl:string; pdfUrl:string; waLink:string; waMessage:string; kind:string } }>();
    const payload = (page.props as any).invoice_payload as Props['orders']['data'][0] extends never ? any : { order_code:string; invoice_number:string; invoice_total:number; payUrl:string; trackUrl:string; pdfUrl:string; waLink:string; waMessage:string; kind:string } | undefined;
    const flash = (page.props.flash as any) || {};

    const form = useForm({
        client_name:'', client_wa:'', client_email:'', service_id: services[0]?.id ?? 0, title:'', requirements:'', budget: 2000000, deadline:''
    });
    const submitManual = (e:React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/orders/manual', { preserveScroll:true, onSuccess:()=> setShowManual(false) });
    };
    const setFilter = (status: string | null) => {
        router.get(R.adminOrders, status ? { status } : {}, { preserveState: true });
    };

    const setStatus = (order: Project, status: string) => {
        router.patch(R.adminOrdersStatus(order.id), { status }, { preserveScroll: true });
    };

    const generateInvoice = (order: Project) => {
        router.post(R.adminOrdersInvoice(order.id), {}, { preserveScroll: true });
    };
    const generateFinal = (order: Project) => {
        router.post(R.adminOrdersInvoiceFinal(order.id), {}, { preserveScroll: true });
    };
    const resend = (order: Project, invoice: Invoice) => {
        router.post(R.adminOrdersInvoiceResend(order.id), { invoice_id: invoice.id }, { preserveScroll: true });
    };

    const doCopy = async (text: string, key: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(()=>setCopied(null), 1800);
    };

    return (
        <AdminLayout title="Pesanan" description="Kelola pesanan masuk — DP 50% otomatis + notif WA & Email, pelunasan saat 100%">
            {/* Manual order */}
            <div className="mb-4 flex justify-end">
                <Button onClick={()=>setShowManual(v=>!v)} variant={showManual?'secondary':'primary'}><Plus className="size-4" /> {showManual?'Tutup':'Tambah Pesanan Manual (WA Deal)'}</Button>
            </div>
            {showManual && (
                <Card className="mb-6 p-6 border-amber-200/50 dark:border-amber-500/20">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tambah Pesanan Manual — Admin input setelah deal WA</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">Sistem auto buat User + Project (kode <span className="font-mono font-bold">RAY-xxx</span>) + <span className="font-semibold text-amber-600">Invoice DP 50%</span> dari budget + QRIS Midtrans siap kirim. Pelunasan 50% baru bisa dikirim saat progress 100%.</p>
                    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 dark:bg-amber-500/10 dark:border-amber-500/20">
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1.5"><AlertCircle className="size-3.5" /> Contoh: Budget Rp 2.000.000 → DP Rp 1.000.000 + PPN 11% = Rp 1.110.000 (Invoice DP) + Pelunasan Rp 1.110.000 nanti.</p>
                    </div>
                    <form onSubmit={submitManual} className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Input label="Nama Customer*" value={form.data.client_name} onChange={e=>form.setData('client_name',e.target.value)} error={form.errors.client_name} required placeholder="Budi Santoso" />
                        <Input label="WA* (+62)" value={form.data.client_wa} onChange={e=>form.setData('client_wa',e.target.value)} error={form.errors.client_wa} required placeholder="+62 812..." />
                        <Input label="Email (opsional — untuk notif email)" value={form.data.client_email} onChange={e=>form.setData('client_email',e.target.value)} error={form.errors.client_email} placeholder="budi@mail.com" />
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Layanan*</label>
                            <select value={form.data.service_id} onChange={e=>form.setData('service_id', Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                {services.map(s=> <option key={s.id} value={s.id}>{s.title} ({s.type})</option>)}
                            </select>
                        </div>
                        <Input label="Judul Pesanan*" className="sm:col-span-2" value={form.data.title} onChange={e=>form.setData('title',e.target.value)} error={form.errors.title} required placeholder="Joki Android — Aplikasi Kasir" />
                        <Textarea label="Deskripsi/Requirements*" className="sm:col-span-2" rows={3} value={form.data.requirements} onChange={e=>form.setData('requirements',e.target.value)} error={form.errors.requirements} required placeholder="Fitur: login, CRUD, laporan..." />
                        <Input label="Budget Total (IDR)* — DP 50% auto" type="number" value={form.data.budget as any} onChange={e=>form.setData('budget', Number(e.target.value))} error={form.errors.budget} required />
                        <Input label="Deadline*" type="date" value={form.data.deadline} onChange={e=>form.setData('deadline',e.target.value)} error={form.errors.deadline} required />
                        <div className="sm:col-span-2 flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={()=>setShowManual(false)}>Batal</Button>
                            <Button type="submit" disabled={form.processing}>{form.processing?'Menyimpan...':'Buat Pesanan + Kirim DP 50% (WA & Email)'}</Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Flash payload — detail notif */}
            {payload && (
                <Card className="mb-6 overflow-hidden border-emerald-200 bg-emerald-50 p-0 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <div className="bg-emerald-600 px-4 py-3 text-white flex items-center justify-between">
                        <p className="text-sm font-bold flex items-center gap-2"><CheckCircle2 className="size-4" /> {payload.kind === 'final' ? 'Invoice Pelunasan terkirim!' : 'Invoice DP terkirim!'} — {payload.invoice_number} • {payload.order_code}</p>
                        <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-mono font-bold">{formatIDR(payload.invoice_total)}</span>
                    </div>
                    <div className="p-4 grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold tracking-widest text-emerald-800 dark:text-emerald-200 uppercase">Notifikasi 2 Channel</p>
                                <p className="mt-1 text-xs leading-relaxed text-emerald-700/80 dark:text-emerald-200/70">WA & Email otomatis dikirim (queue). Jika gateway WA belum diset, pakai tombol WA di bawah untuk kirim manual 1-klik. Email masuk log jika <span className="font-mono">MAIL_MAILER=log</span>.</p>
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between rounded-xl bg-white border border-emerald-200 p-3 dark:bg-slate-900 dark:border-emerald-500/20">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1"><CreditCard className="size-3.5 text-emerald-600" /> Link Bayar QRIS</p>
                                        <p className="mt-1 truncate font-mono text-xs text-slate-500">{payload.payUrl}</p>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={()=>doCopy(payload.payUrl,'pay')}>{copied==='pay'?'Copied!':<><Copy className="size-3" /> Copy</>}</Button>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-white border border-emerald-200 p-3 dark:bg-slate-900 dark:border-emerald-500/20">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Pantau Progress</p>
                                        <p className="mt-1 truncate font-mono text-xs text-slate-500">{payload.trackUrl}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={()=>doCopy(payload.trackUrl,'track')}>{copied==='track'?'Copied!':<><Copy className="size-3" /> Copy</>}</Button>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-white border border-emerald-200 p-3 dark:bg-slate-900 dark:border-emerald-500/20">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Invoice PDF</p>
                                        <p className="mt-1 truncate font-mono text-xs text-slate-500">{payload.pdfUrl}</p>
                                    </div>
                                    <a href={payload.pdfUrl} target="_blank" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-white/10"><ExternalLink className="size-3" /> Buka</a>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-bold tracking-widest text-emerald-800 dark:text-emerald-200 uppercase">Pesan WA Siap Kirim</p>
                            <div className="rounded-xl bg-white border border-emerald-200 p-3 dark:bg-slate-900 dark:border-emerald-500/20">
                                <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300">{payload.waMessage}</pre>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <a href={payload.waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold text-white hover:bg-[#1ebe5a]"><MessageCircle className="size-4" /> Buka WA (1-klik kirim)</a>
                                <Button size="sm" variant="secondary" onClick={()=>doCopy(payload.waMessage,'waMsg')}><Copy className="size-3" /> {copied==='waMsg'?'Tersalin!':'Copy Pesan WA'}</Button>
                                <a href={`mailto:?subject=${encodeURIComponent('Invoice '+payload.invoice_number)}&body=${encodeURIComponent(payload.waMessage)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Mail className="size-4" /> Buka Email</a>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
            {flash?.success && !payload && String(flash.success).includes('RAY-') && (
                <Card className="mb-6 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{flash.success}</p>
                    <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-200/70">Copy kode & link di atas lalu kirim WA ke customer.</p>
                </Card>
            )}
            {flash?.error && (
                <Card className="mb-6 border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 flex items-center gap-1.5"><AlertCircle className="size-4" /> {flash.error}</p>
                </Card>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                    <Filter className="size-3.5" />
                    Status:
                </span>
                <button
                    onClick={() => setFilter(null)}
                    className={cn(
                        'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                        !filters.status
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                    )}
                >
                    All
                </button>
                {statuses.map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={cn(
                            'rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors',
                            filters.status === status
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                        )}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1080px] text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr className="text-left">
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Order / Client</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Service</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Budget / DP</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Deadline</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Status / Progress</th>
                                <th className="px-6 py-3 text-[11px] font-semibold tracking-widest text-slate-500 uppercase dark:text-slate-400">Invoice & Notif</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                                            <Inbox className="size-6" />
                                            <p className="text-sm">No orders match this filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {orders.data.map((order) => {
                                const invoices = (order.invoices ?? []) as Invoice[];
                                const dp = invoices.find(i => i.kind === 'dp');
                                const fin = invoices.find(i => i.kind === 'final');
                                const full = invoices.find(i => i.kind === 'full' || (!i.kind));
                                const canPelunasan = (order.progress >= 100 || order.status === 'completed') && !fin && !full;
                                const dpTotal = dp ? formatIDR(dp.total) : formatIDR(Math.ceil(order.budget*0.5*1.11));
                                return (
                                <tr key={order.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <td className="px-6 py-4 max-w-[280px]">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{order.title}</p>
                                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{(order as any).order_code ?? '#'+String(order.id).padStart(4,'0')}</span> · {order.user?.name} ({order.user?.email})
                                            {(order as any).order_code && <button onClick={()=>navigator.clipboard.writeText((order as any).order_code)} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-white/10"><Copy className="size-3" /></button>}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            {(order as any).order_code && <a href={`/pantau-pesanan?code=${(order as any).order_code}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"><ExternalLink className="size-3" /> Pantau</a>}
                                            {(order as any).order_code && <a href={`/invoice/${(order as any).order_code}/pdf`} target="_blank" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:underline"><FileText className="size-3" /> PDF</a>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.service?.title ?? '—'}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-mono text-sm font-semibold whitespace-nowrap text-slate-900 dark:text-white">{formatIDR(order.budget)}</p>
                                        <p className="text-xs text-slate-500">DP 50%: {dpTotal} {dp && <span className={cn('ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1', dp.status==='paid'?'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300':'bg-amber-50 text-amber-700 ring-amber-200')}>{dp.status}</span>}</p>
                                        {fin && <p className="text-xs text-slate-500">Pelunasan: {formatIDR(fin.total)} <span className={cn('ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1', fin.status==='paid'?'bg-emerald-50 text-emerald-700 ring-emerald-200':'bg-violet-50 text-violet-700 ring-violet-200')}>{fin.status}</span></p>}
                                    </td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDate(order.deadline)}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => setStatus(order, e.target.value)}
                                            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium capitalize text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-white dark:focus:ring-white/10"
                                        >
                                            {statuses.map((s) => (
                                                <option key={s} value={s}>
                                                    {s.replace('_', ' ')}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full bg-brand-600" style={{width: `${order.progress}%`}} /></div>
                                            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{order.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2 min-w-[220px]">
                                            {/* DP row */}
                                            {dp ? (
                                                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                                                    <div className="flex items-center justify-between">
                                                        <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1', kindBadge(dp.kind).cls)}>{kindBadge(dp.kind).label}</span>
                                                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', dp.status==='paid'?'bg-emerald-500 text-white':'bg-amber-500 text-white')}>{dp.status==='paid'?<CheckCircle2 className="size-3" />:<Clock className="size-3" />} {dp.status}</span>
                                                    </div>
                                                    <p className="mt-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white">{dp.number} • {formatIDR(dp.total)}</p>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs" onClick={()=>resend(order, dp)}><Send className="size-3" /> Kirim Ulang WA+Email</Button>
                                                        <Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs" onClick={()=>doCopy(`${window.location.origin}/pay/${(order as any).order_code}`,'pay-'+order.id)}><Copy className="size-3" /> Link QR</Button>
                                                    </div>
                                                </div>
                                            ) : full ? (
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-white/[0.04]">
                                                    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1', kindBadge(full.kind).cls)}>FULL</span>
                                                    <p className="mt-1 font-mono text-xs font-bold">{full.number} • {formatIDR(full.total)} • {full.status}</p>
                                                    <Button size="sm" variant="ghost" className="mt-2 h-7" onClick={()=>resend(order, full)}><Send className="size-3" /> Kirim Ulang</Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="secondary" onClick={() => generateInvoice(order)} className="justify-start"><FileText className="size-3.5" /> Buat Invoice DP 50%</Button>
                                            )}

                                            {/* Final row */}
                                            {fin ? (
                                                <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
                                                    <div className="flex items-center justify-between">
                                                        <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1', kindBadge(fin.kind).cls)}>{kindBadge(fin.kind).label}</span>
                                                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', fin.status==='paid'?'bg-emerald-500 text-white':'bg-violet-500 text-white')}>{fin.status==='paid'?<CheckCircle2 className="size-3" />:<Clock className="size-3" />} {fin.status}</span>
                                                    </div>
                                                    <p className="mt-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white">{fin.number} • {formatIDR(fin.total)}</p>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        <Button size="sm" variant="secondary" className="h-7 px-2.5 text-xs bg-violet-600 text-white hover:bg-violet-700 border-violet-600" onClick={()=>resend(order, fin)}><Send className="size-3" /> Kirim Ulang Pelunasan</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {canPelunasan ? (
                                                        <Button size="sm" variant="primary" onClick={() => generateFinal(order)} className="justify-start bg-violet-600 hover:bg-violet-700"><FileText className="size-3.5" /> Buat & Kirim Pelunasan 50% (WA+Email)</Button>
                                                    ) : !full && dp ? (
                                                        <p className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500"><Clock className="size-3" /> Pelunasan aktif saat 100% / Completed {dp.status!=='paid' && '• DP belum lunas'}</p>
                                                    ) : null}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Page {orders.current_page} of {orders.last_page} · {orders.total} orders
                        </p>
                        <div className="flex gap-1.5">
                            {orders.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveState
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                            link.active
                                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : null,
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </AdminLayout>
    );
}