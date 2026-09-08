<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Testimonials', [
            'testimonials' => Testimonial::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        Testimonial::create($this->validated($request) + ['is_approved' => true]);

        return back()->with('success', 'Testimonial added.');
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        if ($request->has('toggle_approved')) {
            $testimonial->update(['is_approved' => ! $testimonial->is_approved]);

            return back()->with('success', 'Testimonial '.($testimonial->is_approved ? 'approved' : 'unapproved').'.');
        }

        $testimonial->update($this->validated($request));

        return back()->with('success', 'Testimonial updated.');
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();

        return back()->with('success', 'Testimonial deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'max:100'],
            'company' => ['required', 'string', 'max:100'],
            'content' => ['required', 'string', 'max:1000'],
            'rating' => ['required', 'integer', 'between:1,5'],
        ]);
    }
}
