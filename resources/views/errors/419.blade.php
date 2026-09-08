@extends('errors.layout')

@section('code', '419')
@section('label', '419 — SESI KADALUARSA')
@section('title', "Sesi kamu\nsudah kadaluarsa")
@section('desc', 'Demi keamanan, sesi ini sudah habis. Refresh halaman dan coba lagi — data kamu tetap aman.')
@section('badge', 'raycode — session expired')
@section('filename', '~/raycode • session.log')
@section('icon-label', 'Sesi habis')
@section('terminal-footer', '419 • Session expired • raycode.dev')
@section('bottom-pill', 'Refresh & coba lagi')

@section('digits')
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">4</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">1</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">9</span>
@endsection

@section('icon')
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
@endsection

@section('terminal')
<div class="p-4 font-mono text-[12px] leading-6 text-sky-100/85">
    <p class="text-sky-300">// session</p>
    <p><span class="text-slate-400">POST</span> <span class="text-amber-200">{{ request()->path() === '/' ? '/' : '/' . request()->path() }}</span> <span class="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300 ring-1 ring-amber-400/20">→ 419 Expired</span></p>
    <p class="text-slate-400">CSRF token tidak cocok atau sesi habis. Muat ulang halaman.</p>
    <div class="mt-3 flex gap-1.5 font-mono text-[10px]"><span class="rounded bg-white/10 px-2 py-1 text-sky-200">raycode@web:~$</span><span class="rounded bg-amber-400/15 px-2 py-1 text-amber-300 ring-1 ring-amber-400/20">expired</span></div>
</div>
@endsection

@section('primary-cta')
<a href="javascript:window.location.reload()" class="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#0a2e8a] shadow-[0_12px_32px_-12px_rgb(255_255_255/.6),0_4px_12px_rgb(0_0_0/.2)] hover:-translate-y-0.5 transition">
    Muat Ulang
</a>
@endsection

@section('secondary-cta')
<a href="/" class="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/15 transition">
    Kembali ke Beranda
</a>
@endsection
