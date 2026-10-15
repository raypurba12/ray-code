<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Admin\HomepageController;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $request->user()
                    ? $request->user()->only('id', 'name', 'email', 'role', 'company')
                    : null,
            ],
            'flash' => fn () => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'invoice_payload' => fn () => $request->session()->get('invoice_payload'),
            'settings' => fn () => [
                'site_name' => Setting::get('site_name', 'Raycode'),
                'site_tagline' => Setting::get('site_tagline', 'We build digital products that ship.'),
                'contact_email' => Setting::get('contact_email', 'hello@raycode.dev'),
                'contact_phone' => Setting::get('contact_phone', '+62 812 3456 7890'),
                'whatsapp' => Setting::get('whatsapp', '+6281234567890'),
                'address' => Setting::get('address', 'Jakarta, Indonesia — Remote-first'),
                'announcement_text' => Setting::get('announcement_text', HomepageController::defaults()['announcement_text']),
                'announcement_text_mobile' => Setting::get('announcement_text_mobile', HomepageController::defaults()['announcement_text_mobile']),
                'announcement_cta_label' => Setting::get('announcement_cta_label', HomepageController::defaults()['announcement_cta_label']),
                'announcement_cta_href' => Setting::get('announcement_cta_href', HomepageController::defaults()['announcement_cta_href']),
                'footer_description' => Setting::get('footer_description', HomepageController::defaults()['footer_description']),
                'footer_tech_label' => Setting::get('footer_tech_label', HomepageController::defaults()['footer_tech_label']),
            ],
        ];
    }
}
