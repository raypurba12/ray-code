import { useEffect, useRef, useState } from 'react';

const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Counts up to `target` the first time the attached element scrolls into view. */
export function useCountUp<T extends HTMLElement>(target: number, durationMs = 1400) {
    const ref = useRef<T | null>(null);
    const [value, setValue] = useState(reducedMotion ? target : 0);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || started.current) return;
                started.current = true;
                io.disconnect();

                const start = performance.now();
                const tick = (now: number) => {
                    const progress = Math.min((now - start) / durationMs, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setValue(Math.round(target * eased));
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            },
            { threshold: 0.4 },
        );

        io.observe(el);
        return () => io.disconnect();
    }, [target, durationMs]);

    return { ref, value };
}
