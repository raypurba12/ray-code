'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode, type Context } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
    action?: { label: string; onClick: () => void };
    persistent?: boolean;
}

interface ToastContextValue {
    toasts: Toast[];
    toast: (toast: Omit<Toast, 'id'>) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
    success: (title: string, description?: string, options?: Partial<Toast>) => string;
    error: (title: string, description?: string, options?: Partial<Toast>) => string;
    warning: (title: string, description?: string, options?: Partial<Toast>) => string;
    info: (title: string, description?: string, options?: Partial<Toast>) => string;
    loading: (title: string, description?: string, options?: Partial<Toast>) => string;
    update: (id: string, toast: Partial<Toast>) => void;
}

const ToastContext: Context<ToastContextValue | null> = createContext(null);

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const ICONS: Record<ToastType, React.FC<{ className?: string }>> = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    loading: Loader2,
};

const COLORS: Record<ToastType, string> = {
    success: 'text-emerald-500 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-500/30',
    error: 'text-red-500 border-red-500/20 bg-red-50 dark:bg-red-950/30 dark:border-red-500/30',
    warning: 'text-amber-500 border-amber-500/20 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-500/30',
    info: 'text-brand-500 border-brand-500/20 bg-brand-50 dark:bg-brand-950/30 dark:border-brand-500/30',
    loading: 'text-brand-500 border-brand-500/20 bg-brand-50 dark:bg-brand-950/30 dark:border-brand-500/30',
};

const DURATIONS: Record<ToastType, number> = {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
    loading: Infinity,
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const dismissAll = useCallback(() => {
        setToasts([]);
    }, []);

    const toast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = generateId();
        const newToast: Toast = {
            id,
            duration: DURATIONS[toast.type],
            persistent: toast.type === 'loading' || toast.persistent,
            ...toast,
        };
        setToasts((prev) => [...prev, newToast]);

        if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
            setTimeout(() => dismiss(id), newToast.duration);
        }
        return id;
    }, [dismiss]);

    const update = useCallback((id: string, patch: Partial<Toast>) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    }, []);

    const helpers = {
        success: (title: string, description?: string, options?: Partial<Toast>) =>
            toast({ type: 'success', title, description, ...options }),
        error: (title: string, description?: string, options?: Partial<Toast>) =>
            toast({ type: 'error', title, description, ...options }),
        warning: (title: string, description?: string, options?: Partial<Toast>) =>
            toast({ type: 'warning', title, description, ...options }),
        info: (title: string, description?: string, options?: Partial<Toast>) =>
            toast({ type: 'info', title, description, ...options }),
        loading: (title: string, description?: string, options?: Partial<Toast>) =>
            toast({ type: 'loading', title, description, persistent: true, ...options }),
    };

    const page = usePage<{ flash?: { success?: string | null; error?: string | null } }>();
    const flash = page?.props?.flash;
    const lastFlash = useRef<{ success?: string | null; error?: string | null }>({});

    useEffect(() => {
        if (flash?.success && flash.success !== lastFlash.current.success) {
            helpers.success(flash.success);
        }
        if (flash?.error && flash.error !== lastFlash.current.error) {
            helpers.error(flash.error);
        }
        lastFlash.current = {
            success: flash?.success ?? null,
            error: flash?.error ?? null,
        };
    }, [flash?.success, flash?.error]);

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll, update, ...helpers }}>
            {children}
            <AnimatePresence>
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                ))}
            </AnimatePresence>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const Icon = ICONS[toast.type];
    const baseClass = 'flex items-start gap-3 rounded-xl border p-4 shadow-xl w-full max-w-md transition-all';
    const colorClass = COLORS[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn('fixed bottom-6 right-6 z-[90] pointer-events-auto', baseClass, colorClass, 'dark:border-white/10 dark:shadow-[0_16px_48px_-12px_rgb(0_0_0/0.7)]')}
            style={{ '--toast-index': 0 }}
        >
            <div className={cn('mt-0.5 size-5 shrink-0 flex-none', toast.type === 'loading' && 'animate-spin')}>
                <Icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-ink dark:text-slate-100">{toast.title}</p>
                {toast.description && (
                    <p className="mt-1 text-xs text-ink-3 dark:text-slate-400">{toast.description}</p>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action?.onClick();
                            if (!toast.persistent) onDismiss(toast.id);
                        }}
                        className="text-xs font-semibold text-current underline-offset-2 hover:underline"
                    >
                        {toast.action.label}
                    </button>
                )}
                {!toast.persistent && (
                    <button
                        onClick={() => onDismiss(toast.id)}
                        className="text-xs font-semibold text-ink-4 transition-colors hover:text-ink dark:hover:text-slate-200"
                    >
                        Tutup
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}