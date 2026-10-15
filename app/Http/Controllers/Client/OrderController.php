<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Jobs\NotifyOrderCreated;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Client/Order', [
            'services' => Service::orderBy('sort_order')->get(['id', 'slug', 'title', 'starting_price', 'delivery_days']),
            'prefill' => [
                'service_id' => $request->query('service'),
                'budget' => $request->query('budget'),
                'title' => $request->query('title'),
                'deadline' => $request->query('deadline'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'service_id' => ['required', 'exists:services,id'],
            'requirements' => ['required', 'string', 'min:20'],
            'budget' => ['required', 'integer', 'min:100000'],
            'deadline' => ['required', 'date', 'after:today'],
        ]);

        $project = $request->user()->projects()->create([
            ...$validated,
            'specs' => $request->input('specs'),
            'status' => 'pending',
        ]);

        NotifyOrderCreated::dispatch($project);

        return redirect()
            ->route('client.projects.show', $project)
            ->with('success', 'Order placed! Our team will review your requirements and get back to you within 24 hours.');
    }
}
