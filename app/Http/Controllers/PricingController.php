<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use App\Models\Faq;
use Inertia\Inertia;

class PricingController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/Pricing', [
            'plans' => PricingPlan::where('is_active', true)->orderBy('sort_order')->get(),
            'faqs' => Faq::where('is_active', true)->where('category', 'Pricing')->orderBy('sort_order')->get(['question', 'answer']),
        ]);
    }
}
