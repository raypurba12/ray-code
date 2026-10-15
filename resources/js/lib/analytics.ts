// analytics.ts — P0-4 trackEvent helper (GA4 + Plausible)
// Menghormati cookie_consent (UU PDP) — jika ditolak, tidak kirim.

type GtagFn = (...args: any[]) => void;

declare global {
    interface Window {
        gtag?: GtagFn;
        dataLayer?: any[];
        plausible?: (event: string, opts?: { props?: Record<string, any> }) => void;
    }
}

const CONSENT_KEY = 'cookie_consent'; // 'granted' | 'denied' | null

export function hasConsent(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(CONSENT_KEY) === 'granted';
}

export function trackEvent(name: string, props: Record<string, any> = {}): void {
    if (typeof window === 'undefined') return;
    if (!hasConsent()) return; // hormati penolakan

    // GA4
    if (typeof window.gtag === 'function') {
        window.gtag('event', name, props);
    }
    // Plausible
    if (typeof window.plausible === 'function') {
        window.plausible(name, { props });
    }
    // Fallback console di dev (jika tidak ada provider)
    if (!window.gtag && !window.plausible && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('[analytics]', name, props);
    }
}

// Untuk dipanggil saat user grant consent — update GA consent_mode
export function grantConsent(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CONSENT_KEY, 'granted');
    if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
            ad_storage: 'granted',
            analytics_storage: 'granted',
        });
    }
    // dispatch event agar GA yang deferred bisa init
    window.dispatchEvent(new CustomEvent('cookie-consent-granted'));
}

export function denyConsent(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CONSENT_KEY, 'denied');
    if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
        });
    }
}

export function getConsent(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CONSENT_KEY);
}
