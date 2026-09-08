<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Services', [
            'services' => Service::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Service::create($this->validated($request));

        return back()->with('success', 'Service created.');
    }

    public function update(Request $request, Service $service)
    {
        $service->update($this->validated($request));

        return back()->with('success', 'Service updated.');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return back()->with('success', 'Service deleted.');
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'icon' => ['required', 'string', 'max:50'],
            'short_desc' => ['required', 'string', 'max:300'],
            'description' => ['required', 'string'],
            'features' => ['required', 'array', 'min:1'],
            'features.*' => ['string', 'max:255'],
            'starting_price' => ['required', 'integer', 'min:0'],
            'delivery_days' => ['required', 'integer', 'min:1'],
            'is_featured' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        return $validated;
    }
}
