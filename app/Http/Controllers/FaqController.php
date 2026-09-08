<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\Testimonial;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/Faq', [
            'faqs' => Faq::where('is_active', true)->orderBy('sort_order')->get(),
            'testimonials' => Testimonial::where('is_approved', true)->latest()->take(3)->get(['name', 'role', 'company', 'content', 'rating']),
        ]);
    }
}
