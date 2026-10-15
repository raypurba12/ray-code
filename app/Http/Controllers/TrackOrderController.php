<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Project;
use App\Models\Setting;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

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
            $project = Project::with(['service:id,title,slug,icon', 'updates', 'invoices'])
                ->where('order_code', $code)
                ->first();

            if ($project) {
                // latest unpaid untuk paymentUrl fallback (prioritas DP dulu baru pelunasan)
                $invoice = $project->invoices->where('status', 'unpaid')->sortBy('created_at')->first()
                    ?? $project->invoices->sortByDesc('created_at')->first();
                if ($invoice && $invoice->status === 'unpaid' && $invoice->snap_token) {
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
                if ($inv->status === 'unpaid' && $inv->snap_token) {
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
                ];
            })->values()->all();
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
                'updates' => $project->updates->map(fn ($u) => ['id' => $u->id, 'title' => $u->title, 'notes' => $u->notes, 'created_at' => $u->created_at]),
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
            'paymentUrl' => $paymentUrl,
            'notFound' => $code && ! $project,
        ]);
    }

    public function pay(Request $request, string $code, MidtransService $midtrans)
    {
        $code = strtoupper(trim($code));
        $project = Project::with('invoices')->where('order_code', $code)->firstOrFail();
        $invoice = $project->invoices->where('status', 'unpaid')->sortByDesc('created_at')->first();
        if (! $invoice) {
            return back()->withErrors(['code' => 'Tidak ada tagihan unpaid untuk pesanan ini.']);
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
                abort(403, 'Link invoice kadaluarsa atau tidak valid. Buka via dashboard atau minta link baru dari admin.');
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
        ]);
    }
}
