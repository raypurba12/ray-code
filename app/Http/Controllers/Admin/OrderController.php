<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendInvoiceNotification;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use App\Services\MidtransService;
use App\Services\WhatsappService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Orders', [
            'orders' => Project::with(['user:id,name,email,phone', 'service:id,title', 'invoices'])
                ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => ['status' => $request->query('status')],
            'services' => Service::orderBy('sort_order')->get(['id', 'title', 'slug', 'type']),
        ]);
    }

    public function storeManual(Request $request, MidtransService $midtrans)
    {
        $validated = $request->validate([
            'client_name' => ['required', 'string', 'max:255'],
            'client_wa' => ['required', 'string', 'max:20', 'regex:/^\+?[0-9]{9,15}$/'],
            'client_email' => ['nullable', 'email', 'max:255'],
            'service_id' => ['required', 'exists:services,id'],
            'title' => ['required', 'string', 'max:255'],
            'requirements' => ['required', 'string', 'min:20'],
            'budget' => ['required', 'integer', 'min:100000'],
            'deadline' => ['required', 'date', 'after:today'],
        ]);

        $wa = preg_replace('/[^0-9]/', '', $validated['client_wa']);
        if (! str_starts_with($wa, '62')) {
            $wa = '62'.ltrim($wa, '0');
        }

        $user = User::where('phone', $wa)->orWhere('email', $validated['client_email'] ?? '')->first();
        if (! $user) {
            $email = $validated['client_email'] ?? $wa.'@raycode.guest';
            // jika email guest sudah ada, tambah suffix
            if (User::where('email', $email)->exists()) {
                $email = Str::random(4).'_'.$email;
            }
            $user = User::create([
                'name' => $validated['client_name'],
                'email' => $email,
                'phone' => $wa,
                'password' => Hash::make(Str::random(12)),
                'role' => 'client',
            ]);
        }

        $project = Project::create([
            'user_id' => $user->id,
            'service_id' => $validated['service_id'],
            'title' => $validated['title'],
            'requirements' => $validated['requirements'],
            'budget' => $validated['budget'],
            'deadline' => $validated['deadline'],
            'status' => 'pending',
            'progress' => 0,
            'client_wa_cache' => $wa,
        ]);

        // DP 50% dari budget (fixed 50% sesuai request 1A)
        $amountDp = (int) ceil($validated['budget'] * 0.5);
        $taxDp = (int) round($amountDp * 0.11);
        $invoice = Invoice::create([
            'number' => 'INV-'.now()->format('Ymd').'-'.str_pad((string) $project->id, 4, '0', STR_PAD_LEFT).'-DP',
            'project_id' => $project->id,
            'user_id' => $user->id,
            'amount' => $amountDp,
            'tax' => $taxDp,
            'total' => $amountDp + $taxDp,
            'status' => 'unpaid',
            'due_date' => now()->addDays(3),
            'kind' => 'dp',
            'label' => 'DP 50% — Pembayaran Awal',
        ]);

        // Generate QRIS snap token untuk DP
        try {
            $token = $midtrans->createSnapToken($invoice);
            $invoice->refresh();
        } catch (\Throwable $e) {
            Log::warning('DP snap token gagal', ['project' => $project->id, 'msg' => $e->getMessage()]);
            $token = null;
        }

        $payUrl = $token ? (config('midtrans.is_production') ? 'https://app.midtrans.com/snap/v2/vtweb/' : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/').$token : url('/pay/'.$project->order_code);
        $trackUrl = url('/pantau-pesanan?code='.$project->order_code);
        $pdfUrl = URL::temporarySignedRoute('invoice.pdf', now()->addMinutes(30), ['code' => $project->order_code, 'invoice' => $invoice->number]);

        // Kirim notif WA + Email (queue, tapi dispatch sync fallback jika queue tidak jalan)
        try {
            SendInvoiceNotification::dispatch($project, $invoice);
        } catch (\Throwable $e) {
            Log::error('Dispatch SendInvoiceNotification gagal', ['msg' => $e->getMessage()]);
        }

        // Bangun pesan WA untuk preview copy (selalu kasih waLink biar admin bisa 1-klik)
        $waService = app(WhatsappService::class);
        $waMessage = $waService->buildMessage($project->load('user'), $invoice, $payUrl, $trackUrl, $pdfUrl);
        $waLink = $waService->waLink($wa, $waMessage);

        return back()->with('success', "Pesanan {$project->order_code} dibuat. Invoice DP {$invoice->number} (50% = Rp ".number_format($invoice->total, 0, ',', '.').') — QRIS siap.')
            ->with('invoice_payload', [
                'order_code' => $project->order_code,
                'invoice_number' => $invoice->number,
                'invoice_total' => $invoice->total,
                'payUrl' => $payUrl,
                'trackUrl' => $trackUrl,
                'pdfUrl' => $pdfUrl,
                'waLink' => $waLink,
                'waMessage' => $waMessage,
                'kind' => 'dp',
            ]);
    }

    public function updateStatus(Request $request, Project $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,in_review,in_progress,review,completed,cancelled'],
        ]);

        $previousStatus = $order->status;
        $data = ['status' => $validated['status']];

        if ($validated['status'] === 'in_progress' && ! $order->started_at) {
            $data['started_at'] = now();
        }

        if ($validated['status'] === 'completed') {
            $data['completed_at'] = now();
            $data['progress'] = 100;
        }

        $order->update($data);

        // Notifikasi WA otomatis ke klien saat status berubah (try/catch — tidak boleh menggagalkan aksi admin)
        if ($previousStatus !== $validated['status']) {
            try {
                app(WhatsappService::class)->notifyProjectUpdate($order->fresh('user'));
            } catch (\Throwable $e) {
                Log::warning('WA status notif gagal', ['order' => $order->id, 'msg' => $e->getMessage()]);
            }
        }

        return back()->with('success', "Order #{$order->id} updated to {$validated['status']}.");
    }

    /**
     * Generate DP invoice (50%) jika belum ada — untuk project lama yang belum ada invoice
     */
    public function generateInvoice(Project $order, MidtransService $midtrans)
    {
        if ($order->budget <= 0) {
            return back()->with('error', 'Cannot generate invoice: budget is not set.');
        }

        $existingDp = Invoice::where('project_id', $order->id)->whereIn('kind', ['dp', 'full'])->first();
        if ($existingDp) {
            return back()->with('error', "Invoice DP/full {$existingDp->number} sudah ada untuk proyek ini.");
        }

        $amount = (int) ceil($order->budget * 0.5);
        $tax = (int) round($amount * 0.11);

        $invoice = Invoice::create([
            'number' => 'INV-'.now()->format('Ymd').'-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT).'-DP',
            'project_id' => $order->id,
            'user_id' => $order->user_id,
            'amount' => $amount,
            'tax' => $tax,
            'total' => $amount + $tax,
            'status' => 'unpaid',
            'due_date' => now()->addDays(3),
            'kind' => 'dp',
            'label' => 'DP 50% — Pembayaran Awal',
        ]);

        try {
            $midtrans->createSnapToken($invoice);
        } catch (\Throwable $e) {
            Log::warning('Generate DP snap gagal', ['order' => $order->id, 'msg' => $e->getMessage()]);
        }

        // auto kirim notif
        try {
            SendInvoiceNotification::dispatch($order->load('user'), $invoice);
        } catch (\Throwable $e) {
        }

        return back()->with('success', "Invoice DP {$invoice->number} (50%) berhasil dibuat + notif WA/email dikirim.");
    }

    /**
     * Generate pelunasan 50% — hanya jika progress 100% atau status completed, dan belum ada final
     */
    public function generateFinalInvoice(Project $order, MidtransService $midtrans)
    {
        if ($order->budget <= 0) {
            return back()->with('error', 'Budget belum diisi.');
        }

        // Guard: hanya boleh saat 100% atau completed
        if (($order->progress < 100) && $order->status !== 'completed') {
            return back()->with('error', 'Pelunasan hanya bisa dibuat saat progress 100% atau status Completed. Progress sekarang: '.$order->progress.'% — '.$order->status);
        }

        $existingFinal = Invoice::where('project_id', $order->id)->where('kind', 'final')->first();
        if ($existingFinal) {
            return back()->with('error', "Invoice Pelunasan {$existingFinal->number} sudah ada.");
        }

        $dp = Invoice::where('project_id', $order->id)->where('kind', 'dp')->first();
        $full = Invoice::where('project_id', $order->id)->where('kind', 'full')->first();
        if ($full) {
            return back()->with('error', "Proyek ini pakai invoice FULL ({$full->number}), tidak perlu pelunasan terpisah.");
        }

        // Hitung sisa: budget - dp_amount (jika tidak ada dp, ambil 50% juga)
        $amount = $dp ? ($order->budget - $dp->amount) : (int) ceil($order->budget * 0.5);
        if ($amount <= 0) {
            $amount = (int) ceil($order->budget * 0.5);
        }
        $tax = (int) round($amount * 0.11);

        $invoice = Invoice::create([
            'number' => 'INV-'.now()->format('Ymd').'-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT).'-LUNAS',
            'project_id' => $order->id,
            'user_id' => $order->user_id,
            'amount' => $amount,
            'tax' => $tax,
            'total' => $amount + $tax,
            'status' => 'unpaid',
            'due_date' => now()->addDays(7),
            'kind' => 'final',
            'label' => 'Pelunasan 50% — Selesai Proyek',
        ]);

        try {
            $midtrans->createSnapToken($invoice);
        } catch (\Throwable $e) {
            Log::warning('Generate Pelunasan snap gagal', ['order' => $order->id, 'msg' => $e->getMessage()]);
        }

        try {
            SendInvoiceNotification::dispatch($order->load('user'), $invoice);
        } catch (\Throwable $e) {
        }

        // juga siapkan waLink untuk flash
        $waService = app(WhatsappService::class);
        $payUrl = $invoice->snap_token ? (config('midtrans.is_production') ? 'https://app.midtrans.com/snap/v2/vtweb/' : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/').$invoice->snap_token : url('/pay/'.$order->order_code);
        $trackUrl = url('/pantau-pesanan?code='.$order->order_code);
        $pdfUrl = URL::temporarySignedRoute('invoice.pdf', now()->addMinutes(30), ['code' => $order->order_code, 'invoice' => $invoice->number]);
        $waMessage = $waService->buildMessage($order->load('user'), $invoice, $payUrl, $trackUrl, $pdfUrl);
        $waLink = $waService->waLink($order->client_wa_cache ?? $order->user->phone ?? '', $waMessage);

        return back()->with('success', "Invoice Pelunasan {$invoice->number} (".number_format($invoice->total, 0, ',', '.').') dibuat + notif dikirim.')
            ->with('invoice_payload', [
                'order_code' => $order->order_code,
                'invoice_number' => $invoice->number,
                'invoice_total' => $invoice->total,
                'payUrl' => $payUrl,
                'trackUrl' => $trackUrl,
                'pdfUrl' => $pdfUrl,
                'waLink' => $waLink,
                'waMessage' => $waMessage,
                'kind' => 'final',
            ]);
    }

    /**
     * Resend notif WA + Email untuk invoice tertentu (DP atau Pelunasan)
     */
    public function resendInvoice(Request $request, Project $order)
    {
        $validated = $request->validate([
            'invoice_id' => ['required', 'exists:invoices,id'],
        ]);
        $invoice = Invoice::where('id', $validated['invoice_id'])->where('project_id', $order->id)->firstOrFail();

        try {
            SendInvoiceNotification::dispatch($order->load('user'), $invoice, true);
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal kirim notif: '.$e->getMessage());
        }

        // juga kasih waLink instant
        $waService = app(WhatsappService::class);
        $order->refresh();
        // pastikan snap token fresh
        try {
            if (! $invoice->snap_token || ($invoice->snap_token_expires_at && $invoice->snap_token_expires_at->isPast())) {
                app(MidtransService::class)->createSnapToken($invoice->fresh());
                $invoice->refresh();
            }
        } catch (\Throwable $e) {
        }
        $payUrl = $invoice->snap_token ? (config('midtrans.is_production') ? 'https://app.midtrans.com/snap/v2/vtweb/' : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/').$invoice->snap_token : url('/pay/'.$order->order_code);
        $trackUrl = url('/pantau-pesanan?code='.$order->order_code);
        $pdfUrl = URL::temporarySignedRoute('invoice.pdf', now()->addMinutes(30), ['code' => $order->order_code, 'invoice' => $invoice->number]);
        $waMessage = $waService->buildMessage($order->load('user'), $invoice, $payUrl, $trackUrl, $pdfUrl);
        $waLink = $waService->waLink($order->client_wa_cache ?? $order->user->phone ?? '', $waMessage);

        return back()->with('success', "Notif {$invoice->number} dikirim ulang (WA + Email).")
            ->with('invoice_payload', [
                'order_code' => $order->order_code,
                'invoice_number' => $invoice->number,
                'invoice_total' => $invoice->total,
                'payUrl' => $payUrl,
                'trackUrl' => $trackUrl,
                'pdfUrl' => $pdfUrl,
                'waLink' => $waLink,
                'waMessage' => $waMessage,
                'kind' => $invoice->kind ?? 'full',
            ]);
    }
}
