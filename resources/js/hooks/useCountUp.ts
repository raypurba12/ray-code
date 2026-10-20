import { useEffect, useRef, useState } from 'react';

const reducedMotion =
    typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);

/** Counts up to `target` the first time the attached element scrolls into view. */
export function useCountUp<T extends HTMLElement>(target: number, durationMs = 1400) {
    const ref = useRef<T | null>(null);
    const [value, setValue] = useState(reducedMotion ? target : 0);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const start = () => {
            if (started.current) return;
            started.current = true;

            const begin = performance.now();
            const tick = (now: number) => {
                const progress = Math.min((now - begin) / durationMs, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setValue(Math.round(target * eased));
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };

        // Fallback: reveal + count even if IntersectionObserver never fires
        // (throttled on mobile, or element inside a content-visibility subtree).
        const inView = () => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
        };
        let ticking = false;
        const onViewportChange = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                if (inView()) start();
            });
        };
        window.addEventListener('scroll', onViewportChange, { passive: true });
        window.addEventListener('resize', onViewportChange, { passive: true });

        let io: IntersectionObserver | null = null;
        if (typeof IntersectionObserver !== 'undefined') {
            io = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) start();
                },
                { threshold: 0.4 },
            );
            io.observe(el);
        }

        window.setTimeout(() => {
            if (inView()) start();
        }, 2600);

        return () => {
            window.removeEventListener('scroll', onViewportChange);
            window.removeEventListener('resize', onViewportChange);
            io?.disconnect();
        };
    }, [target, durationMs]);

    return { ref, value };
}
