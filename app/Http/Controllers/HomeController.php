<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\HomepageController;
use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\PricingPlan;
use App\Models\Service;
use App\Models\Portfolio;
use App\Models\Testimonial;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/Home', [
            'featuredServices' => Service::orderBy('sort_order')->take(6)->get(),
            'featuredPortfolios' => Portfolio::where('is_featured', true)->orderBy('sort_order')->get(),
            'testimonials' => Testimonial::where('is_approved', true)->latest()->take(6)->get(),
            'plans' => PricingPlan::where('is_active', true)->orderBy('sort_order')->get(['slug', 'name', 'tagline', 'price', 'unit']),
            'faqs' => Faq::where('is_active', true)->orderBy('sort_order')->take(5)->get(['id', 'question', 'answer']),
            'homepage' => HomepageController::getHomepageSettings(),
            'latestPosts' => BlogPost::with('author:id,name')->latest('published_at')->take(3)->get(['id', 'slug', 'title', 'excerpt', 'cover_url', 'category', 'published_at', 'author_id']),
        ]);
    }
}
