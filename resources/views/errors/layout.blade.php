<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="#0645c9"/>
    <title>@yield('code', 'Error') — Raycode</title>
    <link rel="icon" href="/ray.png?v=2" type="image/png"/>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
    @vite(['resources/css/app.css'])
    <style>
        *{font-family:'Inter',system-ui,sans-serif}
        .font-mono{font-family:'JetBrains Mono',monospace}
        @keyframes float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-10px,0)}}
        @keyframes glow-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.82;transform:scale(1.02)}}
        @keyframes sheen-anim{0%{transform:translateX(-120%) skewX(-14deg)}100%{transform:translateX(180%) skewX(-14deg)}}
        @keyframes scan{0%{transform:translateY(-60px);opacity:0}20%{opacity:.9}80%{opacity:.9}100%{transform:translateY(60px);opacity:0}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .animate-float{animation:float 7s ease-in-out infinite}
        .animate-glow{animation:glow-pulse 3.4s ease-in-out infinite}
        .animate-scan{animation:scan 2.2s ease-in-out infinite}
    </style>
</head>
<body class="antialiased bg-[#0645c9] text-white selection:bg-white selection:text-[#0a2e8a]">
<div id="hero" class="relative flex min-h-screen flex-col overflow-hidden bg-[#0645c9] [--mx:52%] [--my:30%]">
    {{-- background layers --}}
    <div class="absolute inset-0 bg-[linear-gradient(180deg,#0a4fe0_0%,#0750dd_20%,#0645c9_40%,#0533a3_66%,#04207c_86%,#031a66_100%)]" aria-hidden></div>
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_58%_52%_at_70%_22%,rgb(12_116_235/0.55),transparent_70%)]" aria-hidden></div>
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_52%_48%_at_8%_100%,rgb(2_10_70/0.52),transparent_64%)]" aria-hidden></div>
    <div class="absolute inset-0 opacity-100" style="background-image:linear-gradient(to right,rgb(255 255 255/.055) 1px,transparent 1px),linear-gradient(to bottom,rgb(255 255 255/.055) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(to bottom,transparent,black 12%,black 82%,transparent)" aria-hidden></div>
    <div class="pointer-events-none absolute -top-44 -right-36 size-[720px] rounded-full border border-white/10" aria-hidden></div>
    <div class="pointer-events-none absolute -top-24 -right-16 size-[520px] rounded-full border border-white/[0.07]" aria-hidden></div>
    <div class="pointer-events-none absolute -bottom-56 -left-44 size-[600px] rounded-full border border-white/[0.06]" aria-hidden></div>
    <div id="spotlight" class="pointer-events-none absolute inset-0 hidden sm:block opacity-0 transition-opacity duration-500" style="background:radial-gradient(560px 380px at var(--mx) var(--my),rgb(255 255 255/.08),transparent 68%)" aria-hidden></div>

    {{-- decorations --}}
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <svg class="animate-float absolute top-[14%] left-[3%] w-16 text-white/15 sm:w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9">
            <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/>
        </svg>
        <span class="absolute top-[58%] left-[5%] hidden font-mono text-2xl font-bold text-white/12 select-none sm:block animate-float">&lt;/&gt;</span>
        <span class="absolute bottom-[18%] right-[8%] hidden font-mono text-xl text-white/8 select-none lg:block">{ }</span>
        <span class="absolute top-[10%] right-[28%] size-1.5 rounded-full bg-sky-300/60 animate-glow"></span>
    </div>

    {{-- header --}}
    <header class="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <a href="/" class="inline-flex items-center gap-2.5 group">
            <span class="flex size-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 group-hover:rotate-3 transition"><img src="/ray.png" alt="Raycode" width="36" height="36" class="size-9 object-contain p-1"/></span>
            <span class="font-mono text-lg font-semibold tracking-tight text-white">ray<span class="text-white">code</span></span>
        </a>
        <div class="hidden sm:flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[11px] font-medium tracking-wide text-sky-100 backdrop-blur"><span class="size-1.5 animate-pulse rounded-full bg-emerald-400"></span> ERROR @yield('code')</span>
            <a href="/" class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/15 transition">Beranda</a>
        </div>
    </header>

    {{-- content --}}
    <div class="relative z-10 flex flex-1 items-center">
        <div class="mx-auto grid w-full max-w-7xl gap-10 px-5 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-12">
            {{-- left --}}
            <div>
                <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-sky-200 uppercase backdrop-blur">
                    <span class="size-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgb(253_224_71)]"></span> @yield('label')
                </span>
                <h1 class="mt-5 text-4xl leading-[0.95] font-black tracking-tight text-white sm:text-5xl lg:text-[3.4rem] whitespace-pre-line">@yield('title')</h1>
                <p class="mt-4 max-w-xl text-[15px] leading-relaxed text-blue-100/80 sm:text-base">@yield('desc')</p>
                @hasSection('message')
                    <p class="mt-3 max-w-xl rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-sky-100/80"><span class="text-sky-300">›</span> @yield('message')</p>
                @endif

                <div class="mt-8 flex flex-wrap items-center gap-3">
                    @yield('primary-cta')
                    @yield('secondary-cta')
                </div>

                <div class="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
                    <span class="mr-1 font-mono text-xs text-sky-200/60">Mungkin yang kamu cari:</span>
                    <a href="/services" class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-medium text-sky-100 hover:bg-white/10 hover:text-white transition">Layanan</a>
                    <a href="/portfolio" class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-medium text-sky-100 hover:bg-white/10 hover:text-white transition">Portfolio</a>
                    <a href="/cara-pesan" class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-medium text-sky-100 hover:bg-white/10 hover:text-white transition">Cara Pesan</a>
                    <a href="/faq" class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-medium text-sky-100 hover:bg-white/10 hover:text-white transition">FAQ</a>
                    <a href="/contact" class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-medium text-sky-100 hover:bg-white/10 hover:text-white transition">Kontak</a>
                </div>

                @yield('extra')
            </div>

            {{-- right --}}
            <div class="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:ml-auto">
                <div id="card" class="relative z-10 will-change-transform" style="transition:transform .18s ease-out">
                    <div class="absolute -top-4 left-3 z-20 hidden sm:inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-[#03206e]/90 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_24px_2px_rgb(125_211_252/.2),0_14px_34px_-10px_rgb(0_8_50/.7)]">
                        <span class="size-2 animate-pulse rounded-full bg-emerald-400"></span> @yield('badge')
                    </div>

                    <div class="relative overflow-hidden rounded-[2rem] border border-sky-300/20 bg-[linear-gradient(180deg,rgba(10,73,212,.82),rgba(5,43,145,.78))] p-8 shadow-[0_30px_80px_-20px_rgb(0_6_50/.85)] sm:p-10">
                        <div class="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-sky-300/50 to-transparent"></div>
                        <div class="mb-6 flex items-center gap-2">
                            <span class="size-3 rounded-full bg-red-400"></span><span class="size-3 rounded-full bg-amber-400"></span><span class="size-3 rounded-full bg-emerald-400"></span>
                            <span class="ml-3 font-mono text-xs text-sky-200/70">@yield('filename')</span>
                            <span class="ml-auto rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-100 ring-1 ring-white/15">@yield('code')</span>
                        </div>

                        <div class="relative">
                            <div class="flex items-end justify-center gap-1 sm:gap-2">
                                @yield('digits')
                            </div>
                            @yield('scanline')
                            {{-- glitch duplicates --}}
                            <span aria-hidden class="pointer-events-none absolute inset-0 flex items-end justify-center gap-1 sm:gap-2 opacity-[0.06] mix-blend-screen" style="transform:translate(2px,0);filter:blur(.6px)">@yield('digits')</span>
                            <span aria-hidden class="pointer-events-none absolute inset-0 flex items-end justify-center gap-1 sm:gap-2 opacity-[0.05] mix-blend-screen" style="transform:translate(-2px,0);filter:blur(.8px)">@yield('digits')</span>
                        </div>

                        <div class="mt-6 flex items-center justify-center gap-2.5">
                            <span class="flex size-9 items-center justify-center rounded-xl bg-white/10 text-sky-200 ring-1 ring-white/15">@yield('icon')</span>
                            <span class="font-mono text-xs font-semibold tracking-widest text-sky-200/80 uppercase">@yield('icon-label')</span>
                        </div>

                        <div class="mt-7 overflow-hidden rounded-xl border border-white/10 bg-[#020c3a]/60 backdrop-blur">
                            @yield('terminal')
                            <div class="border-t border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-[11px] text-sky-200/50">@yield('terminal-footer')</div>
                        </div>
                    </div>

                    <div class="absolute -bottom-4 right-6 z-20 hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-xl">
                        <span class="flex size-6 items-center justify-center rounded-full bg-amber-400 text-slate-900">✦</span> @yield('bottom-pill')
                    </div>
                </div>
                <div class="pointer-events-none absolute -top-10 -right-6 size-32 rounded-full bg-sky-400/15 blur-2xl"></div>
                <div class="pointer-events-none absolute -bottom-10 -left-6 size-40 rounded-full bg-blue-500/15 blur-2xl"></div>
            </div>
        </div>
    </div>

    <div class="relative z-10 border-t border-white/10 bg-[#031a66]/40 backdrop-blur">
        <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-4 text-xs text-sky-200/60 sm:flex-row lg:px-8">
            <p class="font-mono">© {{ date('Y') }} Raycode Studio • Crafted with ♥ in Jakarta — Remote-first</p>
            <p class="flex items-center gap-2 font-mono">$ echo "kembali lebih kuat" <span class="hidden sm:inline">• raycode.dev</span></p>
        </div>
    </div>

    {{-- Floating WA — sama kayak PublicLayout, biar tetap bisa chat di halaman error --}}
    @php
        $waRaw = \App\Models\Setting::get('whatsapp', '+6281234567890');
        $waNum = preg_replace('/[^0-9]/', '', $waRaw);
        $waHref = 'https://wa.me/' . $waNum . '?text=Halo%20Raycode%20%F0%9F%91%8B%2C%20saya%20tertarik%20diskusi%20proyek';
    @endphp
    <div class="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-2">
        <div class="relative inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-1.5 text-[11px] font-extrabold tracking-widest text-white shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)] ring-1 ring-white/10">
            <span class="relative flex size-2"><span class="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex size-2 rounded-full bg-emerald-400"></span></span>
            KAMI SIAP 24 JAM
            <span class="absolute -bottom-1 right-6 size-2 rotate-45 bg-slate-900 ring-1 ring-white/10"></span>
        </div>
        <a href="{{ $waHref }}" target="_blank" rel="noreferrer noopener" aria-label="Chat di WhatsApp" class="group flex items-center gap-3">
            <span class="hidden items-center rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:inline-flex translate-x-2 opacity-0">
                Chat di WhatsApp
            </span>
            <span class="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_-8px_rgb(37_211_102/0.6),0_4px_12px_rgb(0_0_0/0.15)] transition-all duration-300 hover:scale-105 active:scale-95 sm:size-[60px]">
                <span class="absolute inset-0 rounded-full bg-[#25D366] opacity-20" style="animation:ping 2s cubic-bezier(0,0,0.2,1) infinite"></span>
                <svg viewBox="0 0 24 24" class="relative size-7 sm:size-8 fill-white"><path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9 1 1-2.9-.2-.3a8.2 8.2 0 1 1 6.6 3.6Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>
                <span class="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"><span class="size-1.5 animate-pulse rounded-full bg-white"></span></span>
            </span>
        </a>
    </div>
</div>

<script>
(function(){
    var hero=document.getElementById('hero');
    var card=document.getElementById('card');
    var spot=document.getElementById('spotlight');
    if(!hero) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var raf=0;
    hero.addEventListener('mousemove',function(e){
        var r=hero.getBoundingClientRect();
        var mx=((e.clientX-r.left)/r.width)*100;
        var my=((e.clientY-r.top)/r.height)*100;
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(function(){
            hero.style.setProperty('--mx',mx+'%');
            hero.style.setProperty('--my',my+'%');
            if(spot) spot.style.opacity='1';
            if(card){
                var dx=(mx-50)*0.12, dy=(my-50)*0.14;
                card.style.transform='perspective(900px) rotateY('+(dx*0.08)+'deg) rotateX('+(-dy*0.06)+'deg)';
            }
        });
    },{passive:true});
    hero.addEventListener('mouseleave',function(){
        if(spot) spot.style.opacity='0';
        if(card) card.style.transform='perspective(900px) rotateY(0) rotateX(0)';
    });
})();
</script>
</body>
</html>
