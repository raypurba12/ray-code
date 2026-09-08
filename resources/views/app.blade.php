<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#090b11" media="(prefers-color-scheme: dark)" />
    <title inertia>{{ $page['props']['title'] ?? 'Raycode — Studio Pengembangan Web' }}</title>
    <meta name="description" content="Raycode — studio pengembangan web premium. Pembuatan website, web app, debugging, code review, konsultasi & dukungan teknis." />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/ray.png?v=2" type="image/png" sizes="any" />
    <link rel="apple-touch-icon" href="/ray.png?v=2" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="image" href="/images/pp.png" media="(min-width: 1024px)" fetchpriority="high" />
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet"
        media="print"
        onload="this.media='all'"
    />
    <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
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
    @viteReactRefresh
    @inertiaHead
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="bg-base font-sans antialiased text-ink selection:bg-brand-600 selection:text-white">
    @inertia
</body>
</html>
