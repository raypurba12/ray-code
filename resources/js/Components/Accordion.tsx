import { Plus } from 'lucide-react';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AccordionType = 'single' | 'multiple';

interface AccordionState {
    type: AccordionType;
    openItems: string[];
    toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionState>({
    type: 'single',
    openItems: [],
    toggle: () => {},
});

const ItemValueContext = createContext<string>('');

export function Accordion({
    type = 'single',
    collapsible = true,
    defaultValue,
    className,
    children,
}: {
    type?: AccordionType;
    collapsible?: boolean;
    defaultValue?: string[];
    className?: string;
    children: ReactNode;
}) {
    const [openItems, setOpenItems] = useState<string[]>(defaultValue ?? []);

    const toggle = (value: string) => {
        setOpenItems((current) => {
            if (current.includes(value)) {
                return collapsible ? current.filter((v) => v !== value) : current;
            }
            return type === 'single' ? [value] : [...current, value];
        });
    };

    return (
        <AccordionContext.Provider value={{ type, openItems, toggle }}>
            <div className={cn('divide-y divide-hairline dark:divide-white/[0.06]', className)}>{children}</div>
        </AccordionContext.Provider>
    );
}

export function AccordionItem({ value, className, children }: { value: string; className?: string; children: ReactNode }) {
    return (
        <ItemValueContext.Provider value={value}>
            <div className={className}>{children}</div>
        </ItemValueContext.Provider>
    );
}

export function AccordionTrigger({ className, children }: { className?: string; children: ReactNode }) {
    const value = useContext(ItemValueContext);
    const { openItems, toggle } = useContext(AccordionContext);
    const isOpen = openItems.includes(value);

    return (
        <button
            onClick={() => toggle(value)}
            aria-expanded={isOpen}
            className={cn(
                'group flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-semibold text-ink transition-colors hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300',
                isOpen && 'text-brand-700 dark:text-brand-300',
                className,
            )}
        >
            {children}
            <span
                className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-4 transition-all duration-300 dark:border-white/15',
                    'group-hover:border-brand-300 group-hover:text-brand-600 dark:group-hover:border-brand-500/40 dark:group-hover:text-brand-400',
                    isOpen && 'rotate-45 border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-400',
                )}
            >
                <Plus className="size-4" />
            </span>
        </button>
    );
}

export function AccordionContent({ className, children }: { className?: string; children: ReactNode }) {
    const value = useContext(ItemValueContext);
    const { openItems } = useContext(AccordionContext);
    const isOpen = openItems.includes(value);

    return (
        <div
            className={cn(
                'grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
        >
            <div className="overflow-hidden">
                <div className={cn('pr-10 pb-5 text-sm leading-relaxed text-slate-600', className)}>{children}</div>
            </div>
        </div>
    );
}
