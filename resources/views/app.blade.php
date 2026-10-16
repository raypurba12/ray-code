<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#090b11" media="(prefers-color-scheme: dark)" />
    <title inertia>{{ $page['props']['title'] ?? 'Raycode — Studio Pengembangan Web' }}</title>
    <meta name="description" content="Raycode — studio pengembangan web premium. Pembuatan website, web app, debugging, code review, konsultasi & dukungan teknis." />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/ray.png?v=3" type="image/png" sizes="any" />
    <link rel="apple-touch-icon" href="/ray.png?v=3" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="dns-prefetch" href="https://app.midtrans.com" />
    <link rel="dns-prefetch" href="https://app.sandbox.midtrans.com" />
    <link rel="preload" as="image" href="/images/pp-800.webp" imagesrcset="/images/pp-800.webp 800w, /images/pp.webp 1086w" imagesizes="(min-width: 1024px) 620px, 100vw" type="image/webp" media="(min-width: 1024px)" fetchpriority="high" />
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=JetBrains+Mono:wght@500&display=swap&subset=latin"
        rel="stylesheet"
        media="print"
        onload="this.media='all'"
    />
    <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=JetBrains+Mono:wght@500&display=swap&subset=latin" rel="stylesheet" />
    </noscript>
    <script>
        (function() {
            try {
                var stored = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {}
        })();
    </script>
    {{-- GA4 + Plausible (P0-4) — hanya load jika GA_MEASUREMENT_ID / PLAUSIBLE_DOMAIN diisi, hormati cookie_consent --}}
    @php
        $gaId = config('services.analytics.ga_measurement_id');
        $plausibleDomain = config('services.analytics.plausible_domain');
        $gav = config('services.analytics.google_verification');
    @endphp
    @if($gav)<meta name="google-site-verification" content="{{ $gav }}" />@endif
    @if($gaId)
    <script>
        // consent_mode default denied (UU PDP) — di-update ke granted saat user klik Terima di CookieConsent
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', wait_for_update: 500 });
        // jika user sudah pernah grant, langsung update
        try { if (localStorage.getItem('cookie_consent') === 'granted') { gtag('consent','update',{ad_storage:'granted', analytics_storage:'granted'}); } } catch(e) {}
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '{{ $gaId }}', { anonymize_ip: true });
    </script>
    @endif
    @if($plausibleDomain)
    <script defer data-domain="{{ $plausibleDomain }}" src="https://plausible.io/js/script.js"></script>
    @endif
    <script
        src="{{ config('midtrans.is_production') ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js' }}"
        data-client-key="{{ config('midtrans.client_key') }}"
        async
    ></script>
    @viteReactRefresh
    @inertiaHead
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="bg-base font-sans antialiased text-ink selection:bg-brand-600 selection:text-white">
    @inertia
</body>
</html>