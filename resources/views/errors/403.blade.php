@extends('errors.layout')

@section('code', '403')
@section('label', '403 — AKSES DITOLAK')
@section('title', "Waduh, area ini\nkhusus kru terlarang")
@section('desc', 'Kamu tidak punya izin untuk membuka halaman ini. Kalau merasa ini salah, hubungi admin atau login dengan akun yang benar.')
@section('badge', 'raycode — guard active')
@section('filename', '~/raycode • access.log')
@section('icon-label', 'Akses terbatas')
@section('terminal-footer', 'ERROR 403 • raycode.dev • akses ditolak')
@section('bottom-pill', 'Hubungi admin jika perlu')

@section('digits')
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">4</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">0</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">3</span>
@endsection

@section('icon')
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12L11 14L15 10"/></svg>
@endsection

@section('terminal')
<div class="p-4 font-mono text-[12px] leading-6 text-sky-100/85">
    <p class="text-sky-300">// access control</p>
    <p><span class="text-slate-400">GET</span> <span class="text-amber-200">{{ request()->path() === '/' ? '/' : '/' . request()->path() }}</span> <span class="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300 ring-1 ring-amber-400/20">→ 403 Forbidden</span></p>
    <p class="text-slate-400">Butuh izin? Login atau minta akses ke admin.</p>
    @if(!empty($exception) && $exception->getMessage())
        <p class="mt-2 text-amber-200">› {{ $exception->getMessage() }}</p>
    @endif
    <div class="mt-3 flex gap-1.5 font-mono text-[10px]"><span class="rounded bg-white/10 px-2 py-1 text-sky-200">raycode@web:~$</span><span class="rounded bg-amber-400/15 px-2 py-1 text-amber-300 ring-1 ring-amber-400/20">guard: active</span></div>
</div>
@endsection

@section('primary-cta')
<a href="/" class="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#0a2e8a] shadow-[0_12px_32px_-12px_rgb(255_255_255/.6),0_4px_12px_rgb(0_0_0/.2)] hover:-translate-y-0.5 transition">
    Kembali ke Beranda
</a>
@endsection

@section('secondary-cta')
<a href="/login" class="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/15 transition">
    Login
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M8 7H17V16"/></svg>
</a>
@endsection
