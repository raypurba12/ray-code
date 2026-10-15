<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PricingPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PricingPlanController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/PricingPlans', [
            'plans' => PricingPlan::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        PricingPlan::create($this->validated($request));

        return back()->with('success', 'Paket harga berhasil dibuat.');
    }

    public function update(Request $request, PricingPlan $pricingPlan)
    {
        $pricingPlan->update($this->validated($request));

        return back()->with('success', 'Paket harga diperbarui.');
    }

    public function destroy(PricingPlan $pricingPlan)
    {
        $pricingPlan->delete();

        return back()->with('success', 'Paket harga dihapus.');
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120'],
            'tagline' => ['required', 'string', 'max:300'],
            'price' => ['required', 'integer', 'min:0'],
            'unit' => ['required', 'string', 'max:30'],
            'features' => ['required', 'array', 'min:1'],
            'features.*' => ['string', 'max:255'],
            'is_popular' => ['boolean'],
            'is_active' => ['boolean'],
            'cta_text' => ['required', 'string', 'max:100'],
            'sort_order' => ['integer', 'min:0', 'max:999'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        // Ensure unique slug (append counter if exists)
        $original = $validated['slug'];
        $counter = 1;
        $existsCheck = fn ($slug) => PricingPlan::where('slug', $slug)->when(isset($validated['id']), fn ($q) => $q->where('id', '!=', $validated['id']))->exists();
        // For update, need to exclude current id
        $currentId = request()->route('pricingPlan')?->id ?? request()->route('pricing_plan')?->id ?? null;
        while (PricingPlan::where('slug', $validated['slug'])->when($currentId, fn ($q) => $q->where('id', '!=', $currentId))->exists()) {
            $validated['slug'] = $original.'-'.$counter++;
        }

        return $validated;
    }
}
