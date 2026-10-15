<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request, MidtransService $midtransService): JsonResponse
    {
        $payload = $request->all();

        Log::info('Midtrans Webhook Received', $payload);

        $orderId = $payload['order_id'] ?? '';
        $transactionStatus = $payload['transaction_status'] ?? '';
        $paymentType = $payload['payment_type'] ?? '';
        $fraudStatus = $payload['fraud_status'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? null;

        // PRD FR-3 strict verify: reject 401 jika signature tidak valid
        if (! $midtransService->verifyNotificationSignature($payload)) {
            Log::warning('Midtrans Webhook Signature Invalid', ['order_id' => $orderId]);

            return response()->json(['message' => 'Invalid signature'], 401);
        }

        // Cari by midtrans_order_id dulu (idempoten), fallback ke number parse lama untuk backward compat
        $invoice = Invoice::where('midtrans_order_id', $orderId)->first();
        if (! $invoice) {
            $invoiceNumber = $orderId;
            if (str_contains($orderId, '-')) {
                $parts = explode('-', $orderId);
                array_pop($parts);
                $invoiceNumber = implode('-', $parts);
            }
            $invoice = Invoice::where('number', $invoiceNumber)->first();
        }

        if (! $invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        // Cek gross_amount sesuai total invoice
        if ($grossAmount !== null && (int) round($invoice->total) !== (int) $grossAmount) {
            Log::warning('Midtrans gross_amount mismatch', ['order_id' => $orderId, 'expected' => $invoice->total, 'got' => $grossAmount]);

            return response()->json(['message' => 'Gross amount mismatch'], 422);
        }

        // Idempoten: jika sudah paid, jangan update lagi
        if ($invoice->status === 'paid' && $invoice->payment_status === 'settlement') {
            return response()->json(['message' => 'Already settled'], 200);
        }

        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'challenge') {
                $invoice->update([
                    'payment_status' => 'challenge',
                    'payment_type' => $paymentType,
                ]);
            } elseif ($fraudStatus === 'accept') {
                $invoice->update([
                    'status' => 'paid',
                    'payment_status' => 'settlement',
                    'payment_type' => $paymentType,
                    'paid_at' => now(),
                ]);
            }
        } elseif ($transactionStatus === 'settlement') {
            $invoice->update([
                'status' => 'paid',
                'payment_status' => 'settlement',
                'payment_type' => $paymentType,
                'paid_at' => now(),
            ]);
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $invoice->update([
                'payment_status' => $transactionStatus,
            ]);
        } elseif ($transactionStatus === 'pending') {
            $invoice->update([
                'payment_status' => 'pending',
                'payment_type' => $paymentType,
            ]);
        }

        return response()->json(['message' => 'Notification processed successfully']);
    }
}
