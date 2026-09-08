import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    wide?: boolean;
}

export function Modal({ open, onClose, title, description, children, wide }: ModalProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        if (open) {
            document.addEventListener('keydown', onKey);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
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
                            'relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-card shadow-2xl shadow-slate-900/10 sm:rounded-2xl dark:border-white/[0.08] dark:bg-elev dark:shadow-[0_32px_80px_-24px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.05)]',
                            wide ? 'sm:max-w-3xl' : 'sm:max-w-lg',
                        )}
                    >
                        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-hairline bg-card/95 px-6 py-4 backdrop-blur dark:bg-elev/95">
                            <div>
                                <h2 className="font-bold text-ink">{title}</h2>
                                {description && <p className="mt-0.5 text-xs text-ink-3">{description}</p>}
                            </div>
                            <button
                                onClick={onClose}
                                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-4 transition-colors hover:bg-hover hover:text-ink"
                                aria-label="Tutup dialog"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="px-6 py-5">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
