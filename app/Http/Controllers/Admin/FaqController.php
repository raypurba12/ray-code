<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        $query = Faq::query()->orderBy('sort_order');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        return Inertia::render('Admin/Faqs', [
            'faqs' => $query->get(),
            'categories' => Faq::select('category')->distinct()->pluck('category'),
            'filters' => ['category' => $request->category],
        ]);
    }

    public function store(Request $request)
    {
        Faq::create($request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string', 'max:2000'],
            'category' => ['required', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_active' => ['boolean'],
        ]));

        return back()->with('success', 'FAQ berhasil ditambahkan.');
    }

    public function update(Request $request, Faq $faq)
    {
        $faq->update($request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string', 'max:2000'],
            'category' => ['required', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_active' => ['boolean'],
        ]));

        return back()->with('success', 'FAQ diperbarui.');
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return back()->with('success', 'FAQ dihapus.');
    }
}
