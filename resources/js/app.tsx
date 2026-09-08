import { createInertiaApp } from '@inertiajs/react';
import type { ResolvedComponent } from '@inertiajs/react';
import { createRoot, type Root } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import '../css/app.css';
import { LanguageProvider } from './lib/i18n';

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
 */
function initRevealEngine(): void {
    if (typeof window === 'undefined') return;

    // Arm the hidden state only when JS is running (SSR HTML stays visible).
    document.documentElement.classList.add('js-reveal');

    const io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            }
        },
        { rootMargin: '0px 0px -5% 0px', threshold: 0.08 },
    );

    const observeAll = (root: ParentNode) => {
        root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((el) => {
            if (!el.classList.contains('reveal')) el.classList.add('reveal');
            io.observe(el);
        });
    };

    observeAll(document.body);

    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches('[data-reveal]') && !node.classList.contains('is-visible')) {
                    node.classList.add('reveal');
                    io.observe(node);
                }
                if (node.querySelector?.('[data-reveal]')) observeAll(node);
            });
        }
    }).observe(document.body, { childList: true, subtree: true });

    // Inertia swaps page content without full reloads — re-scan after each visit.
    document.addEventListener('inertia:navigate', () => {
        requestAnimationFrame(() => observeAll(document.body));
    });
}

createInertiaApp({
    title: (title) => (title ? `${title} — Raycode` : 'Raycode — Studio Pengembangan Web'),
    resolve: (name) => resolveComponent(name),
    setup({ el, App, props }) {
        if (!el) return;
        const root: Root = createRoot(el);
        root.render(
            <LanguageProvider>
                <App {...props} />
            </LanguageProvider>,
        );
    },
    progress: {
        color: '#2563eb',
        showSpinner: false,
    },
});

initRevealEngine();
