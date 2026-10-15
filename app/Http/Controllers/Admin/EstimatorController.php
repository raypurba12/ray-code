<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EstimatorLead;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
        return Inertia::render('Admin/Estimator', [
            'complexities' => $this->getComplexities(),
            'features' => $this->getFeatures(),
            'urgencies' => $this->getUrgencies(),
            'leads' => EstimatorLead::with('service:id,title,slug')->latest()->take(50)->get(),
            'leadsCount' => EstimatorLead::count(),
        ]);
    }

    public function leads()
    {
        return Inertia::render('Admin/EstimatorLeads', [
            'leads' => EstimatorLead::with('service:id,title,slug')->latest()->paginate(20),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'complexities' => ['required', 'array', 'min:1', 'max:10'],
            'complexities.*.id' => ['required', 'string', 'max:60'],
            'complexities.*.label' => ['required', 'string', 'max:120'],
            'complexities.*.multiplier' => ['required', 'numeric', 'between:0.1,10'],
            'complexities.*.desc' => ['nullable', 'string', 'max:200'],

            'features' => ['required', 'array', 'min:1', 'max:20'],
            'features.*.id' => ['required', 'string', 'max:60'],
            'features.*.label' => ['required', 'string', 'max:120'],
            'features.*.price' => ['required', 'integer', 'min:0', 'max:1000000000'],

            'urgencies' => ['required', 'array', 'min:1', 'max:10'],
            'urgencies.*.id' => ['required', 'string', 'max:60'],
            'urgencies.*.label' => ['required', 'string', 'max:120'],
            'urgencies.*.multiplier' => ['required', 'numeric', 'between:0.1,10'],
        ]);

        // normalize ids to slug
        foreach (['complexities', 'features', 'urgencies'] as $group) {
            $seen = [];
            foreach ($validated[$group] as $idx => $item) {
                $slug = Str::slug($item['id']) ?: Str::slug($item['label']);
                // ensure unique within group
                $base = $slug;
                $c = 1;
                while (in_array($slug, $seen, true)) {
                    $slug = $base.'-'.$c++;
                }
                $seen[] = $slug;
                $validated[$group][$idx]['id'] = $slug;
            }
            // also ensure multipliers/prices are proper types
        }

        Setting::set('estimator_complexities', json_encode($validated['complexities'], JSON_UNESCAPED_UNICODE));
        Setting::set('estimator_features', json_encode($validated['features'], JSON_UNESCAPED_UNICODE));
        Setting::set('estimator_urgencies', json_encode($validated['urgencies'], JSON_UNESCAPED_UNICODE));

        return back()->with('success', 'Pengaturan estimator disimpan.');
    }

    private function getComplexities(): array
    {
        $raw = Setting::get('estimator_complexities', null);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && count($decoded)) {
                return $decoded;
            }
        }

        return $this->defaultComplexities;
    }

    private function getFeatures(): array
    {
        $raw = Setting::get('estimator_features', null);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && count($decoded)) {
                return $decoded;
            }
        }

        return $this->defaultFeatures;
    }

    private function getUrgencies(): array
    {
        $raw = Setting::get('estimator_urgencies', null);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && count($decoded)) {
                return $decoded;
            }
        }

        return $this->defaultUrgencies;
    }
}
