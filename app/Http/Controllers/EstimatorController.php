<?php

namespace App\Http\Controllers;

use App\Models\EstimatorLead;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EstimatorController extends Controller
{
    private array $defaultComplexities = [
        ['id' => 'simple', 'label' => 'Sederhana', 'multiplier' => 1, 'desc' => 'Halaman statis, pola standar'],
        ['id' => 'moderate', 'label' => 'Menengah', 'multiplier' => 1.8, 'desc' => 'Logika kustom, integrasi'],
        ['id' => 'complex', 'label' => 'Kompleks', 'multiplier' => 3.2, 'desc' => 'Sistem multi-peran, fitur real-time'],
    ];

    private array $defaultFeatures = [
        ['id' => 'auth', 'label' => 'Akun & peran pengguna', 'price' => 2500000],
        ['id' => 'payment', 'label' => 'Gerbang pembayaran', 'price' => 3500000],
        ['id' => 'admin', 'label' => 'Dasbor admin', 'price' => 4000000],
        ['id' => 'api', 'label' => 'API publik / siap mobile', 'price' => 5500000],
        ['id' => 'seo', 'label' => 'Setup SEO & analitik', 'price' => 1500000],
        ['id' => 'multilang', 'label' => 'Konten multibahasa', 'price' => 3000000],
    ];

    private array $defaultUrgencies = [
        ['id' => 'relaxed', 'label' => 'Santai (6+ minggu)', 'multiplier' => 1],
        ['id' => 'standard', 'label' => 'Standar (3–5 minggu)', 'multiplier' => 1.15],
        ['id' => 'rush', 'label' => 'Cepat (< 3 minggu)', 'multiplier' => 1.45],
    ];

    public function index()
    {
        $complexities = $this->resolve('estimator_complexities', $this->defaultComplexities);
        $features = $this->resolve('estimator_features', $this->defaultFeatures);
        $urgencies = $this->resolve('estimator_urgencies', $this->defaultUrgencies);

        return Inertia::render('Public/Estimator', [
            'services' => Service::where('type', 'package')->orWhere('type', 'joki')->orderBy('sort_order')->get(['id', 'slug', 'title', 'starting_price']),
            'complexities' => $complexities,
            'featureOptions' => $features,
            'urgencies' => $urgencies,
        ]);
    }

    public function storeLead(Request $request)
    {
        // honeypot
        if ($request->filled('website')) {
            return back()->with('success', 'Estimasi tersimpan.');
        }

        $validated = $request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'complexity' => ['required', 'string', 'max:60'],
            'features' => ['nullable', 'array', 'max:20'],
            'features.*' => ['string', 'max:60'],
            'urgency' => ['required', 'string', 'max:60'],
            'low' => ['required', 'integer', 'min:0'],
            'high' => ['required', 'integer', 'min:0'],
            'email' => ['nullable', 'email', 'max:255'],
            'wa' => ['nullable', 'string', 'max:20'],
        ]);

        // throttle by IP: 10 per hour (via RateLimiter di route, double check di sini)
        $ip = $request->ip();
        $countRecent = EstimatorLead::where('ip', $ip)->where('created_at', '>', now()->subHour())->count();
        if ($countRecent >= 10) {
            return back()->withErrors(['wa' => 'Terlalu banyak percobaan. Coba lagi 1 jam.']);
        }

        EstimatorLead::create([
            'service_id' => $validated['service_id'],
            'complexity' => $validated['complexity'],
            'features' => $validated['features'] ?? [],
            'urgency' => $validated['urgency'],
            'low_estimate' => $validated['low'],
            'high_estimate' => $validated['high'],
            'email' => $validated['email'] ?? null,
            'wa' => $validated['wa'] ?? null,
            'ip' => $ip,
            'user_agent' => $request->userAgent(),
        ]);

        // redirect ke order dengan prefill
        $serviceSlug = Service::where('id', $validated['service_id'])->value('slug');

        return redirect()->route('client.order.create', ['service' => $serviceSlug, 'budget' => $validated['low']])->with('success', 'Estimasi tersimpan — silakan lanjutkan order.');
    }

    private function resolve(string $key, array $fallback): array
    {
        $raw = Setting::get($key, null);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && count($decoded)) {
                return $decoded;
            }
        }

        return $fallback;
    }
}
