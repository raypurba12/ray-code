'use client';

import { createContext, lazy, Suspense, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ConfirmVariant } from './ConfirmModal';

const ConfirmModal = lazy(() => import('./ConfirmModal').then((module) => ({ default: module.ConfirmModal })));

export interface ConfirmOptions {
    title: string;
    description?: string;
    variant?: ConfirmVariant;
    confirmLabel?: string;
    cancelLabel?: string;
    wide?: boolean;
    children?: ReactNode;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [modalState, setModalState] = useState<{
        open: boolean;
        options: ConfirmOptions | null;
        resolve: ((value: boolean) => void) | null;
    }>({
        open: false,
        options: null,
        resolve: null,
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setModalState({
                open: true,
                options,
                resolve,
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (modalState.resolve) {
            modalState.resolve(true);
        }
        setModalState({ open: false, options: null, resolve: null });
    }, [modalState.resolve]);

    const handleCancel = useCallback(() => {
        if (modalState.resolve) {
            modalState.resolve(false);
        }
        setModalState({ open: false, options: null, resolve: null });
    }, [modalState.resolve]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {modalState.options && (
                <Suspense fallback={null}>
                    <ConfirmModal
                        open={modalState.open}
                        onClose={handleCancel}
                        onConfirm={handleConfirm}
                        title={modalState.options.title}
                        description={modalState.options.description}
                        variant={modalState.options.variant}
                        confirmLabel={modalState.options.confirmLabel}
                        cancelLabel={modalState.options.cancelLabel}
                        wide={modalState.options.wide}
                    >
                        {modalState.options.children}
                    </ConfirmModal>
                </Suspense>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
}