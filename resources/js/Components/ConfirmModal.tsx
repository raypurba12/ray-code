'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ConfirmVariant = 'danger' | 'warning' | 'primary' | 'info';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description?: string;
    variant?: ConfirmVariant;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    wide?: boolean;
    children?: ReactNode;
}

const VARIANT_CONFIG: Record<ConfirmVariant, { icon: React.FC<{ className?: string }>; color: string; bg: string; border: string }> = {
    danger: {
        icon: AlertTriangle,
        color: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-950/30',
        border: 'border-red-500/20 dark:border-red-500/30',
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-500/20 dark:border-amber-500/30',
    },
    primary: {
        icon: CheckCircle2,
        color: 'text-brand-500',
        bg: 'bg-brand-50 dark:bg-brand-950/30',
        border: 'border-brand-500/20 dark:border-brand-500/30',
    },
    info: {
        icon: AlertTriangle,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-500/20 dark:border-blue-500/30',
    },
};

const CONFIRM_LABELS: Record<ConfirmVariant, string> = {
    danger: 'Hapus',
    warning: 'Lanjutkan',
    primary: 'Konfirmasi',
    info: 'OK',
};

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    variant = 'danger',
    confirmLabel,
    cancelLabel = 'Batal',
    loading = false,
    wide = false,
    children,
}: ConfirmModalProps) {
    const config = VARIANT_CONFIG[variant];
    const Icon = config.icon;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onClose();
        };
        if (open) {
            document.addEventListener('keydown', onKey);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose, loading]);

    const handleConfirm = async () => {
        if (loading) return;
        await onConfirm();
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm dark:bg-black/60"
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        initial={{ opacity: 0, y: 32, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                            'relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-card shadow-2xl shadow-slate-900/10 sm:rounded-2xl dark:bg-elev dark:shadow-[0_32px_80px_-24px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.05)]',
                            wide ? 'sm:max-w-3xl' : 'sm:max-w-lg',
                        )}
                    >
                        <div className={cn(
                            'sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-hairline px-6 py-4',
                            config.bg, config.border
                        )}>
                            <div className="flex items-start gap-3">
                                <div className={cn('mt-0.5 size-6 shrink-0 flex-none', config.color)}>
                                    <Icon className="size-6" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-ink">{title}</h2>
                                    {description && <p className="mt-0.5 text-xs text-ink-3">{description}</p>}
                                </div>
                            </div>
                            <button
                                onClick={loading ? undefined : onClose}
                                disabled={loading}
                                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-4 transition-colors hover:bg-hover hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Tutup dialog"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="px-6 py-5">{children}</div>
                        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-hairline bg-card/95 px-6 py-4 backdrop-blur dark:bg-elev/95">
                            <button
                                onClick={loading ? undefined : onClose}
                                disabled={loading}
                                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink transition-colors hover:bg-hover hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className={cn(
                                    'flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                                    variant === 'danger'
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : variant === 'warning'
                                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                                        : variant === 'primary'
                                        ? 'bg-brand-500 text-white hover:bg-brand-600'
                                        : 'bg-brand-500 text-white hover:bg-brand-600',
                                )}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    confirmLabel ?? CONFIRM_LABELS[variant]
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}