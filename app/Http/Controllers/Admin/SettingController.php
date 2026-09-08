<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => [
                'site_name' => Setting::get('site_name', 'Raycode'),
                'site_tagline' => Setting::get('site_tagline', 'We build digital products that ship.'),
                'contact_email' => Setting::get('contact_email', 'hello@raycode.dev'),
                'contact_phone' => Setting::get('contact_phone', '+62 812 3456 7890'),
                'whatsapp' => Setting::get('whatsapp', '+6281234567890'),
                'address' => Setting::get('address', 'Jakarta, Indonesia — Remote-first'),
                'invoice_tax_rate' => Setting::get('invoice_tax_rate', '11'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => ['required', 'string', 'max:100'],
            'site_tagline' => ['nullable', 'string', 'max:200'],
            'contact_email' => ['required', 'email'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:300'],
            'invoice_tax_rate' => ['nullable', 'numeric', 'between:0,50'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, (string) $value);
        }

        return back()->with('success', 'Settings saved.');
    }
}
