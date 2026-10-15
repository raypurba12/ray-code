<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Project;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    /**
     * Bangun pesan WA untuk invoice (DP / Pelunasan)
     */
    public function buildMessage(Project $project, Invoice $invoice, ?string $payUrl = null, ?string $trackUrl = null, ?string $pdfUrl = null): string
    {
        $isDp = ($invoice->kind ?? 'full') === 'dp';
        $judul = $isDp ? 'DP 50% - Pembayaran Awal' : (($invoice->kind === 'final') ? 'Pelunasan 50% - Proyek Selesai' : 'Tagihan');
        $sapaan = $project->user->name ?? 'Kak';
        $trackUrl = $trackUrl ?? url('/pantau-pesanan?code='.$project->order_code);
        $pdfUrl = $pdfUrl ?? url('/invoice/'.$project->order_code.'/pdf');
        $payUrl = $payUrl ?? url('/pay/'.$project->order_code);
        $total = number_format($invoice->total, 0, ',', '.');

        if ($isDp) {
            return <<<WA
Halo {$sapaan} - Pesanan {$project->order_code} siap!

Judul: {$project->title}
Invoice: {$judul}
No: {$invoice->number}
Total: Rp {$total}

Bayar DP (QRIS):
{$payUrl}

Pantau progress:
{$trackUrl}

Invoice PDF:
{$pdfUrl}

Silakan bayar DP untuk kami mulai pengerjaan. Link QRIS valid 14 menit, bisa refresh di halaman pantau.

Butuh bantuan? Balas WA ini.
- Raycode
WA;
        }

        return <<<WA
Halo {$sapaan} - Proyek {$project->order_code} selesai 100%!

Judul: {$project->title} - siap review & serah terima
Invoice: {$judul}
No: {$invoice->number}
Total: Rp {$total}

Bayar Pelunasan (QRIS):
{$payUrl}

Pantau & download file:
{$trackUrl}

Invoice Pelunasan PDF:
{$pdfUrl}

Terima kasih sudah percayakan ke Raycode! Setelah pelunasan, file final & akses penuh akan kami rilis.
- Raycode
WA;
    }

    /**
     * Generate wa.me link (ringan, tanpa API) — admin tinggal klik kirim
     */
    public function waLink(string $phone, string $message): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (! str_starts_with($phone, '62')) {
            $phone = '62'.ltrim($phone, '0');
        }

        return 'https://wa.me/'.$phone.'?text='.urlencode($message);
    }

    /**
     * Kirim via gateway jika dikonfigurasi (Fonnte / Wablas / WA Cloud), fallback ke log + return waLink
     * ENV yang didukung (opsional, salah satu):
     *  WA_GATEWAY_URL, WA_GATEWAY_TOKEN, WA_GATEWAY_SENDER
     *  atau FONNTE_TOKEN
     */
    public function send(string $phone, string $message): array
    {
        $phoneClean = preg_replace('/[^0-9]/', '', $phone);
        if (! str_starts_with($phoneClean, '62')) {
            $phoneClean = '62'.ltrim($phoneClean, '0');
        }

        $waLink = $this->waLink($phoneClean, $message);

        // Cek Fonnte
        if ($token = config('services.fonnte.token', env('FONNTE_TOKEN'))) {
            try {
                $res = Http::withHeaders(['Authorization' => $token])
                    ->asForm()->post('https://api.fonnte.com/send', [
                        'target' => $phoneClean,
                        'message' => $message,
                    ]);
                Log::info('WA Fonnte send', ['phone' => $phoneClean, 'status' => $res->status(), 'body' => $res->body()]);

                return ['sent' => $res->successful(), 'via' => 'fonnte', 'waLink' => $waLink, 'response' => $res->json()];
            } catch (\Throwable $e) {
                Log::error('WA Fonnte error', ['msg' => $e->getMessage()]);
            }
        }

        // Generic gateway
        $gatewayUrl = config('services.wa.gateway_url', env('WA_GATEWAY_URL'));
        $gatewayToken = config('services.wa.token', env('WA_GATEWAY_TOKEN'));
        if ($gatewayUrl) {
            try {
                $res = Http::withToken($gatewayToken)->post($gatewayUrl, [
                    'phone' => $phoneClean,
                    'message' => $message,
                ]);
                Log::info('WA gateway send', ['phone' => $phoneClean, 'status' => $res->status()]);

                return ['sent' => $res->successful(), 'via' => 'gateway', 'waLink' => $waLink];
            } catch (\Throwable $e) {
                Log::error('WA gateway error', ['msg' => $e->getMessage()]);
            }
        }

        // Fallback: tidak ada gateway → log saja, andalkan wa.me link
        Log::info('WA fallback (no gateway) — use waLink', ['phone' => $phoneClean, 'waLink' => $waLink]);

        return ['sent' => false, 'via' => 'wa.me', 'waLink' => $waLink];
    }
}
