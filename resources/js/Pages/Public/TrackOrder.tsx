import { PublicLayout } from '@/Components/layout/PublicLayout';
import { SeoHead } from '@/Components/SeoHead';
import { Reveal } from '@/Components/Reveal';
import { Badge, Button } from '@/Components/ui';
import { formatIDR, formatDate } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search, Package, CreditCard, MessageCircle, Clock, CheckCircle2, Truck, Eye, ExternalLink, FileText } from 'lucide-react';
import { useState } from 'react';

import { useI18n } from '@/lib/i18n';

interface TrackProps {
  code: string | null;
  project: {
    order_code: string;
    title: string;
    requirements: string;
    status: string;
    progress: number;
    budget: number;
    deadline: string | null;
    service: { title:string; slug:string } | null;
    updates: { id:number; title:string; notes:string|null; created_at:string }[];
    masked_wa: string | null;
    created_at: string;
  } | null;
  invoice: { number:string; total:number; status:string; payment_status:string|null; due_date:string|null; paid_at:string|null; kind?:string|null; label?:string|null } | null;
  invoices?: { id:number; number:string; total:number; amount:number; tax:number; status:string; payment_status:string|null; due_date:string|null; paid_at:string|null; kind:string; label:string; paymentUrl:string|null; pdfUrl:string }[] | null;
  paymentUrl: string | null;
  notFound: boolean;
}

const statusMap: Record<string, {label:string; color:string; desc:string}> = {
  pending: {label:'Pending Review', color:'bg-amber-100 text-amber-700 ring-amber-200', desc:'Admin akan review dalam 24 jam'},
  in_review: {label:'In Review', color:'bg-blue-100 text-blue-700 ring-blue-200', desc:'Tim mereview kebutuhan'},
  in_progress: {label:'In Progress', color:'bg-violet-100 text-violet-700 ring-violet-200', desc:'Pengerjaan berjalan'},
  review: {label:'Client Review', color:'bg-sky-100 text-sky-700 ring-sky-200', desc:'Menunggu feedback kamu'},
  completed: {label:'Completed', color:'bg-emerald-100 text-emerald-700 ring-emerald-200', desc:'Selesai — file siap'},
  cancelled: {label:'Cancelled', color:'bg-red-100 text-red-700 ring-red-200', desc:'Dibatalkan'},
};

function kindMeta(kind:string) {
  if (kind==='dp') return { label:'DP 50% — Pembayaran Awal', desc:'Bayar DP untuk mulai pengerjaan', color:'bg-amber-100 text-amber-700 ring-amber-200', icon:'💰' };
  if (kind==='final') return { label:'Pelunasan 50% — Selesai Proyek', desc:'Proyek 100% selesai, pelunasan sisa', color:'bg-violet-100 text-violet-700 ring-violet-200', icon:'🎉' };
  return { label:'Invoice', desc:'Tagihan proyek', color:'bg-slate-100 text-slate-700 ring-slate-200', icon:'📄' };
}

