<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Invoice;
use App\Models\Message;
use App\Models\Project;
use App\Models\User;
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
        $rows = Invoice::selectRaw("DATE_FORMAT(paid_at, '%Y-%m') as month, SUM(total) as total")
            ->where('status', 'paid')
            ->whereYear('paid_at', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $rows->map(fn ($r) => ['month' => \Carbon\Carbon::parse($r->month.'-01')->format('M'), 'total' => (int) $r->total])->all();
    }
}
