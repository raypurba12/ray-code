import { useEffect, useState } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';
import { denyConsent, getConsent, grantConsent } from '@/lib/analytics';

const CONSENT_KEY = 'cookie_consent';

export function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Tampilkan hanya jika belum ada keputusan
        const c = getConsent();
        if (!c) {
            // delay sedikit agar tidak ganggu LCP
            const t = setTimeout(() => setVisible(true), 1200);
            return () => clearTimeout(t);
        }
    }, []);

    if (!visible) return null;

    const accept = () => {
        grantConsent();
        setVisible(false);
        // reload untuk init GA yang tadi deferred (opsional)
        // window.location.reload(); // tidak perlu, gtag consent update cukup
    };

    const reject = () => {
        denyConsent();
        setVisible(false);
    };

    return (
        <div
            role="dialog"
            aria-label="Persetujuan cookie"
            aria-live="polite"
            className="fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-3xl p-4 sm:p-5"
        >
            <div className="rounded-2xl border border-line bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#101625] dark:shadow-black/40">
                <div className="flex gap-4">
                    <span className="hidden sm:flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                        <Cookie className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-ink dark:text-white">
                            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                            Kami memakai cookie untuk analitik
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-3 dark:text-slate-400">
                            Kami pakai <span className="font-semibold text-ink dark:text-slate-200">GA4</span> &amp; <span className="font-semibold text-ink dark:text-slate-200">Plausible</span> untuk ukur konversi (estimator, contact, pembayaran). Tidak ada iklan. Sesuai <span className="font-semibold">UU PDP</span> — Anda bisa tolak kapan saja. Lihat{' '}
                            <a href="/privacy" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                                Kebijakan Privasi
                            </a>{' '}
                            (akan dibuat di P2-3).
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={accept}
                                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                            >
                                Terima semua
                            </button>
                            <button
                                onClick={reject}
                                className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                                Tolak
                            </button>
                            <a
                                href="/privacy"
                                className="inline-flex items-center justify-center rounded-full px-3 py-2.5 text-xs font-semibold text-ink-3 hover:text-ink dark:text-slate-400"
                            >
                                Pelajari lebih lanjut
                            </a>
                        </div>
                    </div>
                    <button
                        onClick={reject}
                        aria-label="Tutup"
                        className="hidden sm:flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-3 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <p className="mt-3 text-xs text-ink-4 dark:text-slate-500">
                    Pilihan tersimpan di <span className="font-mono">localStorage: cookie_consent</span>. Hapus di DevTools → Application → Local Storage untuk testing ulang.
                </p>
            </div>
        </div>
    );
}

export default CookieConsent;
