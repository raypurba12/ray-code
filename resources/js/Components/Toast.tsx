import { usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Toast() {
    const { flash } = usePage<{ flash: { success: string | null; error: string | null } }>().props;
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true);
        if (flash.success || flash.error) {
            const t = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(t);
        }
    }, [flash.success, flash.error]);

    const message = visible ? (flash.success ?? flash.error) : null;
    const isError = !flash.success && !!flash.error;

    return (
        <>
            {message && (
                <div className="animate-toast-in fixed bottom-6 left-1/2 z-[90] w-full max-w-md -translate-x-1/2 px-4">
                    <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-card p-4 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-elev dark:shadow-[0_16px_48px_-12px_rgb(0_0_0/0.7)]">
                        {isError ? (
                            <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
                        ) : (
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                        )}
                        <p className="text-sm font-medium text-ink dark:text-slate-100">{message}</p>
                        <button
                            onClick={() => setVisible(false)}
                            className="ml-auto text-xs font-semibold text-ink-4 transition-colors hover:text-ink dark:hover:text-slate-200"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
