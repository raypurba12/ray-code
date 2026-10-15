<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Portfolio;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Schema;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $base = rtrim(config('app.url', 'https://raycode.dev'), '/');

        $urls = [];

        // Static pages — lastmod pakai updated_at terbaru dari model terkait atau now() jika tidak ada
        $latestUpdate = Service::max('updated_at') ?? Portfolio::max('updated_at') ?? now();
        $staticUpdated = $latestUpdate ? Carbon::parse($latestUpdate)->toDateString() : now()->toDateString();
        foreach (['/', '/services', '/portfolio', '/pricing', '/estimator', '/blog', '/faq', '/contact', '/cara-pesan', '/pantau-pesanan'] as $path) {
            $urls[] = ['loc' => $base.$path, 'updated' => $staticUpdated, 'priority' => $path === '/' ? '1.0' : '0.8'];
        }

        // Services
        foreach (Service::select('slug', 'updated_at')->get() as $s) {
            $urls[] = ['loc' => $base.'/services/'.$s->slug, 'updated' => $s->updated_at->toDateString(), 'priority' => '0.7'];
        }

        // Portfolios
        foreach (Portfolio::select('slug', 'updated_at')->get() as $p) {
            $urls[] = ['loc' => $base.'/portfolio/'.$p->slug, 'updated' => $p->updated_at->toDateString(), 'priority' => '0.6'];
        }

        // Blog posts (published if column exists, else all)
        $blogQuery = BlogPost::query();
        if (Schema::hasColumn('blog_posts', 'published_at')) {
            $blogQuery->whereNotNull('published_at');
        }
        foreach ($blogQuery->select('slug', 'updated_at')->get() as $b) {
            $urls[] = ['loc' => $base.'/blog/'.$b->slug, 'updated' => $b->updated_at->toDateString(), 'priority' => '0.6'];
        }

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
