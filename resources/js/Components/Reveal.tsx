import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Direction = 'up' | 'left' | 'right';

interface RevealProps {
    children: ReactNode;
    className?: string;
    /** Stagger delay in ms. */
    delay?: number;
    direction?: Direction;
    as?: keyof HTMLElementTagNameMap;
    /** Render visible immediately. Use for above-the-fold LCP content. */
    priority?: boolean;
}

/**
 * Scroll-reveal wrapper. A single shared IntersectionObserver (see app.tsx)
 * watches every `[data-reveal]` node and toggles `.is-visible`, so this stays
 * cheap even with hundreds of instances on one page.
 */
export function Reveal({ children, className, delay = 0, direction = 'up', as: Tag = 'div', priority = false }: RevealProps) {
    const dirClass = direction === 'left' ? 'reveal-left' : direction === 'right' ? 'reveal-right' : '';

    return (
        <Tag
            data-reveal={priority ? undefined : true}
            style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
            className={cn('reveal', dirClass, priority && 'is-visible', className)}
        >
            {children}
        </Tag>
    );
}
