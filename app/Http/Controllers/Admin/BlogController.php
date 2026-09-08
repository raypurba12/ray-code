<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Blog', [
            'posts' => BlogPost::with('author:id,name')->latest('created_at')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']).'-'.Str::lower(Str::random(4));
        }
        $validated['author_id'] = $request->user()->id;
        $validated['published_at'] = ($validated['published_at'] ?? null) ? $validated['published_at'] : now();

        BlogPost::create($validated);

        return back()->with('success', 'Blog post published.');
    }

    public function update(Request $request, BlogPost $post)
    {
        $validated = $this->validated($request);
        if (!empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }
        // keep original slug if empty
        if (empty($validated['slug'])) {
            $validated['slug'] = $post->slug;
        }
        // ensure unique if slug changed
        $original = $validated['slug'];
        $counter = 1;
        while (BlogPost::where('slug', $validated['slug'])->where('id', '!=', $post->id)->exists()) {
            $validated['slug'] = $original . '-' . $counter++;
        }

        $post->update($validated);

        return back()->with('success', 'Artikel diperbarui.');
    }

    public function destroy(BlogPost $post)
    {
        $post->delete();

        return back()->with('success', 'Blog post deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['required', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_url' => ['nullable', 'url'],
            'category' => ['required', 'string', 'max:100'],
            'tags' => ['nullable', 'array'],
            'published_at' => ['nullable', 'date'],
        ]);
    }
}
