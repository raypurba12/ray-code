<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Orders', [
            'orders' => Project::with(['user:id,name,email', 'service:id,title'])
                ->when($request->query('status'), fn ($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'filters' => ['status' => $request->query('status')],
        ]);
    }

    public function updateStatus(Request $request, Project $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,in_review,in_progress,review,completed,cancelled'],
        ]);

        $data = ['status' => $validated['status']];

        if ($validated['status'] === 'in_progress' && ! $order->started_at) {
            $data['started_at'] = now();
        }

        if ($validated['status'] === 'completed') {
            $data['completed_at'] = now();
            $data['progress'] = 100;
        }

        $order->update($data);

        return back()->with('success', "Order #{$order->id} updated to {$validated['status']}.");
    }

    public function generateInvoice(Project $order)
    {
        if ($order->budget <= 0) {
            return back()->with('error', 'Cannot generate invoice: budget is not set.');
        }

        $existing = Invoice::where('project_id', $order->id)->first();
        if ($existing) {
            return back()->with('error', "Invoice {$existing->number} already exists for this project.");
        }

        $amount = $order->budget;
        $tax = (int) round($amount * 0.11);

        Invoice::create([
            'number' => 'INV-'.now()->format('Ymd').'-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT),
            'project_id' => $order->id,
            'user_id' => $order->user_id,
            'amount' => $amount,
            'tax' => $tax,
            'total' => $amount + $tax,
            'status' => 'unpaid',
            'due_date' => now()->addDays(14),
        ]);

        return back()->with('success', 'Invoice generated successfully.');
    }
}
