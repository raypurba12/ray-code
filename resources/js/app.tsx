import { createInertiaApp } from '@inertiajs/react';
import type { ResolvedComponent } from '@inertiajs/react';
import { createRoot, type Root } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import '../css/app.css';
import { LanguageProvider } from './lib/i18n';
import { ConfirmProvider } from './Components/useConfirm';

const pages = import.meta.glob('./Pages/**/*.tsx');

/**
 * Runtime note: Inertia accepts either a component or a `{ default }` module
 * namespace from the resolver, so this cast is sound even though the two
 * typings don't overlap perfectly.
 */
const resolveComponent = (name: string): Promise<ResolvedComponent> =>
    resolvePageComponent(`./Pages/${name}.tsx`, pages) as unknown as Promise<ResolvedComponent>;

/**
 * Shared scroll-reveal engine.
 * One IntersectionObserver + one MutationObserver for the entire app:
 * any element with [data-reveal] (including nodes added by Inertia page
 * navigations) is observed once and animated in when it enters the viewport.
 *
 * Mobile hardening: observers are treated as an enhancement, never as the
 * only way content can become visible. A scroll/resize fallback plus
 * watchdogs guarantee that `[data-reveal]` content is revealed even when
 * IntersectionObserver is missing, is silently throttled (Chrome Android
 * during compositor scroll), or never fires because the element sits inside
 * a `content-visibility: auto` subtree.
 */
function initRevealEngine(): void {
    if (typeof window === 'undefined') return;

    // Reduced motion: keep every element visible and skip the choreography.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;

    // Arm the hidden state only when JS is running (SSR HTML stays visible).
    document.documentElement.classList.add('js-reveal');

    const pending = new Set<HTMLElement>();
    let revealedCount = 0;
    let io: IntersectionObserver | null = null;

    const reveal = (el: HTMLElement) => {
        el.classList.add('reveal', 'is-visible');
        pending.delete(el);
        revealedCount++;
        io?.unobserve(el);
    };

    const inViewport = (el: HTMLElement, offset = 0.06) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight * (1 - offset) && rect.bottom > 0;
    };

    const checkPending = () => {
        for (const el of pending) {
            if (inViewport(el)) reveal(el);
        }
    };

    if (typeof IntersectionObserver !== 'undefined') {
        try {
            io = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) reveal(entry.target as HTMLElement);
                    }
                },
                { rootMargin: '0px 0px -5% 0px', threshold: 0.08 },
            );
        } catch {
            io = null;
        }
    }

    const observeAll = (root: ParentNode) => {
        root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((el) => {
            el.classList.add('reveal');
            pending.add(el);
            io?.observe(el);
        });
    };

    observeAll(document.body);

    // Fallback that does not depend on IntersectionObserver semantics:
    // whenever the user scrolls or the viewport changes, reveal anything
    // that has entered the viewport.
    let ticking = false;
    const onViewportChange = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            checkPending();
        });
    };
    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange, { passive: true });
    window.addEventListener('load', onViewportChange);
    window.addEventListener('pageshow', onViewportChange);

    // Watchdog: if the observer never delivered (broken/throttled), keep the
    // page usable by revealing everything that is on screen — and, if the
    // whole engine produced nothing at all, reveal all pending nodes.
    window.setTimeout(checkPending, 2500);
    window.setTimeout(() => {
        if (revealedCount === 0 && pending.size > 0) {
            for (const el of [...pending]) reveal(el);
        }
    }, 6000);

    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches('[data-reveal]') && !node.classList.contains('is-visible')) {
                    node.classList.add('reveal');
                    pending.add(node);
                    io?.observe(node);
                }
                if (node.querySelector?.('[data-reveal]')) observeAll(node);
            });
        }
        onViewportChange();
    }).observe(document.body, { childList: true, subtree: true });

    // Inertia swaps page content without full reloads — re-scan after each visit.
    document.addEventListener('inertia:navigate', () => {
        requestAnimationFrame(() => {
            observeAll(document.body);
            checkPending();
        });
    });
}

/**
 * Touch feedback for pointer-only effects (spotlight glow, service card fill).
 * Tapping a card marks it for a moment so the premium hover states are also
 * experienced on touchscreens, without hijacking navigation.
 */
function initTouchFeedback(): void {
    if (typeof window === 'undefined') return;
    if (!('PointerEvent' in window)) return;
    if (!(window.matchMedia?.('(hover: none)')?.matches ?? false)) return;

    const timers = new WeakMap<HTMLElement, number>();
    const mark = (el: HTMLElement, className: string, ttl: number) => {
        el.classList.add(className);
        const prev = timers.get(el);
        if (prev) window.clearTimeout(prev);
        timers.set(
            el,
            window.setTimeout(() => {
                el.classList.remove(className);
                timers.delete(el);
            }, ttl),
        );
    };

    document.addEventListener(
        'pointerdown',
        (event) => {
            if (event.pointerType !== 'touch') return;
            const target = event.target as HTMLElement | null;
            if (!target?.closest) return;

            const card = target.closest<HTMLElement>('.service-card-hover, .service-card-hover-light');
            if (card) mark(card, 'is-touch', 900);

            const spot = target.closest<HTMLElement>('.spotlight-card');
            if (spot) {
                const rect = spot.getBoundingClientRect();
                spot.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
                spot.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
                mark(spot, 'is-lit', 900);
            }
        },
        { passive: true },
    );
}

createInertiaApp({
    title: (title) => (title ? `${title} — Raycode` : 'Raycode — Studio Pengembangan Web'),
    resolve: (name) => resolveComponent(name),
    setup({ el, App, props }) {
        if (!el) return;
        const root: Root = createRoot(el);
        root.render(
            <ConfirmProvider><LanguageProvider>
                <App {...props} />
            </LanguageProvider></ConfirmProvider>,
        );
    },
    progress: {
        color: '#2563eb',
        showSpinner: false,
    },
});

initRevealEngine();
initTouchFeedback();
