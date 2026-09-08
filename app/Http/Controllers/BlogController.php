<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/Blog/Index', [
            'posts' => BlogPost::with('author:id,name')->latest('published_at')->latest('created_at')->get(['id', 'slug', 'title', 'excerpt', 'cover_url', 'category', 'tags', 'published_at', 'author_id']),
            'categories' => BlogPost::select('category')->distinct()->pluck('category'),
        ]);
    }

    public function show(string $slug)
    {
        $post = BlogPost::with('author:id,name')->where('slug', $slug)->firstOrFail();

        $related = BlogPost::where('id', '!=', $post->id)->where('category', $post->category)->latest('published_at')->take(3)->get(['id', 'slug', 'title', 'excerpt', 'cover_url', 'category', 'published_at']);

        return Inertia::render('Public/Blog/Show', [
            'post' => $post,
            'related' => $related,
        ]);
    }
}
