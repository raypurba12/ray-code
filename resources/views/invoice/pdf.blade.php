<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Invoice {{ $invoice->number }} — {{ $project->order_code }}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family: ui-sans-serif,system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#0f172a; background:#fff; padding:32px}
  .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0f172a;padding-bottom:16px}
  .logo{font-family: monospace; font-weight:700; font-size:18px}
  .badge{display:inline-block;background:#f59e0b;color:#0f172a;font-weight:800;font-size:10px;letter-spacing:0.12em;padding:4px 8px;border-radius:999px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px}
  .card{border:1px solid #e2e8f0;border-radius:12px;padding:16px}
  .mono{font-family: ui-monospace, SFMono-Regular, Menlo, monospace}
  .text-sm{font-size:13px} .text-xs{font-size:11px} .text-ink{color:#0f172a} .text-muted{color:#64748b}
  .total{font-size:22px;font-weight:800}
  .status{padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700}
  .paid{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}
  .unpaid{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th{font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;text-align:left;padding:8px 0;border-bottom:1px solid #e2e8f0}
  td{padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
  .actions{margin-top:20px;display:flex;gap:12px}
  .btn{padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;display:inline-block}
  .btn-primary{background:#2563eb;color:#fff}
  .btn-ghost{border:1px solid #e2e8f0;color:#0f172a}
  @media print { .no-print{display:none} body{padding:12px} }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">ray<span style="color:#2563eb">code</span> <span class="badge">INVOICE {{ strtoupper($invoice->kind ?? 'FULL') }}</span></div>
      <div class="text-xs text-muted" style="margin-top:4px">Jakarta — Remote-first • hallo@raycode.dev • {{ $settings['contact_phone'] ?? '+62 812 3456 7890' }}</div>
      @if($invoice->label)<div class="text-xs" style="margin-top:4px;font-weight:700;color:#f59e0b">{{ $invoice->label }}</div>@endif
    </div>
    <div style="text-align:right">
      <div class="mono text-sm" style="font-weight:700">{{ $invoice->number }}</div>
      <div class="mono text-xs text-muted">Kode Pesanan: {{ $project->order_code }}</div>
      <div style="margin-top:6px"><span class="status {{ $invoice->status==='paid'?'paid':'unpaid' }}">{{ strtoupper($invoice->status) }} @if($invoice->kind) • {{ strtoupper($invoice->kind) }} @endif</span></div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="text-xs text-muted">Tagihan untuk</div>
      <div class="text-sm" style="font-weight:700;margin-top:4px">{{ $project->user->name }}</div>
      <div class="text-xs text-muted">{{ $project->user->email }} @if($project->user->phone) • {{ $project->user->phone }} @endif</div>
      <div class="text-xs text-muted" style="margin-top:8px">Proyek: <span style="font-weight:600;color:#0f172a">{{ $project->title }}</span></div>
      <div class="text-xs text-muted">Layanan: {{ $project->service->title ?? '—' }}</div>
    </div>
    <div class="card">
      <div class="text-xs text-muted">Detail Pembayaran</div>
      <div class="mono total" style="margin-top:4px">Rp {{ number_format($invoice->total,0,',','.') }}</div>
      <div class="text-xs text-muted">Subtotal Rp {{ number_format($invoice->amount,0,',','.') }} + PPN 11% Rp {{ number_format($invoice->tax,0,',','.') }}</div>
      <div class="text-xs" style="margin-top:8px">Jatuh tempo: <span class="mono">{{ $invoice->due_date ? \Carbon\Carbon::parse($invoice->due_date)->format('d M Y') : '-' }}</span></div>
      @if($invoice->paid_at)<div class="text-xs" style="color:#047857">Lunas: {{ \Carbon\Carbon::parse($invoice->paid_at)->format('d M Y H:i') }} WIB</div>@endif
      <div class="text-xs text-muted" style="margin-top:8px">Metode: QRIS / VA / Gopay via Midtrans Snap</div>
    </div>
  </div>

  <table>
    <thead><tr><th>Deskripsi</th><th style="text-align:right">Jumlah</th></tr></thead>
    <tbody>
      <tr><td>{{ $project->title }} @if($invoice->label)<span class="badge" style="margin-left:6px;vertical-align:middle">{{ $invoice->label }}</span>@endif<br><span class="text-xs text-muted">{{ Str::limit($project->requirements, 120) }}</span></td><td style="text-align:right" class="mono">Rp {{ number_format($invoice->amount,0,',','.') }}</td></tr>
      <tr><td>PPN 11%</td><td style="text-align:right" class="mono">Rp {{ number_format($invoice->tax,0,',','.') }}</td></tr>
      <tr><td style="font-weight:700">Total {{ $invoice->kind==='dp' ? '(DP 50%)' : ($invoice->kind==='final' ? '(Pelunasan 50%)' : '') }}</td><td style="text-align:right;font-weight:800" class="mono">Rp {{ number_format($invoice->total,0,',','.') }}</td></tr>
    </tbody>
  </table>

  @if(isset($invoices) && $invoices->count() > 1)
  <div class="card" style="margin-top:16px">
    <div class="text-xs text-muted" style="font-weight:700">Ringkasan Tagihan Proyek (Budget Total Rp {{ number_format($project->budget,0,',','.') }})</div>
    <table style="margin-top:8px">
      <thead><tr><th>Invoice</th><th>Status</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>
        @foreach($invoices as $inv)
        <tr>
          <td class="mono text-xs">{{ $inv->number }} @if($inv->kind)<span style="font-size:10px;background:#f1f5f9;padding:2px 6px;border-radius:999px">{{ strtoupper($inv->kind) }}</span>@endif</td>
          <td><span class="status {{ $inv->status==='paid'?'paid':'unpaid' }}" style="font-size:10px">{{ strtoupper($inv->status) }}</span></td>
          <td style="text-align:right" class="mono">Rp {{ number_format($inv->total,0,',','.') }}</td>
        </tr>
        @endforeach
        <tr><td colspan="2" style="font-weight:700">Total Ditagihkan</td><td style="text-align:right;font-weight:800" class="mono">Rp {{ number_format($invoices->sum('total'),0,',','.') }}</td></tr>
      </tbody>
    </table>
  </div>
  @endif

  <div class="card" style="margin-top:16px;background:#f8fafc">
    <div class="text-xs text-muted">Link Pantau Pesanan</div>
    <div class="mono text-sm" style="font-weight:600;margin-top:2px">{{ url('/pantau-pesanan?code='.$project->order_code) }}</div>
    <div class="text-xs text-muted">Link Bayar QRIS (pendek): {{ url('/pay/'.$project->order_code) }}</div>
    @if($invoice->status!=='paid')<div class="text-xs" style="margin-top:6px;color:#c2410c">Link QRIS valid ~14 menit, refresh jika kadaluarsa via halaman pantau.</div>@endif
  </div>

  <div class="actions no-print">
    <a href="{{ url('/pay/'.$project->order_code) }}" class="btn btn-primary">Bayar via QRIS</a>
    <a href="javascript:window.print()" class="btn btn-ghost">Cetak / Save PDF</a>
    <a href="{{ url('/pantau-pesanan?code='.$project->order_code) }}" class="btn btn-ghost">Kembali Pantau</a>
  </div>

  <div style="margin-top:20px;border-top:1px dashed #e2e8f0;padding-top:12px" class="text-xs text-muted">
    Raycode Studio • Terima kasih! Simpan kode <span class="mono" style="font-weight:700;color:#0f172a">{{ $project->order_code }}</span> untuk pantau progress. Hubungi WA {{ $settings['whatsapp'] ?? '+62 812 3456 7890' }} jika ada pertanyaan.
  </div>
</body>
</html>
