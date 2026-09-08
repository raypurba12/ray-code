<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
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
        ]);
    }
}
