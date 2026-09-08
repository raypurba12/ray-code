@extends('errors.layout')

@section('code', '404')
@section('label', '404 — HALAMAN TIDAK DITEMUKAN')
@section('title', "Ups, halaman ini\nngilang ke luar angkasa")
@section('desc', 'Link-nya mungkin typo, sudah dipindah, atau memang belum pernah ada. Tenang — kami bantu kamu balik ke jalur yang benar.')
@section('badge', 'raycode — 404 tracker active')
@section('filename', '~/raycode • lost-page.tsx')
@section('icon-label', 'Halaman menghilang')
@section('terminal-footer', '404 • Halaman tidak ditemukan • raycode.dev')
@section('bottom-pill', 'Eksplor lagi, yuk!')

@section('digits')
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">4</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">0</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">4</span>
@endsection

@section('scanline')
<div class="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent shadow-[0_0_12px_rgb(125_211_252)] animate-scan" aria-hidden></div>
@endsection

@section('icon')
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/><path d="M8 11H14"/><path d="M11 8V14"/></svg>
@endsection

@section('terminal')
<div class="p-4 font-mono text-[12px] leading-6 text-sky-100/85">
    <p class="text-sky-300">// raycode router</p>
    <p><span class="text-slate-400">GET</span> <span class="text-red-300">{{ request()->path() === '/' ? '/' : '/' . request()->path() }}</span> <span class="rounded bg-red-500/15 px-1.5 py-0.5 text-red-300 ring-1 ring-red-400/20">→ 404</span></p>
    <p class="text-slate-400">Tip: cek typo, atau gunakan pencarian di samping.</p>
    <div class="mt-3 flex gap-1.5 font-mono text-[10px]"><span class="rounded bg-white/10 px-2 py-1 text-sky-200">raycode@web:~$</span><span class="rounded bg-emerald-400/15 px-2 py-1 text-emerald-300 ring-1 ring-emerald-400/20">online</span></div>
</div>
@endsection

@section('primary-cta')
<a href="/" class="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#0a2e8a] shadow-[0_12px_32px_-12px_rgb(255_255_255/.6),0_4px_12px_rgb(0_0_0/.2)] hover:-translate-y-0.5 transition">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19L5 12L12 5"/></svg>
    Kembali ke Beranda
</a>
@endsection

@section('secondary-cta')
<a href="/portfolio" class="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/15 transition">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.08 14.08 7.76 16.24 9.92 9.92 16.24 7.76"/></svg>
    Cari Proyek
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M8 7H17V16"/></svg>
</a>
@endsection

@section('extra')
<form onsubmit="event.preventDefault(); var q=this.q.value.trim(); if(q) window.location.href='/portfolio?search='+encodeURIComponent(q);" class="mt-6 flex max-w-md items-center gap-2 rounded-xl border border-white/15 bg-white/10 p-2 backdrop-blur">
    <svg class="ml-3 size-4 shrink-0 text-sky-200/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/></svg>
    <input name="q" placeholder="Cari layanan, portfolio, atau artikel..." class="h-8 flex-1 bg-transparent text-sm text-white placeholder:text-sky-100/50 focus:outline-none"/>
    <button type="submit" class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 text-xs font-bold text-[#0a2e8a] hover:bg-sky-50 transition">Cari <span>→</span></button>
</form>
@endsection
