<?php

namespace App\Services;

use App\Models\Invoice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    protected string $serverKey;

    protected string $clientKey;

    protected bool $isProduction;

    protected string $snapBaseUrl;

    public function __construct()
    {
        // config() already reads env via config/midtrans.php — jangan pakai env() langsung setelah config:cache
        $this->serverKey = (string) config('midtrans.server_key');
        $this->clientKey = (string) config('midtrans.client_key');
        $this->isProduction = (bool) config('midtrans.is_production', false);
        $this->snapBaseUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    /**
     * Create Snap Token for an Invoice — idempoten (PRD FR-3)
     * Re-use token jika masih pending & belum expired (15 menit buffer)
     */
    public function createSnapToken(Invoice $invoice): string
    {
        $invoice->loadMissing(['user', 'project']);

        // Re-use token jika masih valid
        if ($invoice->snap_token && $invoice->payment_status === 'pending' && $invoice->snap_token_expires_at && $invoice->snap_token_expires_at->isFuture()) {
            return $invoice->snap_token;
        }

        // Generate order_id sekali lalu simpan
        if (! $invoice->midtrans_order_id) {
            $invoice->forceFill(['midtrans_order_id' => $invoice->number.'-'.time()])->save();
        }

        $params = [
            'transaction_details' => [
                'order_id' => $invoice->midtrans_order_id,
                'gross_amount' => (int) round($invoice->total),
            ],
            'customer_details' => [
                'first_name' => $invoice->user->name ?? 'Client',
                'email' => $invoice->user->email ?? 'client@raycode.dev',
            ],
            'item_details' => [
                [
                    'id' => 'INV-'.$invoice->id,
                    'price' => (int) round($invoice->total),
                    'quantity' => 1,
                    'name' => 'Tagihan Proyek: '.substr($invoice->project->title ?? $invoice->number, 0, 45),
                ],
            ],
        ];

        // Direct HTTP call to Midtrans API to avoid SDK dependency issues
        $authHeader = 'Basic '.base64_encode($this->serverKey.':');

        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
            'Authorization' => $authHeader,
        ])->post($this->snapBaseUrl, $params);

        if ($response->successful()) {
            $data = $response->json();
            $token = $data['token'] ?? '';

            // Store token in invoice dengan expiry (Midtrans Snap token valid ~15 menit, kita simpan 14 menit)
            $invoice->update([
                'snap_token' => $token,
                'snap_token_expires_at' => now()->addMinutes(14),
                'payment_status' => 'pending',
            ]);

            return $token;
        }

        Log::error('Midtrans Snap Token Generation Failed', [
            'invoice_id' => $invoice->id,
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        throw new \Exception('Gagal membuat tiket pembayaran Midtrans: '.($response->json('error_messages.0') ?? 'Respon server tidak valid'));
    }

    /**
     * Verify Webhook Signature Hash
     * SHA512(order_id + status_code + gross_amount + ServerKey)
     */
    public function verifyNotificationSignature(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $signatureKey = $payload['signature_key'] ?? '';

        $expectedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        return hash_equals($expectedSignature, $signatureKey);
    }
}
