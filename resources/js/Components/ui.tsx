import { cn } from '@/lib/utils';
import type { Invoice, Project } from '@/types';
import { Link } from '@inertiajs/react';
import { HelpCircle, Star } from 'lucide-react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

/* ── Button ──────────────────────────────────────────────── */
export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
export type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
    secondary:
        'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    ghost:
        'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
    danger:
        'border border-red-200 bg-white text-red-600 shadow-sm hover:bg-red-50 focus-visible:outline-red-500 dark:border-red-800 dark:bg-slate-900 dark:text-red-400',
    dark: 'bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 active:scale-[0.98] dark:bg-brand-500 dark:hover:bg-brand-600',
};

const sizeClasses: Record<Size, string> = {
    sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
    md: 'h-11 px-5 text-sm gap-2 rounded-xl',
    lg: 'h-13 px-7 text-base gap-2 rounded-xl',
};

interface BaseProps {
    variant?: Variant;
    size?: Size;
    className?: string;
    children: ReactNode;
}

function classes({ variant = 'primary', size = 'md', className }: Omit<BaseProps, 'children'>) {
    return cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-busy:pointer-events-none aria-busy:opacity-70',
        variantClasses[variant],
        sizeClasses[size],
        className,
    );
}

export function Button({
    variant,
    size,
    className,
    children,
    ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button className={classes({ variant, size, className })} {...props}>
            {children}
        </button>
    );
}

export function ButtonLink({
    href,
    variant,
    size,
    className,
    children,
}: BaseProps & { href: string }) {
    return (
        <Link href={href} className={classes({ variant, size, className })}>
            {children}
        </Link>
    );
}

/* ── Card ────────────────────────────────────────────────── */
export function Card({
    className,
    hover = false,
    children,
}: {
    className?: string;
    hover?: boolean;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
                hover && 'transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700',
                className,
            )}
        >
            {children}
        </div>
    );
}

/* ── Badge / Eyebrow ─────────────────────────────────────── */
export function Badge({
    className,
    tone = 'blue',
    children,
}: {
    className?: string;
    tone?: 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'violet';
    children: ReactNode;
}) {
    const tones = {
        blue: 'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/25',
        green: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
        amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25',
        red: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/25',
        slate: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
        violet: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/25',
    };
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                tones[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
    return (
        <p
            className={cn(
                'mb-4 font-mono text-xs font-medium tracking-[0.22em] uppercase',
                light ? 'text-brand-300' : 'text-brand-600 dark:text-brand-400',
            )}
        >
            {'// '}
            {children}
        </p>
    );
}

/* ── Section heading ─────────────────────────────────────── */
export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
    light = false,
    className,
}: {
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    align?: 'left' | 'center';
    light?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'max-w-2xl',
                align === 'center' && 'mx-auto text-center',
                className,
            )}
        >
            {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
            <h2
                className={cn(
                    'text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]',
                    light ? 'text-white' : 'text-ink',
                )}
            >
                {title}
            </h2>
            {description && (
                <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', light ? 'text-slate-400' : 'text-ink-2')}>
                    {description}
                </p>
            )}
        </div>
    );
}

/* ── Form fields ─────────────────────────────────────────── */
const fieldClasses =
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white dark:focus:ring-white/10';

export function HelpTooltip({ text }: { text: string }) {
    return (
        <span className="group relative inline-flex items-center ml-1.5 cursor-help text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <HelpCircle className="size-3.5" />
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-52 rounded-lg bg-slate-900 px-2.5 py-1.5 text-left text-xs font-normal text-white shadow-xl group-hover:block dark:bg-slate-800 dark:text-slate-100 z-50 border border-slate-700">
                {text}
            </span>
        </span>
    );
}

function FieldLabel({ label, required, hint, tooltip }: { label?: string; required?: boolean; hint?: string; tooltip?: string }) {
    if (!label) return null;
    return (
        <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
                {required && <span className="ml-1 text-red-500 font-bold" title="Wajib diisi">*</span>}
                {tooltip && <HelpTooltip text={tooltip} />}
            </span>
            {hint && <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{hint}</span>}
        </div>
    );
}

function FieldError({ error }: { error?: string }) {
    if (!error) return null;
    return <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>;
}

export interface FormFieldExtraProps {
    label?: string;
    error?: string;
    hint?: string;
    tooltip?: string;
    required?: boolean;
}

export function Input({ label, error, hint, tooltip, required, className, ...props }: InputHTMLAttributes<HTMLInputElement> & FormFieldExtraProps) {
    const isRequired = required ?? props.required;
    return (
        <label className="block">
            <FieldLabel label={label} required={isRequired} hint={hint} tooltip={tooltip} />
            <input className={cn(fieldClasses, error && 'border-red-300 focus:ring-red-100 dark:border-red-600', className)} {...props} />
            <FieldError error={error} />
        </label>
    );
}

export function Textarea({ label, error, hint, tooltip, required, className, rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & FormFieldExtraProps) {
    const isRequired = required ?? props.required;
    return (
        <label className="block">
            <FieldLabel label={label} required={isRequired} hint={hint} tooltip={tooltip} />
            <textarea rows={rows} className={cn(fieldClasses, 'resize-y', error && 'border-red-300 focus:ring-red-100 dark:border-red-600', className)} {...props} />
            <FieldError error={error} />
        </label>
    );
}

export function Select({ label, error, hint, tooltip, required, className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & FormFieldExtraProps) {
    const isRequired = required ?? props.required;
    return (
        <label className="block">
            <FieldLabel label={label} required={isRequired} hint={hint} tooltip={tooltip} />
            <select className={cn(fieldClasses, 'cursor-pointer', error && 'border-red-300 dark:border-red-600', className)} {...props}>
                {children}
            </select>
            <FieldError error={error} />
        </label>
    );
}

/* ── Status pill ─────────────────────────────────────────── */
export function StatusPill({ status }: { status: Project['status'] | Invoice['status'] }) {
    const map: Record<string, { tone: Parameters<typeof Badge>[0]['tone']; label: string }> = {
        pending: { tone: 'amber', label: 'Pending Review' },
        in_review: { tone: 'violet', label: 'In Review' },
        in_progress: { tone: 'blue', label: 'In Progress' },
        review: { tone: 'amber', label: 'Client Review' },
        completed: { tone: 'green', label: 'Completed' },
        cancelled: { tone: 'slate', label: 'Cancelled' },
        unpaid: { tone: 'red', label: 'Unpaid' },
        paid: { tone: 'green', label: 'Paid' },
    };

    const config = map[status];
    return <Badge tone={config.tone}>{config.label}</Badge>;
}

/* ── Avatar (initials, zero network requests) ────────────── */
export function Avatar({ name, className }: { name: string; className?: string }) {
    const letters = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    const palette = [
        'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
        'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    ];
    const color = palette[name.length % palette.length];
    return (
        <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full text-xs font-bold select-none', color, className ?? 'size-9')}>
            {letters}
        </span>
    );
}

/* ── Stars ───────────────────────────────────────────────── */
export function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={cn('size-4', i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700/60 dark:text-slate-700/60')} />
            ))}
        </div>
    );
}

/* ── Empty state ─────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-alt/60 px-6 py-14 text-center dark:bg-white/[0.02]">
            {icon && <div className="mb-3 flex size-12 items-center justify-center rounded-xl border border-line bg-card text-ink-3 shadow-sm dark:bg-elev dark:text-slate-400">{icon}</div>}
            <h3 className="font-semibold text-ink">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-ink-3">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
