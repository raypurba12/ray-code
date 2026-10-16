<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\Setting;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use ZipArchive;

class TrackOrderController extends Controller
{
    public function index(Request $request)
    {
        $code = $request->query('code');
        $project = null;
        $invoice = null;
        $paymentUrl = null;

        if ($code) {
            $code = strtoupper(trim($code));
            $project = Project::with(['service:id,title,slug,icon', 'updates.files', 'invoices', 'files'])
                ->where('order_code', $code)
                ->first();

            if ($project) {
                // latest unpaid untuk paymentUrl fallback (prioritas DP dulu baru pelunasan)
                $invoice = $project->invoices->where('status', 'unpaid')->sortBy('created_at')->first()
                    ?? $project->invoices->sortByDesc('created_at')->first();
                if ($invoice && $invoice->status === 'unpaid' && $invoice->snap_token && $invoice->snap_token_expires_at?->isFuture()) {
                    $paymentUrl = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/'.$invoice->snap_token;
                    if (config('midtrans.is_production')) {
                        $paymentUrl = 'https://app.midtrans.com/snap/v2/vtweb/'.$invoice->snap_token;
                    }
                }
            }
        }

        // Mask WA for public display
        $maskedWa = null;
        if ($project && $project->client_wa_cache) {
            $wa = $project->client_wa_cache;
            $maskedWa = substr($wa, 0, 6).str_repeat('*', max(0, strlen($wa) - 8)).substr($wa, -2);
        } elseif ($project && $project->user) {
            $phone = $project->user->phone ?? '';
            if ($phone) {
                $maskedWa = substr($phone, 0, 6).'***'.substr($phone, -2);
            }
        }

        $invoicesPayload = null;
        if ($project) {
            $invoicesPayload = $project->invoices->sortBy('created_at')->map(function ($inv) use ($project) {
                $payUrl = null;
                if ($inv->status === 'unpaid' && $inv->snap_token && $inv->snap_token_expires_at?->isFuture()) {
                    $payUrl = (config('midtrans.is_production') ? 'https://app.midtrans.com/snap/v2/vtweb/' : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/').$inv->snap_token;
                }
                // Signed PDF URL 30 menit untuk share WA aman (P0-1)
                $pdfUrl = URL::temporarySignedRoute('invoice.pdf', now()->addMinutes(30), ['code' => $project->order_code, 'invoice' => $inv->number]);

                return [
                    'id' => $inv->id,
                    'number' => $inv->number,
                    'total' => $inv->total,
                    'amount' => $inv->amount,
                    'tax' => $inv->tax,
                    'status' => $inv->status,
                    'payment_status' => $inv->payment_status,
                    'due_date' => $inv->due_date,
                    'paid_at' => $inv->paid_at,
                    'kind' => $inv->kind ?? 'full',
                    'label' => $inv->label ?? Invoice::KIND_LABELS[$inv->kind ?? 'full'] ?? $inv->kind,
                    'paymentUrl' => $payUrl,
                    'pdfUrl' => $pdfUrl,
                    'snapTokenExpiresAt' => $inv->status === 'unpaid' && $inv->snap_token ? $inv->snap_token_expires_at?->toIso8601String() : null,
                ];
            })->values()->all();
        }

        // Ringkasan pembayaran: total tagihan / sudah dibayar / sisa
        $summary = null;
        if ($project && $project->invoices->count() > 0) {
            $total = (int) $project->invoices->sum('total');
            $paid = (int) $project->invoices->where('status', 'paid')->sum('total');
            $summary = [
                'total' => $total,
                'paid' => $paid,
                'remaining' => max(0, $total - $paid),
            ];
        }

        // Deliverable files — semua file yang diupload admin tampil di pantau; unduh via signed URL 30 menit
        $filesPayload = null;
        $filesZipUrl = null;
        if ($project) {
            $filesPayload = $project->files->map(function ($file) use ($project) {
                return [
                    'id' => $file->id,
                    'file_name' => $file->file_name,
                    'mime' => $file->mime,
                    'size' => $file->size,
                    'version' => $file->version,
                    'created_at' => $file->created_at,
                    'downloadUrl' => URL::temporarySignedRoute('track.files.download', now()->addMinutes(30), ['code' => $project->order_code, 'file' => $file->id]),
                ];
            })->values()->all();

            if ($project->files->count() > 1) {
                $filesZipUrl = URL::temporarySignedRoute('track.files.zip', now()->addMinutes(30), ['code' => $project->order_code]);
            }
        }

        return Inertia::render('Public/TrackOrder', [
            'code' => $code,
            'project' => $project ? [
                'id' => $project->id,
                'order_code' => $project->order_code,
                'title' => $project->title,
                'requirements' => $project->requirements,
                'status' => $project->status,
                'progress' => $project->progress,
                'budget' => $project->budget,
                'deadline' => $project->deadline,
                'service' => $project->service,
                'updates' => $project->updates->map(function ($u) use ($project) {
                    return [
                        'id' => $u->id,
                        'title' => $u->title,
                        'notes' => $u->notes,
                        'created_at' => $u->created_at,
                        'files' => $u->files->map(function ($f) use ($project) {
                            $isImage = str_starts_with((string) $f->mime, 'image/');

                            return [
                                'id' => $f->id,
                                'file_name' => $f->file_name,
                                'mime' => $f->mime,
                                'size' => $f->size,
                                'is_image' => $isImage,
                                'previewUrl' => $isImage ? URL::temporarySignedRoute('track.files.preview', now()->addMinutes(30), ['code' => $project->order_code, 'file' => $f->id]) : null,
                                'downloadUrl' => URL::temporarySignedRoute('track.files.download', now()->addMinutes(30), ['code' => $project->order_code, 'file' => $f->id]),
                            ];
                        })->values()->all(),
                    ];
                }),
                'masked_wa' => $maskedWa,
                'created_at' => $project->created_at,
            ] : null,
            'invoice' => $invoice ? [
                'number' => $invoice->number,
                'total' => $invoice->total,
                'status' => $invoice->status,
                'payment_status' => $invoice->payment_status,
                'due_date' => $invoice->due_date,
                'paid_at' => $invoice->paid_at,
                'kind' => $invoice->kind ?? 'full',
                'label' => $invoice->label ?? null,
            ] : null,
            'invoices' => $invoicesPayload,
            'summary' => $summary,
            'files' => $filesPayload,
            'filesZipUrl' => $filesZipUrl,
            'paymentUrl' => $paymentUrl,
            'notFound' => $code && ! $project,
        ])->toResponse($request)->header('X-Robots-Tag', 'noindex, nofollow');
    }

    public function pay(Request $request, string $code, MidtransService $midtrans)
    {
        $code = strtoupper(trim($code));
        $project = Project::with('invoices')->where('order_code', $code)->firstOrFail();

        // Pilih invoice spesifik dari param (form/query). Fallback: unpaid terlama (DP dulu) — konsisten dengan index()
        $unpaid = $project->invoices->where('status', 'unpaid')->sortBy('created_at');
        $requested = trim((string) $request->input('invoice', ''));
        $invoice = $requested !== ''
            ? $unpaid->firstWhere('number', $requested)
            : $unpaid->first();

        if (! $invoice) {
            return back()->withErrors(['code' => $requested !== ''
                ? 'Tagihan '.$requested.' tidak ditemukan atau sudah dibayar.'
                : 'Tidak ada tagihan unpaid untuk pesanan ini.']);
        }

        // Rate limit pay generation: 5 per 10 menit per IP+code
        $key = 'track-pay:'.$request->ip().':'.$code;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return back()->withErrors(['code' => 'Terlalu sering. Coba lagi '.RateLimiter::availableIn($key).' detik.']);
        }
        RateLimiter::hit($key, 600);

        try {
            $token = $midtrans->createSnapToken($invoice);
            $url = (config('midtrans.is_production') ? 'https://app.midtrans.com/snap/v2/vtweb/' : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/').$token;

            return redirect()->away($url);
        } catch (\Throwable $e) {
            // Jika Midtrans gagal (key demo / 401), jangan 500 — redirect ke pantau dengan pesan error
            return redirect()->to('/pantau-pesanan?code='.$project->order_code)
                ->with('error', 'Gagal buat link bayar Midtrans: '.$e->getMessage().' — Silakan hubungi admin WA untuk link alternatif. Kode: '.$project->order_code);
        }
    }

    // Short link GET /pay/{code} — same as pay, untuk share WA pendek
    public function payShort(Request $request, string $code, MidtransService $midtrans)
    {
        return $this->pay($request, $code, $midtrans);
    }

    public function invoicePdf(Request $request, string $code)
    {
        $code = strtoupper(trim($code));
        $project = Project::with(['service:id,title', 'user:id,name,email,phone', 'invoices'])->where('order_code', $code)->firstOrFail();

        // P0-1: PDF sensitif — harus signed ATAU owner/admin. Guest tanpa signature = 403.
        if (! $request->hasValidSignature()) {
            $user = $request->user();
            if (! $user || ($project->user_id !== $user->id && ! $user->isAdmin())) {
                abort(403, 'Link invoice kadaluarsa atau tidak valid. Buka ulang halaman Pantau Pesanan untuk link baru, atau minta admin mengirim ulang.');
            }
        }

        // Jika query ?invoice=INV-xxx maka pakai itu, else latest (prioritas unpaid dp/final)
        $invoiceId = $request->query('invoice');
        if ($invoiceId) {
            $invoice = $project->invoices->firstWhere('number', $invoiceId) ?? $project->invoices->firstWhere('id', $invoiceId);
        } else {
            $invoice = $project->invoices->where('status', 'unpaid')->sortBy('created_at')->first()
                ?? $project->invoices->sortByDesc('created_at')->first();
        }
        if (! $invoice) {
            abort(404, 'Invoice tidak ditemukan');
        }

        return response()->view('invoice.pdf', [
            'project' => $project,
            'invoice' => $invoice,
            'invoices' => $project->invoices->sortBy('created_at'),
            'settings' => Setting::all()->pluck('value', 'key')->toArray(),
        ])->header('X-Robots-Tag', 'noindex, nofollow');
    }

    // Unduh 1 file deliverable — signed URL ATAU owner/admin (pola sama dengan invoicePdf)
    public function downloadFile(Request $request, string $code, ProjectFile $file)
    {
        return $this->serveFile($request, $code, $file, inline: false);
    }

    // Preview inline (thumbnail foto progres) — guard sama dengan download
    public function previewFile(Request $request, string $code, ProjectFile $file)
    {
        return $this->serveFile($request, $code, $file, inline: true);
    }

    private function serveFile(Request $request, string $code, ProjectFile $file, bool $inline)
    {
        $code = strtoupper(trim($code));
        $project = Project::where('order_code', $code)->firstOrFail();
        abort_unless($file->project_id === $project->id, 404);

        if (! $request->hasValidSignature()) {
            $user = $request->user();
            if (! $user || ($project->user_id !== $user->id && ! $user->isAdmin())) {
                abort(403, 'Link kadaluarsa atau tidak valid. Buka ulang halaman Pantau Pesanan untuk link baru.');
            }
        }

        abort_unless(Storage::disk('public')->exists($file->disk_path), 404, 'File tidak ditemukan.');

        return $inline
            ? Storage::disk('public')->response($file->disk_path)
            : Storage::disk('public')->download($file->disk_path, $file->file_name);
    }

    // Unduh semua deliverable sebagai ZIP — signed URL ATAU owner/admin
    public function downloadFilesZip(Request $request, string $code)
    {
        $code = strtoupper(trim($code));
        $project = Project::with('files')->where('order_code', $code)->firstOrFail();

        if (! $request->hasValidSignature()) {
            $user = $request->user();
            if (! $user || ($project->user_id !== $user->id && ! $user->isAdmin())) {
                abort(403, 'Link download kadaluarsa atau tidak valid. Buka ulang halaman Pantau Pesanan untuk link baru.');
            }
        }

        $files = $project->files;
        abort_unless($files->count() > 0, 404, 'Belum ada file.');

        if (! class_exists(ZipArchive::class)) {
            return redirect()->to('/pantau-pesanan?code='.$project->order_code)
                ->with('error', 'Fitur ZIP belum tersedia di server (php-zip). Silakan unduh file satu per satu.');
        }

        $zipName = 'hasil-'.$project->order_code.'-'.now()->format('Ymd_His').'.zip';
        $tmpPath = storage_path('app/private/'.$zipName);

        $zip = new ZipArchive;
        if ($zip->open($tmpPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return redirect()->to('/pantau-pesanan?code='.$project->order_code)
                ->with('error', 'Gagal membuat ZIP. Silakan unduh file satu per satu.');
        }
        foreach ($files as $f) {
            $abs = Storage::disk('public')->path($f->disk_path);
            if (file_exists($abs)) {
                $zip->addFile($abs, $f->file_name);
            }
        }
        $zip->close();

        return response()->download($tmpPath, $zipName)->deleteFileAfterSend(true);
    }
}
