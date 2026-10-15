<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Invoice {{ $invoice->number }}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0f172a;background:#f8fafc;padding:24px}
  .card{max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden}
  .head{background:#0f172a;color:#fff;padding:20px 24px}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  .badge{display:inline-block;background:#f59e0b;color:#0f172a;font-weight:800;font-size:11px;letter-spacing:.08em;padding:4px 8px;border-radius:999px}
  .body{padding:24px}
  .total{font-size:24px;font-weight:800}
  .btn{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;font-size:14px}
  .btn-ghost{display:inline-block;border:1px solid #e2e8f0;color:#0f172a;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px}
  .muted{color:#64748b}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media max-width:520px{.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="card">
  <div class="head">
    <div style="font-family:monospace;font-weight:700">ray<span style="color:#60a5fa">code</span> <span class="badge">INVOICE</span></div>
    <div class="mono" style="margin-top:8px;font-size:13px;opacity:.9">{{ $invoice->number }} @if($invoice->kind) • {{ strtoupper($invoice->kind) }} @endif • {{ $project->order_code }}</div>
    <div style="margin-top:4px;font-size:12px;opacity:.6">Jakarta — Remote-first • hallo@raycode.dev</div>
  </div>
  <div class="body">
    <p style="margin:0;font-size:14px">Halo <strong>{{ $project->user->name ?? 'Kak' }}</strong>,</p>
    @if($isDp)
      <p style="margin:8px 0 0;font-size:14px;line-height:1.6" class="muted">Pesanan <span class="mono" style="font-weight:700;color:#0f172a">{{ $project->order_code }}</span> — <em>{{ $project->title }}</em> sudah kami proses. Berikut <strong>Invoice DP 50% (pembayaran awal)</strong> untuk memulai pengerjaan:</p>
    @elseif($isFinal)
      <p style="margin:8px 0 0;font-size:14px;line-height:1.6" class="muted">Proyek <span class="mono" style="font-weight:700;color:#0f172a">{{ $project->order_code }}</span> — <em>{{ $project->title }}</em> telah <strong>selesai 100%</strong> 🎉 Berikut <strong>Invoice Pelunasan 50%</strong>:</p>
    @else
      <p style="margin:8px 0 0;font-size:14px;line-height:1.6" class="muted">Berikut tagihan untuk pesanan <span class="mono">{{ $project->order_code }}</span>:</p>
    @endif

    <div class="grid" style="margin-top:16px">
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px">
        <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase" class="muted">Total Tagihan</div>
        <div class="mono total" style="margin-top:4px">Rp {{ number_format($invoice->total,0,',','.') }}</div>
        <div style="font-size:11px" class="muted">Subtotal Rp {{ number_format($invoice->amount,0,',','.') }} + PPN 11% Rp {{ number_format($invoice->tax,0,',','.') }}</div>
        <div style="margin-top:8px;font-size:12px">Jatuh tempo: <span class="mono">{{ $invoice->due_date ? \Carbon\Carbon::parse($invoice->due_date)->format('d M Y') : '-' }}</span></div>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px">
        <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase" class="muted">Detail Pesanan</div>
        <div style="margin-top:6px;font-size:13px;font-weight:600">{{ $project->title }}</div>
        <div style="font-size:12px" class="muted">{{ $project->service->title ?? 'Custom' }} • Deadline {{ $project->deadline ? \Carbon\Carbon::parse($project->deadline)->format('d M Y') : '-' }}</div>
        <div style="margin-top:8px;font-size:11px" class="muted">Kode pantau: <span class="mono" style="font-weight:700;color:#0f172a">{{ $project->order_code }}</span></div>
      </div>
    </div>

    <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">
      <a href="{{ $payUrl }}" class="btn">Bayar via QRIS — Rp {{ number_format($invoice->total,0,',','.') }}</a>
      <a href="{{ $pdfUrl }}" class="btn-ghost">Lihat Invoice PDF</a>
    </div>
    <p style="margin:10px 0 0;font-size:11px" class="muted">Link QRIS valid ~14 menit. Jika kadaluarsa, buka halaman pantau untuk refresh.</p>

    <div style="margin-top:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px">
      <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase" class="muted">Link Penting</div>
      <div style="margin-top:6px;font-size:12px" class="mono">Pantau: {{ $trackUrl }}</div>
      <div style="font-size:12px" class="mono">Bayar pendek: {{ url('/pay/'.$project->order_code) }}</div>
      <div style="font-size:12px" class="mono">Invoice: {{ $pdfUrl }}</div>
    </div>

    <p style="margin-top:16px;font-size:12px;line-height:1.6" class="muted">
      @if($isDp)
        Setelah DP lunas, tim langsung mulai pengerjaan dan progress bisa kamu pantau pakai kode di atas. Butuh bantuan? Balas email ini atau WA {{ config('settings.whatsapp','+62 812 3456 7890') }}.
      @else
        Setelah pelunasan, file final & akses penuh akan kami rilis. Terima kasih sudah percayakan ke Raycode!
      @endif
    </p>
    <p style="margin-top:12px;font-size:12px">— Tim Raycode 🚀<br><span class="muted">hallo@raycode.dev • {{ url('/') }}</span></p>
  </div>
</div>
</body>
</html>