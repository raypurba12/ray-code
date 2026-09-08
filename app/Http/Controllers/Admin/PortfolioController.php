<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Portfolios', [
            'portfolios' => Portfolio::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Portfolio::create($this->validated($request));

        return back()->with('success', 'Portfolio created.');
    }

    public function update(Request $request, Portfolio $portfolio)
    {
        $portfolio->update($this->validated($request));

        return back()->with('success', 'Portfolio updated.');
    }

    public function destroy(Portfolio $portfolio)
    {
        $portfolio->delete();

        return back()->with('success', 'Portfolio deleted.');
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'client_name' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'digits:4'],
            'thumbnail_url' => ['nullable', 'url'],
            'gallery_urls' => ['nullable', 'array'],
            'gallery_urls.*' => ['url'],
            'description' => ['required', 'string'],
            'tech_stack' => ['required', 'array', 'min:1'],
            'tech_stack.*' => ['string', 'max:50'],
            'live_url' => ['nullable', 'url'],
            'is_featured' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']).'-'.Str::lower(Str::random(4));
        }

        return $validated;
    }
}
