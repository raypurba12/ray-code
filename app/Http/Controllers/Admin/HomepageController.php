<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomepageController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Homepage', [
            'homepage' => $this->getHomepageSettings(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            // Hero
            'hero_badge_available' => ['nullable', 'string', 'max:120'],
            'hero_badge_role' => ['nullable', 'string', 'max:120'],
            'hero_socials' => ['nullable', 'array', 'max:6'],
            'hero_socials.*.label' => ['required_with:hero_socials', 'string', 'max:100'],
            'hero_socials.*.href' => ['required_with:hero_socials', 'string', 'max:300'],
            'hero_socials.*.platform' => ['nullable', 'string', 'max:30'],
            'hero_perks' => ['nullable', 'array', 'max:6'],
            'hero_perks.*.title' => ['required_with:hero_perks', 'string', 'max:100'],
            'hero_perks.*.desc' => ['required_with:hero_perks', 'string', 'max:200'],
            'hero_perks.*.icon' => ['nullable', 'string', 'max:50'],
            'hero_eyebrow' => ['nullable', 'string', 'max:200'],
            'hero_heading_prefix' => ['nullable', 'string', 'max:200'],
            'hero_heading_highlight' => ['nullable', 'string', 'max:50'],
            'hero_heading_suffix' => ['nullable', 'string', 'max:100'],
            'hero_description' => ['nullable', 'string', 'max:1000'],
            'hero_primary_cta_label' => ['nullable', 'string', 'max:100'],
            'hero_primary_cta_href' => ['nullable', 'string', 'max:300'],
            'hero_secondary_cta_label' => ['nullable', 'string', 'max:100'],
            'hero_secondary_cta_href' => ['nullable', 'string', 'max:300'],
            'hero_stats' => ['nullable', 'array', 'max:6'],
            'hero_stats.*.value' => ['required_with:hero_stats', 'integer', 'min:0', 'max:100000'],
            'hero_stats.*.suffix' => ['nullable', 'string', 'max:10'],
            'hero_stats.*.label' => ['required_with:hero_stats', 'string', 'max:100'],
            'hero_stats.*.icon' => ['nullable', 'string', 'max:50'],
            'hero_image_src' => ['nullable', 'string', 'max:500'],
            'hero_image_alt' => ['nullable', 'string', 'max:255'],
            'hero_code_lines' => ['nullable', 'array', 'max:20'],
            'hero_code_lines.*' => ['string', 'max:200'],
            'hero_terminal_badge_top' => ['nullable', 'string', 'max:120'],
            'hero_terminal_badge_bottom' => ['nullable', 'string', 'max:120'],
            'hero_terminal_title' => ['nullable', 'string', 'max:100'],
            'hero_terminal_env' => ['nullable', 'string', 'max:30'],
            'hero_terminal_footer' => ['nullable', 'string', 'max:200'],

            // Marquee
            'marquee_stack' => ['nullable', 'array', 'max:30'],
            'marquee_stack.*' => ['string', 'max:100'],

            // Services section
            'services_eyebrow' => ['nullable', 'string', 'max:120'],
            'services_heading' => ['nullable', 'string', 'max:300'],
            'services_cta_label' => ['nullable', 'string', 'max:100'],

            // Process
            'process_eyebrow' => ['nullable', 'string', 'max:120'],
            'process_heading' => ['nullable', 'string', 'max:300'],
            'process_steps' => ['nullable', 'array', 'max:8'],
            'process_steps.*.n' => ['required_with:process_steps', 'string', 'max:10'],
            'process_steps.*.title' => ['required_with:process_steps', 'string', 'max:100'],
            'process_steps.*.desc' => ['required_with:process_steps', 'string', 'max:500'],

            // Work
            'work_eyebrow' => ['nullable', 'string', 'max:120'],
            'work_heading' => ['nullable', 'string', 'max:300'],
            'work_cta_label' => ['nullable', 'string', 'max:100'],

            // Why
            'why_eyebrow' => ['nullable', 'string', 'max:120'],
            'why_heading' => ['nullable', 'string', 'max:500'],
            'why_points' => ['nullable', 'array', 'max:8'],
            'why_points.*.title' => ['required_with:why_points', 'string', 'max:150'],
            'why_points.*.desc' => ['required_with:why_points', 'string', 'max:500'],
            'why_code_title' => ['nullable', 'string', 'max:150'],
            'why_code_content' => ['nullable', 'string', 'max:2000'],
            'why_code_footer' => ['nullable', 'string', 'max:200'],

            // Testimonials
            'testimonials_eyebrow' => ['nullable', 'string', 'max:120'],
            'testimonials_heading' => ['nullable', 'string', 'max:300'],

            // Pricing
            'pricing_eyebrow' => ['nullable', 'string', 'max:120'],
            'pricing_heading' => ['nullable', 'string', 'max:300'],

            // FAQ
            'faq_eyebrow' => ['nullable', 'string', 'max:120'],
            'faq_heading' => ['nullable', 'string', 'max:300'],
            'faq_footer_text' => ['nullable', 'string', 'max:500'],

            // CTA
            'cta_eyebrow' => ['nullable', 'string', 'max:120'],
            'cta_heading' => ['nullable', 'string', 'max:300'],
            'cta_description' => ['nullable', 'string', 'max:500'],
            'cta_primary_label' => ['nullable', 'string', 'max:100'],
            'cta_primary_href' => ['nullable', 'string', 'max:300'],
            'cta_secondary_label' => ['nullable', 'string', 'max:100'],
            'cta_secondary_href' => ['nullable', 'string', 'max:300'],

            // Global - Announcement & Footer
            'announcement_text' => ['nullable', 'string', 'max:200'],
            'announcement_text_mobile' => ['nullable', 'string', 'max:200'],
            'announcement_cta_label' => ['nullable', 'string', 'max:80'],
            'announcement_cta_href' => ['nullable', 'string', 'max:300'],
            'footer_description' => ['nullable', 'string', 'max:500'],
            'footer_tech_label' => ['nullable', 'string', 'max:200'],
        ]);

        // Handle JSON fields - encode arrays as JSON strings
        $jsonFields = [
            'hero_socials', 'hero_perks', 'hero_stats', 'hero_code_lines',
            'marquee_stack', 'process_steps', 'why_points',
        ];

        foreach ($validated as $key => $value) {
            if (in_array($key, $jsonFields)) {
                Setting::set($key, json_encode($value, JSON_UNESCAPED_UNICODE));
            } else {
                Setting::set($key, (string) $value);
            }
        }

        return back()->with('success', 'Homepage settings saved.');
    }

    public static function defaults(): array
    {
        return [
            'hero_badge_available' => 'Tersedia untuk proyek baru · Q3 2026',
            'hero_badge_role' => 'Pengembang Web Full Stack',
            'hero_socials' => [
                ['label' => '@raycode', 'href' => 'https://wa.me/6281234567890', 'platform' => 'whatsapp'],
                ['label' => 'raycode', 'href' => 'https://www.linkedin.com/company/raycode', 'platform' => 'linkedin'],
                ['label' => 'raycode', 'href' => 'https://github.com/raycode', 'platform' => 'github'],
                ['label' => 'hello@raycode.dev', 'href' => 'mailto:hello@raycode.dev', 'platform' => 'email'],
            ],
            'hero_perks' => [
                ['icon' => 'monitor-smartphone', 'title' => 'Modern & Responsif', 'desc' => 'UI yang clean dan optimal di semua perangkat'],
                ['icon' => 'braces', 'title' => 'Rapi & Terawat', 'desc' => 'Kode yang rapi, terstruktur, dan mudah dikembangkan'],
                ['icon' => 'zap', 'title' => 'Cepat & Andal', 'desc' => 'Performa cepat, stabil, dan dapat diandalkan'],
            ],
            'hero_eyebrow' => 'Pengembangan Web • Rekayasa Perangkat Lunak',
            'hero_heading_prefix' => 'Raycode — Membangun Pengalaman',
            'hero_heading_highlight' => 'Digital',
            'hero_heading_suffix' => 'Modern.',
            'hero_description' => 'Saya membangun website, web aplikasi, dan solusi digital menggunakan teknologi modern seperti Laravel, Vue.js, JavaScript, PHP, dan MySQL — dengan arsitektur yang clean dan fokus pada performa tinggi.',
            'hero_primary_cta_label' => 'KONSULTASI GRATIS',
            'hero_primary_cta_href' => '/contact',
            'hero_secondary_cta_label' => 'Lihat Karya Saya',
            'hero_secondary_cta_href' => '/portfolio',
            'hero_stats' => [
                ['icon' => 'rocket', 'value' => 10, 'suffix' => '+', 'label' => 'Proyek Selesai'],
                ['icon' => 'braces', 'value' => 5, 'suffix' => '+', 'label' => 'Teknologi'],
                ['icon' => 'shield-check', 'value' => 100, 'suffix' => '%', 'label' => 'Responsif'],
            ],
            'hero_image_src' => '/images/pp-800.webp',
            'hero_image_alt' => 'Developer Raycode sedang coding di laptop',
            'hero_code_lines' => [
                '$ raycode new project --client=you',
                '✓ Jadwal diskusi terjadwal',
                '✓ Arsitektur dirancang',
                '✓ Test ditulis dulu (TDD)',
                '→ Deploy ke produksi...',
                '● LIVE — Skor Lighthouse 99',
            ],
            'hero_terminal_badge_top' => 'Rata-rata respons < 24 jam',
            'hero_terminal_badge_bottom' => 'Performa Lighthouse 99',
            'hero_terminal_title' => 'raycode — zsh',
            'hero_terminal_env' => 'produksi',
            'hero_terminal_footer' => '$ uptime: 99,98% · latensi p95: 84ms · nol insiden kuartal ini',

            'marquee_stack' => ['Laravel 12', 'React 19', 'TypeScript', 'Inertia.js', 'Tailwind CSS', 'MySQL 8', 'Redis', 'Docker', 'Vite', 'GitHub Actions'],

            'services_eyebrow' => '// Apa yang kami lakukan',
            'services_heading' => 'Rekayasa menyeluruh, tanpa kerumitan agensi.',
            'services_cta_label' => 'Semua layanan',

            'process_eyebrow' => '// Cara kerjanya',
            'process_heading' => 'Proses yang disempurnakan dari 120+ peluncuran.',
            'process_steps' => [
                ['n' => '01', 'title' => 'Eksplorasi', 'desc' => 'Diskusi terfokus untuk memetakan tujuan, pengguna & batasan. Anda dapat penawaran tetap dalam 24 jam.'],
                ['n' => '02', 'title' => 'Desain', 'desc' => 'Wireframe → UI high-fidelity dalam sistem brand Anda. Iterasi hingga terasa sempurna.'],
                ['n' => '03', 'title' => 'Pengembangan', 'desc' => 'Demo mingguan dari software yang berjalan. Kode terstruktur, jalur teruji, commit rapi yang bisa Anda audit.'],
                ['n' => '04', 'title' => 'Peluncuran & Pengembangan', 'desc' => 'Deploy tanpa downtime, monitoring terpasang, dan masa garansi untuk ketenangan Anda.'],
            ],

            'work_eyebrow' => '// Karya pilihan',
            'work_heading' => 'Bukti, bukan janji.',
            'work_cta_label' => 'Jelajahi portofolio',

            'why_eyebrow' => '// Mengapa tim memilih kami',
            'why_heading' => 'Partner engineering yang kami harapkan ada saat kami menjadi klien.',
            'why_points' => [
                ['title' => 'Hanya engineer senior', 'desc' => 'Tidak ada junior yang belajar dengan anggaran Anda. Setiap baris ditulis oleh engineer yang sudah terbiasa scale besar.'],
                ['title' => 'Harga tetap, tanpa kejutan', 'desc' => 'Ruang lingkup disepakati di awal, harga terkunci. Permintaan perubahan? Diestimasi dan disetujui sebelum kami menyentuh kode.'],
                ['title' => 'Anda memiliki semuanya', 'desc' => 'Kode, infrastruktur, dokumentasi — semua diserahkan kepada Anda. Tanpa vendor lock-in, selamanya.'],
                ['title' => 'Performa sebagai fitur', 'desc' => 'Core Web Vitals hijau di setiap pengiriman. Kecepatan diukur, bukan dijanjikan.'],
            ],
            'why_code_title' => 'audit_report.ts — findings summary',
            'why_code_content' => "const audit = {\n  security: '0 critical, 2 patched',\n  performance: '+64% faster TTFB',\n  architecture:\n    before: 'monolith-of-doom',\n    after: 'modular, documented',\n  maintainability: 'grade A-',\n};",
            'why_code_footer' => 'Dikirim di setiap audit — diprioritaskan dan dijelaskan.',

            'testimonials_eyebrow' => '// Kata klien',
            'testimonials_heading' => 'Jangan hanya percaya kata kami.',

            'pricing_eyebrow' => '// Harga transparan',
            'pricing_heading' => 'Ketahui angkanya sebelum menghubungi kami.',

            'faq_eyebrow' => '// FAQ',
            'faq_heading' => 'Pertanyaan, terjawab.',
            'faq_footer_text' => 'Ada pertanyaan lain? Baca FAQ lengkap atau hubungi kami langsung.',

            'cta_eyebrow' => '// Siap saat Anda siap',
            'cta_heading' => 'Punya ide yang mengganjal di catatan Anda?',
            'cta_description' => 'Ceritakan pada kami. Kami membalas dalam satu hari kerja dengan masukan jujur dan langkah yang jelas.',
            'cta_primary_label' => 'Dapatkan penawaran gratis',
            'cta_primary_href' => '/contact',
            'cta_secondary_label' => 'Coba estimator',
            'cta_secondary_href' => '/estimator',

            'announcement_text' => 'Siap membangun sesuatu yang hebat?',
            'announcement_text_mobile' => 'Siap membangun?',
            'announcement_cta_label' => 'Konsultasi Gratis',
            'announcement_cta_href' => '/contact',
            'footer_description' => 'Studio pengembangan web premium. Kami merancang, membangun, dan merawat produk digital yang cepat rilis dan mudah diskalakan.',
            'footer_tech_label' => 'Laravel · React · TypeScript · MySQL',
        ];
    }

    public static function getHomepageSettings(): array
    {
        $defaults = static::defaults();
        // satu query untuk semua key — tanpa ubah desain/animasi, potong 30 query → 1
        try {
            $all = Setting::whereIn('key', array_keys($defaults))->pluck('value', 'key');
        } catch (\Throwable $e) {
            $all = collect();
        }
        $result = [];
        foreach ($defaults as $key => $default) {
            $raw = $all->get($key);
            if ($raw === null) {
                $result[$key] = $default;

                continue;
            }
            if (is_array($default)) {
                $decoded = json_decode($raw, true);
                $result[$key] = is_array($decoded) ? $decoded : $default;
            } else {
                $result[$key] = $raw;
            }
        }

        return $result;
    }
}