export default function TrackOrder({ code, project, invoice, invoices, paymentUrl, notFound }: TrackProps) {
  const { t } = useI18n();
  const [input, setInput] = useState(code ?? '');
  const { settings } = usePage<{settings:Record<string,string>}>().props as any;
  const waRaw = settings?.whatsapp ?? '+6281234567890';
  const waNum = String(waRaw).replace(/[^0-9]/g,'');
  const waHref = project ? `https://wa.me/${waNum}?text=Halo%20Raycode%20kode%20${project.order_code}%20mau%20tanya%20progress` : `https://wa.me/${waNum}?text=Halo%20Raycode%20mau%20cek%20pesanan`;

  const submit = (e:React.FormEvent) => {
    e.preventDefault();
    const c = input.trim().toUpperCase();
    if (!c) return;
    trackEvent('track_lookup', { code: c });
    router.get('/pantau-pesanan', {code:c}, {preserveState:false});
  };

  const list = invoices && invoices.length ? invoices : (invoice ? [{ id:0, number:invoice.number, total:invoice.total, amount:0, tax:0, status:invoice.status, payment_status:invoice.payment_status, due_date:invoice.due_date, paid_at:invoice.paid_at, kind: invoice.kind ?? 'full', label: invoice.label ?? invoice.number, paymentUrl }] : []);

  return (
    <PublicLayout>
      <SeoHead title={`${t('track.title')} — Raycode`} description={t('track.subtitle')} />
      <section className="relative overflow-hidden pt-6">
        <div className="bg-grid mask-fade-y pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-24 lg:px-8">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold tracking-widest text-white dark:bg-white dark:text-slate-900 uppercase">
                <Package className="size-3.5" /> {t('nav.trackOrder')}
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{t('track.title')}</h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-2">{t('track.subtitle')}</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-2xl border border-line bg-card p-2 shadow-sm">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())} placeholder={t('track.searchPlaceholder')} className="h-11 w-full rounded-xl border-0 bg-transparent pl-10 pr-3 font-mono text-sm font-bold tracking-widest placeholder:tracking-normal placeholder:font-normal focus:outline-none" />
              </div>
              <Button type="submit" size="lg" className="shrink-0 rounded-xl px-6">{t('track.trackButton')}</Button>
            </form>
            <p className="mt-2 text-center text-xs text-ink-4">Contoh kode ada di WA admin & invoice. Huruf besar/kecil tidak masalah.</p>
          </Reveal>

          {notFound && (
            <Reveal>
              <div className="mx-auto mt-6 max-w-md rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-500/20 dark:bg-red-500/10">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">Kode tidak ditemukan</p>
                <p className="mt-1 text-xs text-red-600/80 dark:text-red-300/80">Periksa lagi kode `{code}` atau hubungi admin.</p>
                <a href={waHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white hover:bg-[#1ebe5a]"><MessageCircle className="size-3.5" /> Hubungi WA</a>
              </div>
            </Reveal>
          )}

          {project && (
            <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} className="mt-8 space-y-6">
              {/* Project card */}
              <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
                <div className="bg-slate-950 px-6 py-4 text-white flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs tracking-widest text-brand-300">// pesanan</p>
                    <h2 className="mt-1 font-mono text-lg font-bold tracking-widest">{project.order_code}</h2>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusMap[project.status]?.color ?? 'bg-slate-100 text-slate-700'}`}>{statusMap[project.status]?.label ?? project.status}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold text-ink">{project.title}</h3>
                  <p className="mt-1 text-xs text-ink-3">{project.service?.title ?? 'Custom'} • Budget {formatIDR(project.budget)} (DP 50% + Pelunasan 50%) • Deadline {project.deadline ? formatDate(project.deadline) : '-'}</p>
                  <p className="mt-2 text-xs text-ink-4">{statusMap[project.status]?.desc}</p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs"><span className="font-medium text-ink-3">Progress</span><span className="font-mono font-bold">{project.progress}%</span></div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-brand-600" style={{width: `${project.progress}%`}} /></div>
                  </div>

                  {project.updates.length > 0 && (
                    <div className="mt-6">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-ink-3 uppercase"><Clock className="size-3.5" /> Timeline</h4>
                      <ul className="mt-3 space-y-3 border-l border-dashed border-line pl-4">
                        {project.updates.map(u=> (
                          <li key={u.id} className="relative">
                            <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-brand-500 ring-4 ring-brand-50 dark:ring-white/10" />
                            <p className="text-sm font-semibold text-ink">{u.title}</p>
                            {u.notes && <p className="text-xs leading-relaxed text-ink-3">{u.notes}</p>}
                            <p className="font-mono text-xs text-ink-4">{formatDate(u.created_at)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
                    <p className="text-xs font-semibold text-ink">Deskripsi</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{project.requirements}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={waHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1ebe5a]"><MessageCircle className="size-4" /> Tanya Admin via WA</a>
                    {project.masked_wa && <span className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-3 py-2 font-mono text-xs text-ink-3"><Eye className="size-3" /> {project.masked_wa}</span>}
                  </div>
                </div>
              </div>

              {/* Invoices — DP & Pelunasan */}
              {list.length ? (
                <div className="space-y-4">
                  {list.map(inv => {
                    const meta = kindMeta(inv.kind);
                    const isPaid = inv.status==='paid';
                    const isDp = inv.kind==='dp';
                    return (
                    <div key={inv.number} className="rounded-2xl border border-line bg-card p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="flex items-center gap-2 text-sm font-bold text-ink"><span className="text-base">{meta.icon}</span> {meta.label} <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${meta.color}`}>{inv.kind.toUpperCase()}</span></h3>
                          <p className="mt-1 font-mono text-xs text-ink-4">{inv.number} • {meta.desc}</p>
                        </div>
                        <Badge tone={isPaid?'green': inv.payment_status==='pending'?'amber':'slate'}>{isPaid?'LUNAS': inv.payment_status?.toUpperCase() ?? inv.status.toUpperCase()}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]"><p className="text-xs text-ink-4">Total {isDp?'DP 50%': inv.kind==='final'?'Pelunasan 50%':'Tagihan'}</p><p className="font-mono font-bold text-ink">{formatIDR(inv.total)}</p><p className="text-xs text-ink-4">Subtotal {formatIDR(inv.amount)} + PPN 11% {formatIDR(inv.tax)}</p></div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]"><p className="text-xs text-ink-4">Jatuh tempo</p><p className="font-mono font-bold text-ink">{inv.due_date ? formatDate(inv.due_date) : '-'}</p>{inv.paid_at && <p className="font-mono text-xs text-emerald-600">Lunas {formatDate(inv.paid_at)}</p>}</div>
                      </div>
                       <div className="mt-3 flex items-center gap-2 text-xs">
                        <a href={(inv as any).pdfUrl ?? `/invoice/${project.order_code}/pdf?invoice=${inv.number}`} target="_blank" className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:underline dark:text-slate-300"><FileText className="size-3.5" /> Lihat Invoice PDF</a>
                        <span className="text-slate-300">•</span>
                        <a href={(inv as any).pdfUrl ?? `/invoice/${project.order_code}/pdf?invoice=${inv.number}`} target="_blank" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"><ExternalLink className="size-3" /> Cetak PDF</a>
                      </div>

                       {!isPaid && inv.paymentUrl && (
                        <div className={`mt-4 rounded-xl border p-4 ${isDp ? 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10' : 'border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10'}`}>
                          <p className={`text-sm font-bold ${isDp?'text-amber-800 dark:text-amber-300':'text-violet-800 dark:text-violet-300'}`}>{isDp?'Siap bayar DP via QRIS':'Siap pelunasan via QRIS'}</p>
                          <p className={`mt-1 text-xs leading-relaxed ${isDp?'text-amber-700/80 dark:text-amber-200/70':'text-violet-700/80 dark:text-violet-200/70'}`}>Klik tombol di bawah untuk buka halaman pembayaran Midtrans (QRIS, Gopay, VA). Link QRIS valid ~14 menit, bisa refresh.</p>
                          <form method="POST" action={`/track/${project.order_code}/pay`} onSubmit={() => trackEvent('snap_pay_initiate', { code: project.order_code, kind: inv.kind, amount: inv.total })} className="mt-3">
                            <input type="hidden" name="_token" value={(document.querySelector('meta[name=csrf-token]') as HTMLMetaElement)?.content ?? ''} />
                            <button type="submit" className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white ${isDp?'bg-amber-600 hover:bg-amber-700':'bg-violet-600 hover:bg-violet-700'}`}><CreditCard className="size-4" /> Bayar {isDp?'DP':'Pelunasan'} — {formatIDR(inv.total)}</button>
                          </form>
                          <a href={inv.paymentUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent('snap_pay_open', { code: project.order_code, kind: inv.kind })} className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline ${isDp?'text-amber-700':'text-violet-700'}`}><ExternalLink className="size-3" /> Buka link langsung (vtweb)</a>
                        </div>
                      )}
                      {!isPaid && !inv.paymentUrl && (
                        <form method="POST" action={`/track/${project.order_code}/pay`} onSubmit={() => trackEvent('snap_pay_generate', { code: project.order_code, kind: inv.kind, amount: inv.total })} className="mt-4">
                          <input type="hidden" name="_token" value={(document.querySelector('meta[name=csrf-token]') as HTMLMetaElement)?.content ?? ''} />
                          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"><CreditCard className="size-4" /> Generate Link Bayar QRIS — {formatIDR(inv.total)}</button>
                        </form>
                      )}
                      {isPaid && <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle2 className="size-4" /> Pembayaran {isDp?'DP':'pelunasan'} diterima — terima kasih!</p>}
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-line bg-card p-6 text-center text-sm text-ink-3">Belum ada invoice untuk pesanan ini.</div>
              )}

              <div className="rounded-xl border border-line bg-card p-4 text-center text-xs text-ink-4">
                Simpan kode <span className="font-mono font-bold text-ink">{project.order_code}</span> untuk cek lagi nanti. Link pantau: <span className="font-mono">{typeof window!=='undefined' ? window.location.origin+'/pantau-pesanan?code='+project.order_code : ''}</span>
              </div>
            </motion.div>
          )}

          {!project && !notFound && (
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-dashed border-line bg-card p-6 text-center">
              <Truck className="mx-auto size-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-ink">Belum cari? Masukkan kode di atas.</p>
              <p className="mt-1 text-xs text-ink-4">Atau hubungi admin WA untuk minta kode.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}