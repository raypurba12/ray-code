<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Client/Dashboard', [
            'stats' => [
                'projects' => $user->projects()->count(),
                'activeProjects' => $user->projects()->whereIn('status', ['in_progress', 'in_review', 'review'])->count(),
                'completed' => $user->projects()->where('status', 'completed')->count(),
                'unpaidInvoices' => $user->invoices()->where('status', 'unpaid')->count(),
            ],
            'recentProjects' => $user->projects()->with('service:id,title,icon')->latest()->take(5)->get(),
            'invoices' => $user->invoices()->with('project:id,title')->latest()->take(4)->get(['id', 'number', 'total', 'status', 'due_date', 'project_id']),
        ]);
    }
}
