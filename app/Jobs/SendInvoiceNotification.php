<?php

namespace App\Jobs;

use App\Mail\InvoiceMail;
use App\Models\Invoice;
use App\Models\Project;
use App\Services\MidtransService;
use App\Services\WhatsappService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendInvoiceNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Project $project,
        public Invoice $invoice,
        public bool $forceRegenerateToken = false,
    ) {}

    public function handle(MidtransService $midtrans, WhatsappService $wa): void
    {
        $project = $this->project->loadMissing(['user', 'service']);
        $invoice = $this->invoice->fresh(['project', 'user']);

        // Pastikan snap_token ada (generate jika belum)
        $payUrl = null;
        try {
            if (! $invoice->snap_token || $this->forceRegenerateToken) {
                $token = $midtrans->createSnapToken($invoice);
            } else {
                $token = $invoice->snap_token;
                // jika expired, regenerate
                if ($invoice->snap_token_expires_at && $invoice->snap_token_expires_at->isPast()) {
                    $token = $midtrans->createSnapToken($invoice->fresh());
                }
            }
            $invoice->refresh();
            $isProd = (bool) config('midtrans.is_production');
            $payUrl = ($isProd ? 'https://app.midtrans.com/snap/v2/vtweb/' : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/').$invoice->snap_token;
        } catch (\Throwable $e) {
            Log::warning('SendInvoiceNotification: snap token failed', ['invoice' => $invoice->id, 'msg' => $e->getMessage()]);
            $payUrl = url('/pay/'.$project->order_code); // fallback short link
        }

        $trackUrl = url('/pantau-pesanan?code='.$project->order_code);
        $pdfUrl = url('/invoice/'.$project->order_code.'/pdf');

        // 1. Email (jika ada email valid & bukan guest)
        $email = $project->user->email ?? null;
        $isGuest = str_ends_with($email ?? '', '@raycode.guest');
        if ($email && ! $isGuest && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            try {
                Mail::to($email)->send(new InvoiceMail($project, $invoice, $payUrl ?? $trackUrl, $trackUrl, $pdfUrl));
                Log::info('Invoice email sent', ['invoice' => $invoice->number, 'to' => $email]);
            } catch (\Throwable $e) {
                Log::error('Invoice email failed', ['invoice' => $invoice->number, 'msg' => $e->getMessage()]);
            }
        } else {
            Log::info('Invoice email skipped (guest/invalid)', ['invoice' => $invoice->number, 'email' => $email]);
        }

        // 2. WA — selalu siapkan waLink + coba kirim gateway jika ada
        $phone = $project->client_wa_cache ?? $project->user->phone ?? null;
        if ($phone) {
            $message = $wa->buildMessage($project, $invoice, $payUrl, $trackUrl, $pdfUrl);
            $result = $wa->send($phone, $message);
            Log::info('Invoice WA result', ['invoice' => $invoice->number, 'phone' => $phone, 'via' => $result['via'] ?? 'unknown', 'sent' => $result['sent'] ?? false]);
        } else {
            Log::info('Invoice WA skipped (no phone)', ['invoice' => $invoice->number]);
        }
    }
}
