<?php

namespace App\Http\Controllers;

use App\Models\JokiService;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $locale = $request->cookie('locale', 'id');
        if (! in_array($locale, ['id', 'en'])) {
            $locale = 'id';
        }

        // PRD FR-2: sumber tunggal services[type=joki] — pertahankan logo asli devicon
        $hasJokiInServices = Service::where('type', 'joki')->exists();
        if ($hasJokiInServices) {
            $jokiServices = Service::where('type', 'joki')->orderBy('sort_order')
                ->get(['id', 'slug', 'title', 'short_desc as desc', 'category', 'category_en', 'icon', 'logo', 'sort_order'])
                ->map(function ($s) {
                    $s->title_en = null;
                    $s->desc_en = null;

                    // logo sudah dari kolom services.logo (backfill dari joki_services)
                    return $s;
                });
        } else {
            $jokiServices = JokiService::where('is_active', true)->orderBy('sort_order')->get(['id', 'slug', 'title', 'title_en', 'desc', 'desc_en', 'category', 'category_en', 'icon', 'logo']);
        }

        $type = $request->query('type');
        $servicesQuery = Service::orderBy('sort_order');
        if (in_array($type, ['package', 'joki'])) {
            $servicesQuery->where('type', $type);
        }

        return Inertia::render('Public/Services/Index', [
            'services' => $servicesQuery->get(),
            'jokiServices' => $jokiServices,
            'jokiHeader' => [
                'badge' => $locale === 'en' ? Setting::get('joki_header_badge_en', Setting::get('joki_header_badge', 'DEADLINE MEPET? KAMI SIAP 24 JAM')) : Setting::get('joki_header_badge', 'DEADLINE MEPET? KAMI SIAP 24 JAM'),
                'title' => $locale === 'en' ? Setting::get('joki_header_title_en', Setting::get('joki_header_title', 'Layanan Yang Diberikan Raycode!')) : Setting::get('joki_header_title', 'Layanan Yang Diberikan Raycode!'),
                'desc' => $locale === 'en' ? Setting::get('joki_header_desc_en', Setting::get('joki_header_desc', 'Kami menyediakan jasa pengerjaan tugas dan proyek coding untuk berbagai bahasa pemrograman dan framework. Dengan kualitas terbaik dan harga terjangkau, kami siap membantu tugas Anda selesai tepat waktu!')) : Setting::get('joki_header_desc', 'Kami menyediakan jasa pengerjaan tugas dan proyek coding untuk berbagai bahasa pemrograman dan framework. Dengan kualitas terbaik dan harga terjangkau, kami siap membantu tugas Anda selesai tepat waktu!'),
            ],
            'activeType' => $type,
        ]);
    }

    public function reguler()
    {
        return Inertia::render('Public/Services/Reguler', [
            'services' => Service::orderBy('sort_order')->get(),
        ]);
    }

    public function show(string $slug)
    {
        $service = Service::where('slug', $slug)->firstOrFail();

        return Inertia::render('Public/Services/Show', [
            'service' => $service,
            'relatedServices' => Service::where('id', '!=', $service->id)->orderBy('sort_order')->take(3)->get(['slug', 'title', 'short_desc', 'icon']),
        ]);
    }
}
