<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JokiService;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class JokiServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = JokiService::query()->orderBy('sort_order');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('search')) {
            $query->where(fn ($q) => $q->where('title', 'like', "%{$request->search}%")->orWhere('desc', 'like', "%{$request->search}%"));
        }

        return Inertia::render('Admin/JokiServices', [
            'services' => $query->get(),
            'categories' => JokiService::select('category')->distinct()->orderBy('category')->pluck('category'),
            'filters' => [
                'category' => $request->category,
                'search' => $request->search,
            ],
            'stats' => [
                'total' => JokiService::count(),
                'active' => JokiService::where('is_active', true)->count(),
            ],
            'header' => [
                'badge' => Setting::get('joki_header_badge', 'DEADLINE MEPET? KAMI SIAP 24 JAM'),
                'badge_en' => Setting::get('joki_header_badge_en', 'TIGHT DEADLINE? WE ARE READY 24H'),
                'title' => Setting::get('joki_header_title', 'Layanan Yang Diberikan Raycode!'),
                'title_en' => Setting::get('joki_header_title_en', 'Services by Raycode!'),
                'desc' => Setting::get('joki_header_desc', 'Kami menyediakan jasa pengerjaan tugas dan proyek coding untuk berbagai bahasa pemrograman dan framework. Dengan kualitas terbaik dan harga terjangkau, kami siap membantu tugas Anda selesai tepat waktu!'),
                'desc_en' => Setting::get('joki_header_desc_en', 'We provide coding assignment and project services for various languages and frameworks. With best quality and affordable price, we are ready to help!'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data = $this->autoFillEn($data);

        JokiService::create($data);

        return back()->with('success', 'Layanan berhasil ditambahkan. EN otomatis terisi.');
    }

    public function update(Request $request, JokiService $jokiService)
    {
        $data = $this->validated($request, $jokiService->id);
        // jika EN kosong, isi otomatis dari ID (hanya jika sebelumnya kosong atau user tidak isi)
        if (empty($data['title_en'])) {
            $data['title_en'] = $this->translateIdToEn($data['title']);
        }
        if (empty($data['desc_en'])) {
            $data['desc_en'] = $this->translateIdToEn($data['desc']);
        }
        if (empty($data['category_en'])) {
            $data['category_en'] = $this->translateIdToEn($data['category']);
        }

        $jokiService->update($data);

        return back()->with('success', 'Layanan diperbarui. EN otomatis jika kosong.');
    }

    public function destroy(JokiService $jokiService)
    {
        $jokiService->delete();

        return back()->with('success', 'Layanan dihapus.');
    }

    public function updateHeader(Request $request)
    {
        $validated = $request->validate([
            'badge' => ['required', 'string', 'max:120'],
            'badge_en' => ['nullable', 'string', 'max:120'],
            'title' => ['required', 'string', 'max:150'],
            'title_en' => ['nullable', 'string', 'max:150'],
            'desc' => ['required', 'string', 'max:500'],
            'desc_en' => ['nullable', 'string', 'max:500'],
        ]);

        Setting::set('joki_header_badge', $validated['badge']);
        Setting::set('joki_header_badge_en', $validated['badge_en'] ?: $this->translateIdToEn($validated['badge']));
        Setting::set('joki_header_title', $validated['title']);
        Setting::set('joki_header_title_en', $validated['title_en'] ?: $this->translateIdToEn($validated['title']));
        Setting::set('joki_header_desc', $validated['desc']);
        Setting::set('joki_header_desc_en', $validated['desc_en'] ?: $this->translateIdToEn($validated['desc']));

        return back()->with('success', 'Header Semua Layanan diperbarui. EN otomatis jika kosong.');
    }

    public function autoTranslateAll()
    {
        $services = JokiService::where(function ($q) {
            $q->whereNull('title_en')->orWhere('title_en', '')->orWhereNull('desc_en')->orWhere('desc_en', '');
        })->get();

        $count = 0;
        foreach ($services as $s) {
            $updates = [];
            if (empty($s->title_en)) $updates['title_en'] = $this->translateIdToEn($s->title);
            if (empty($s->desc_en)) $updates['desc_en'] = $this->translateIdToEn($s->desc);
            if (empty($s->category_en)) $updates['category_en'] = $this->translateIdToEn($s->category);
            if (! empty($updates)) {
                $s->update($updates);
                $count++;
            }
            // throttle to avoid rate limit
            usleep(200000); // 0.2s
        }

        // header
        if (! Setting::get('joki_header_badge_en') || Setting::get('joki_header_badge_en') === Setting::get('joki_header_badge')) {
            $badge = Setting::get('joki_header_badge');
            if ($badge) Setting::set('joki_header_badge_en', $this->translateIdToEn($badge));
        }

        return back()->with('success', "Auto-translate selesai: {$count} layanan diperbarui.");
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:joki_services,id'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $query = JokiService::whereIn('id', $validated['ids']);
        $updates = [];
        if (array_key_exists('category', $validated) && $validated['category'] !== null) {
            $updates['category'] = $validated['category'];
        }
        if (array_key_exists('is_active', $validated) && $validated['is_active'] !== null) {
            $updates['is_active'] = $validated['is_active'];
        }
        if (! empty($updates)) {
            $query->update($updates);
        }

        return back()->with('success', 'Bulk update berhasil.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'title_en' => ['nullable', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:150'],
            'desc' => ['required', 'string', 'max:500'],
            'desc_en' => ['nullable', 'string', 'max:500'],
            'category' => ['required', 'string', 'max:100'],
            'category_en' => ['nullable', 'string', 'max:100'],
            'icon' => ['required', 'string', 'max:50'],
            'logo' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['boolean'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $original = $validated['slug'];
        $counter = 1;
        while (JokiService::where('slug', $validated['slug'])->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $validated['slug'] = $original . '-' . $counter++;
        }

        if (! isset($validated['sort_order']) || $validated['sort_order'] === null) {
            $validated['sort_order'] = (JokiService::max('sort_order') ?? 0) + 1;
        }

        // Normalize empty logo to null
        if (empty($validated['logo'])) {
            $validated['logo'] = null;
        }

        return $validated;
    }

    private function autoFillEn(array $data): array
    {
        if (empty($data['title_en'])) {
            $data['title_en'] = $this->translateIdToEn($data['title']);
        }
        if (empty($data['desc_en'])) {
            $data['desc_en'] = $this->translateIdToEn($data['desc']);
        }
        if (empty($data['category_en'])) {
            $data['category_en'] = $this->translateIdToEn($data['category']);
        }
        return $data;
    }

    private function translateIdToEn(string $text): string
    {
        if (trim($text) === '') return $text;
        // jangan translate kategori yang sudah English atau kode
        $lower = mb_strtolower(trim($text));
        $skip = ['mobile development', 'web development', 'database & backend', 'devops & deployment', 'ai & machine learning', 'data science', 'game & multimedia', 'iot & hardware', 'networking', 'cybersecurity'];
        if (in_array($lower, $skip, true)) {
            return $text;
        }
        try {
            $res = Http::timeout(4)->get('https://api.mymemory.translated.net/get', [
                'q' => $text,
                'langpair' => 'id|en',
            ]);
            if ($res->successful()) {
                $translated = $res->json('responseData.translatedText');
                if ($translated && is_string($translated) && trim($translated) !== '' && strtolower(trim($translated)) !== strtolower(trim($text))) {
                    // MyMemory kadang balikin dengan placeholder, bersihkan
                    return html_entity_decode($translated, ENT_QUOTES | ENT_HTML5);
                }
            }
        } catch (\Throwable $e) {
            // fallback
        }
        return $text;
    }
}
