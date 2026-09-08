@extends('errors.layout')

@section('code', '500')
@section('label', '500 — KESALAHAN SERVER')
@section('title', "Server kami\nlagi batuk sebentar")
@section('desc', 'Bukan salah kamu. Tim engineering sudah dapat alarm-nya. Coba refresh, atau hubungi kami kalau masih nyangkut.')
@section('badge', 'raycode — incident reported')
@section('filename', '~/raycode • server.log')
@section('icon-label', 'Sistem dalam perbaikan')
@section('terminal-footer', 'ERROR 500 • ' . now()->format('H:i') . ' WIB • raycode.dev')
@section('bottom-pill', 'Tim kami sigap 24/7')

@section('digits')
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">5</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">0</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">0</span>
@endsection

@section('icon')
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10H6.01"/><path d="M10 10H10.01"/><path d="M14 10H14.01"/><path d="M18 10H18.01"/><path d="M8 14H16"/></svg>
@endsection

@section('terminal')
<div class="p-4 font-mono text-[12px] leading-6">
    <div class="text-white font-semibold">$ raycode deploy --prod</div>
    <div class="text-amber-300 font-semibold">● Building project...</div>
    <div class="text-red-300 font-semibold">✗ Error: Unexpected token at 0:0</div>
    <div class="text-sky-200/80">  → GET /api/status 500 Internal Server Error</div>
    <div class="text-sky-200/80">  → Retrying automatically...</div>
    <div class="text-emerald-300 font-semibold">✓ Notified: engineering@raycode.dev</div>
    @if(!empty($exception) && app()->hasDebugModeEnabled())
        <div class="mt-3 rounded bg-red-500/10 p-2 text-red-200 ring-1 ring-red-400/20 text-xs break-all">{{ $exception->getMessage() }}</div>
    @endif
</div>
@endsection

@section('primary-cta')
<a href="javascript:window.location.reload()" class="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#0a2e8a] shadow-[0_12px_32px_-12px_rgb(255_255_255/.6),0_4px_12px_rgb(0_0_0/.2)] hover:-translate-y-0.5 transition">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12A9 9 0 1 1 3 12A9 9 0 0 1 21 12Z"/><path d="M9 9H15V15"/><path d="M15 9L9 15"/></svg>
    Muat Ulang Halaman
</a>
@endsection

@section('secondary-cta')
<a href="/contact" class="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/15 transition">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    Hubungi Tim
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M8 7H17V16"/></svg>
</a>
@endsection
