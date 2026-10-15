<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'revenue' => Invoice::where('status', 'paid')->sum('total'),
                'pendingRevenue' => Invoice::where('status', 'unpaid')->sum('total'),
                'projects' => Project::count(),
                'activeProjects' => Project::whereIn('status', ['in_progress', 'in_review', 'review'])->count(),
                'clients' => User::where('role', 'client')->count(),
                'unreadContacts' => ContactMessage::whereNull('read_at')->count(),
            ],
            'recentOrders' => Project::with(['user:id,name', 'service:id,title'])->latest()->take(6)->get(),
            'monthlyRevenue' => $this->monthlyRevenue(),
        ]);
    }

    private function monthlyRevenue(): array
    {
        $invoices = Invoice::where('status', 'paid')
            ->whereNotNull('paid_at')
            ->whereYear('paid_at', now()->year)
            ->get();

        $grouped = $invoices->groupBy(function ($invoice) {
            return Carbon::parse($invoice->paid_at)->format('Y-m');
        })->sortKeys();

        return $grouped->map(function ($items, $monthKey) {
            return [
                'month' => Carbon::parse($monthKey.'-01')->format('M'),
                'total' => (int) $items->sum('total'),
            ];
        })->values()->all();
    }
}
