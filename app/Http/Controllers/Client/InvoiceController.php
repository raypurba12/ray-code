<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Client/Invoices', [
            'invoices' => $request->user()->invoices()->with('project:id,title')->latest()->get(),
        ]);
    }

    public function show(Request $request, Invoice $invoice)
    {
        abort_unless($invoice->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        return Inertia::render('Client/InvoiceShow', [
            'invoice' => $invoice->load(['project:id,title,service_id', 'project.service:title,id', 'user:id,name,email,company']),
            'midtransClientKey' => config('midtrans.client_key', env('MIDTRANS_CLIENT_KEY', '')),
        ]);
    }

    public function pay(Request $request, Invoice $invoice, MidtransService $midtransService)
    {
        abort_unless($invoice->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        if ($invoice->status === 'paid') {
            return back()->with('error', 'Invoice ini sudah lunas.');
        }

        try {
            $snapToken = $invoice->snap_token;

            if (! $snapToken) {
                $snapToken = $midtransService->createSnapToken($invoice);
            }

            return back()->with('snap_token', $snapToken);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
