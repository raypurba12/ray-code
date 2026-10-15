<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::query()->orderBy('sort_order')
            ->when($request->filled('q'), fn ($q) => $q->where(fn ($w) => $w->where('title', 'like', "%{$request->q}%")->orWhere('slug', 'like', "%{$request->q}%")))
            ->when(in_array($request->query('type'), ['package', 'joki']), fn ($q) => $q->where('type', $request->query('type')))
            ->when(in_array($request->query('status'), ['draft', 'published']), fn ($q) => $q->where('status', $request->query('status')));

        return Inertia::render('Admin/Services', [
            'services' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['q', 'type', 'status']),
            'counts' => [
                'all' => Service::count(),
                'package' => Service::where('type', 'package')->count(),
                'joki' => Service::where('type', 'joki')->count(),
                'draft' => Service::where('status', 'draft')->count(),
                'published' => Service::where('status', 'published')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $this->handlePublishStatus($validated);

        Service::create($validated);

        return back()->with('success', 'Service created.');
    }

    public function update(Request $request, Service $service)
    {
        $validated = $this->validated($request);
        $this->handlePublishStatus($validated, $service);

        $service->update($validated);

        return back()->with('success', 'Service updated.');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return back()->with('success', 'Service deleted.');
    }

    public function toggleStatus(Request $request, Service $service)
    {
        $newStatus = $request->boolean('status') ? 'published' : 'draft';
        $updateData = ['status' => $newStatus];

        if ($newStatus === 'published' && $service->published_at === null) {
            $updateData['published_at'] = now();
        }

        $service->update($updateData);

        return back()->with('success', "Service status updated to {$newStatus}.");
    }

    private function handlePublishStatus(array &$validated, ?Service $service = null): void
    {
        if (isset($validated['status']) && $validated['status'] === 'published') {
            if (! isset($validated['published_at']) || empty($validated['published_at'])) {
                $validated['published_at'] = now();
            }
        } elseif (isset($validated['status']) && $validated['status'] === 'draft') {
            $validated['published_at'] = null;
        }
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'icon' => ['required', 'string', 'max:50'],
            'logo' => ['nullable', 'string', 'max:500'],
            'short_desc' => ['required', 'string', 'max:300'],
            'description' => ['required', 'string'],
            'features' => ['required', 'array', 'min:1'],
            'features.*' => ['string', 'max:255'],
            'starting_price' => ['required', 'integer', 'min:0'],
            'delivery_days' => ['required', 'integer', 'min:1'],
            'is_featured' => ['boolean'],
            'sort_order' => ['integer'],
            'type' => ['nullable', 'in:package,joki'],
            'category' => ['nullable', 'string', 'max:100'],
            'category_en' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }
        if (empty($validated['type'])) {
            $validated['type'] = 'package';
        }
        if (! isset($validated['status'])) {
            $validated['status'] = 'draft';
        }

        return $validated;
    }
}
