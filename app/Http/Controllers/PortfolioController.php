<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->query('category');

        return Inertia::render('Public/Portfolio/Index', [
            'items' => Portfolio::orderBy('sort_order')
                ->when($category && $category !== 'All', fn ($q) => $q->where('category', $category))
                ->get(),
            'categories' => Portfolio::distinct()->pluck('category'),
        ]);
    }

    public function show(string $slug)
    {
        $portfolio = Portfolio::where('slug', $slug)->firstOrFail();

        return Inertia::render('Public/Portfolio/Show', [
            'item' => $portfolio,
            'related' => Portfolio::where('id', '!=', $portfolio->id)
                ->where('category', $portfolio->category)
                ->orWhere('is_featured', true)
                ->where('id', '!=', $portfolio->id)
                ->distinct()
                ->take(3)
                ->get(['slug', 'title', 'category', 'thumbnail_url']),
        ]);
    }
}
