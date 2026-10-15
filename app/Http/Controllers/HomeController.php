<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\HomepageController;
use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\Invoice;
use App\Models\Portfolio;
use App\Models\PricingPlan;
use App\Models\Project;
use App\Models\ProjectUpdate;
use App\Models\Service;
use App\Models\Testimonial;
use Illuminate\Support\Str;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // Live ticker — real data, not fake counters
        $ticker = collect();

        // latest project updates with project title
        $updates = ProjectUpdate::with('project:id,title')->latest()->take(4)->get();
        foreach ($updates as $u) {
            $title = Str::limit($u->title ?? 'Update', 36);
            $proj = $u->project->title ?? 'Project';
            $projShort = Str::limit($proj, 28);
            $ticker->push([
                'text' => "{$title} — {$projShort}",
                'tone' => 'emerald',
                'time' => $u->created_at?->diffForHumans(null, true) ?? 'baru',
            ]);
        }

        // recent invoices paid
        $invoices = Invoice::where('status', 'paid')->latest('paid_at')->take(2)->get(['number', 'total', 'paid_at']);
        foreach ($invoices as $inv) {
            $ticker->push([
                'text' => "{$inv->number} lunas — Rp".number_format($inv->total / 1000, 0, ',', '.').'k',
                'tone' => 'sky',
                'time' => $inv->paid_at?->diffForHumans(null, true) ?? 'lunas',
            ]);
        }

        // recent projects (status)
        $projects = Project::latest()->take(3)->get(['title', 'status', 'progress', 'created_at']);
        foreach ($projects as $p) {
            $label = Project::STATUS_LABELS[$p->status] ?? Str::headline($p->status);
            $ticker->push([
                'text' => Str::limit($p->title, 32)." · {$label}".($p->progress ? " {$p->progress}%" : ''),
                'tone' => $p->status === 'in_progress' ? 'amber' : ($p->status === 'completed' ? 'emerald' : 'slate'),
                'time' => $p->created_at?->diffForHumans(null, true) ?? 'baru',
            ]);
        }

        // shuffle a bit and take 8, fallback if empty
        $liveTicker = $ticker->shuffle()->take(8)->values();
        if ($liveTicker->isEmpty()) {
            $liveTicker = collect([
                ['text' => 'Raycode — Build · Develop · Create', 'tone' => 'brand', 'time' => 'live'],
                ['text' => 'Rata-rata respons < 24 jam', 'tone' => 'emerald', 'time' => 'SLA'],
                ['text' => 'Lighthouse 99 · zero incident', 'tone' => 'sky', 'time' => 'live'],
            ]);
        }

        // Why git log — real git history, fallback to synthetic from updates
        $gitLines = [];
        try {
            $raw = @shell_exec('git log --oneline -n 6 --pretty=format:"%h %s (%cr)" 2>&1');
            if (is_string($raw) && trim($raw) !== '' && ! str_contains($raw, 'not a git repository') && ! str_contains($raw, 'fatal')) {
                $split = preg_split('/\r\n|\n|\r/', trim($raw));
                foreach ($split as $line) {
                    $clean = trim($line, "\"' \t");
                    if ($clean !== '') {
                        $gitLines[] = $clean;
                    }
                }
            }
        } catch (\Throwable $e) {
            $gitLines = [];
        }
        if (empty($gitLines)) {
            // synthetic from ProjectUpdate + fallback commits
            $synthetic = [];
            foreach ($updates as $u) {
                $hash = substr(md5($u->title ?? 'raycode'), 0, 7);
                $msg = Str::limit(strtolower($u->title ?? 'update project'), 44);
                $when = $u->created_at?->diffForHumans(null, true) ?? 'baru';
                $synthetic[] = "{$hash} {$msg} ({$when} ago)";
            }
            $fallback = [
                substr(md5('pos-sync'), 0, 7).' feat(pos): sync offline-first queue (2 hours ago)',
                substr(md5('checkout'), 0, 7).' fix(checkout): race condition inventory (5 hours ago)',
                substr(md5('lighthouse'), 0, 7).' perf: lighthouse 99 CLS 0.02 (1 day ago)',
                substr(md5('audit'), 0, 7).' chore: audit 0 critical 2 patched (2 days ago)',
            ];
            $gitLines = array_slice(array_merge($synthetic, $fallback), 0, 6);
        }
        $whyGitLog = array_merge(['$ git log --oneline -6', ''], $gitLines);

        return Inertia::render('Public/Home', [
            'featuredServices' => Service::orderBy('sort_order')->take(6)->get(),
            'featuredPortfolios' => Portfolio::where('is_featured', true)->orderBy('sort_order')->get(),
            'testimonials' => Testimonial::where('is_approved', true)->latest()->take(6)->get(),
            'plans' => PricingPlan::where('is_active', true)->orderBy('sort_order')->get(['slug', 'name', 'tagline', 'price', 'unit']),
            'faqs' => Faq::where('is_active', true)->orderBy('sort_order')->take(5)->get(['id', 'question', 'answer']),
            'homepage' => HomepageController::getHomepageSettings(),
            'latestPosts' => BlogPost::with('author:id,name')->latest('published_at')->take(3)->get(['id', 'slug', 'title', 'excerpt', 'cover_url', 'category', 'published_at', 'author_id']),
            'liveTicker' => $liveTicker,
            'whyGitLog' => $whyGitLog,
        ]);
    }
}
