@extends('errors.layout')

@section('code', '503')
@section('label', '503 — MAINTENANCE MODE')
@section('title', "Kami lagi\npoles sesuatu yang keren")
@section('desc', 'Raycode sedang upgrade biar lebih ngebut. Balik lagi dalam beberapa menit — bakal worth it!')
@section('badge', 'raycode — maintenance')
@section('filename', '~/raycode • deploy.log')
@section('icon-label', 'Maintenance')
@section('terminal-footer', '503 • Maintenance • raycode.dev')
@section('bottom-pill', 'Balik lagi sebentar lagi!')

@section('digits')
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">5</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">0</span>
<span class="inline-block bg-gradient-to-b from-white to-sky-200 bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_6px_20px_rgb(0_0_0/.35)] sm:text-[7.5rem] lg:text-[8.5rem]">3</span>
@endsection

@section('icon')
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
@endsection

@section('terminal')
<div class="p-4 font-mono text-[12px] leading-6 text-sky-100/85">
    <p class="text-sky-300">// deploy</p>
    <p><span class="text-white">$</span> raycode upgrade --next-gen</p>
    <p class="text-amber-300">● Maintenance window active</p>
    <p class="text-sky-200/80">  → Estimated: 5-10 menit lagi</p>
    <p class="text-emerald-300">✓ Kami akan kembali lebih cepat & lebih kuat!</p>
    <div class="mt-3 flex gap-1.5 font-mono text-[10px]"><span class="rounded bg-white/10 px-2 py-1 text-sky-200">raycode@web:~$</span><span class="rounded bg-sky-400/15 px-2 py-1 text-sky-200 ring-1 ring-sky-400/20">upgrading</span></div>
</div>
@endsection

@section('primary-cta')
<a href="javascript:window.location.reload()" class="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-[#0a2e8a] shadow-[0_12px_32px_-12px_rgb(255_255_255/.6),0_4px_12px_rgb(0_0_0/.2)] hover:-translate-y-0.5 transition">
    Muat Ulang
</a>
@endsection

@section('secondary-cta')
<a href="/contact" class="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/15 transition">
    Hubungi Kami
</a>
@endsection
