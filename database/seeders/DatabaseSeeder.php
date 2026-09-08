<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\Invoice;
use App\Models\Message;
use App\Models\PricingPlan;
use App\Models\Portfolio;
use App\Models\Project;
use App\Models\ProjectUpdate;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ──────────────────────────────────────────────
        $admin = User::create([
            'name' => 'Rayhan Pratama',
            'email' => 'admin@raycode.dev',
            'password' => 'password',
            'role' => 'admin',
            'company' => 'Raycode Studio',
        ]);

        $client = User::create([
            'name' => 'Sinta Maharani',
            'email' => 'client@raycode.dev',
            'password' => 'password',
            'role' => 'client',
            'phone' => '+62 812 9876 5432',
            'company' => 'Kopi Kenangan Senja',
        ]);

        User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@startup.io',
            'password' => 'password',
            'role' => 'client',
            'company' => 'Startup.io',
        ]);

        // ── Services ───────────────────────────────────────────
        $services = [
            [
                'slug' => 'website-development',
                'title' => 'Pengembangan Website',
                'icon' => 'globe',
                'short_desc' => 'Profil perusahaan, landing page, dan website bisnis yang cepat dan mampu mengonversi pengunjung.',
                'description' => "Kami merancang dan membangun website production-grade yang disesuaikan dengan brand Anda. Setiap build dilengkapi layout responsif, markup siap SEO, target load di bawah satu detik, dan CMS agar tim Anda bisa publish tanpa menyentuh kode.\n\nDari profil perusahaan 5 halaman hingga situs marketing dengan blog, kami menangani arsitektur informasi, desain UI, pengembangan, deployment, hingga monitoring pasca-launch.",
                'features' => ['Desain responsif kustom', 'Optimasi SEO & performa', 'CMS untuk edit konten mudah', 'Integrasi analitik', 'Garansi bug gratis 30 hari', 'Setup deployment & domain'],
                'starting_price' => 3500000,
                'delivery_days' => 14,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'web-app-development',
                'title' => 'Pengembangan Web App',
                'icon' => 'layers',
                'short_desc' => 'Dashboard, produk SaaS, sistem booking, dan tools internal berbasis Laravel + React.',
                'description' => "Produk yang kompleks butuh arsitektur yang solid. Kami membangun aplikasi web yang skalabel dengan Laravel 12, Inertia.js, React, dan TypeScript — stack yang sama yang menjalankan situs ini.\n\nAutentikasi, akses berbasis peran, alur pembayaran, pelaporan, integrasi pihak ketiga: kami tentukan ruang lingkupnya, kirim secara iteratif, dan dokumentasikan semuanya agar tim Anda bisa mengelolanya dengan percaya diri.",
                'features' => ['Stack Laravel + React + TypeScript', 'REST API & integrasi pihak ketiga', 'Autentikasi & izin berbasis peran', 'Sudah termasuk automated testing', 'Setup pipeline CI/CD', 'Dokumentasi teknis'],
                'starting_price' => 15000000,
                'delivery_days' => 45,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'debugging-fixing',
                'title' => 'Debugging & Perbaikan Bug',
                'icon' => 'bug',
                'short_desc' => 'Bug misterius, build rusak, error produksi — kami menemukan akar masalah, bukan gejalanya.',
                'description' => "Ada yang rusak dan tidak ada yang tahu penyebabnya? Kami menyelam ke codebase Anda, mereproduksi masalah, mengidentifikasi akar penyebabnya, dan memperbaikinya dengan regression test.\n\nKami bekerja lintas stack: PHP/Laravel, JavaScript/TypeScript, masalah query MySQL, konfigurasi deployment, dan lainnya. Anda akan mendapat penjelasan tertulis tentang apa yang salah dan cara mencegahnya.",
                'features' => ['Laporan analisis akar masalah', 'Regression test untuk setiap perbaikan', 'Diagnosis bottleneck performa', 'Setup pelacakan error (opsional)', 'Pengerjaan minggu yang sama', 'Harga tetap per insiden'],
                'starting_price' => 500000,
                'delivery_days' => 3,
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'slug' => 'code-review',
                'title' => 'Code Review & Audit',
                'icon' => 'search-code',
                'short_desc' => 'Audit codebase oleh engineer senior: celah keamanan, code smell, dan risiko arsitektur.',
                'description' => "Dapatkan review independen level senior untuk codebase Anda. Kami menganalisis kerentanan keamanan, utang arsitektur, risiko performa, dan masalah maintainability — lalu memprioritaskannya menjadi roadmap yang bisa dieksekusi.\n\nHasilnya meliputi laporan audit tertulis, temuan kode dengan anotasi, dan sesi panggilan lanjutan untuk membahas prioritas bersama tim Anda.",
                'features' => ['Pemindaian kerentanan keamanan', 'Penilaian arsitektur', 'Roadmap temuan terprioritas', 'Komentar inline dengan anotasi', 'Sesi walkthrough 60 menit', 'Review ulang setelah perbaikan'],
                'starting_price' => 2000000,
                'delivery_days' => 7,
                'is_featured' => false,
                'sort_order' => 4,
            ],
            [
                'slug' => 'programming-consultation',
                'title' => 'Konsultasi Pemrograman',
                'icon' => 'message-square-code',
                'short_desc' => 'Keputusan tech stack, desain sistem, saran rekrutmen — diskusi langsung dengan engineer senior.',
                'description' => "Bingung apakah harus rebuild atau refactor? Database mana yang cocok untuk skala Anda? Bagaimana menyusun tim engineering? Pesan sesi fokus bersama engineer senior yang telah bertahun-tahun merilis sistem produksi.\n\nSesi direkam, dirangkum menjadi dokumen keputusan, dan disertai langkah konkret selanjutnya — bukan saran yang samar.",
                'features' => ['Sesi deep-dive 90 menit', 'Ringkasan keputusan tertulis', 'Diagram arsitektur jika diperlukan', 'Matriks rekomendasi stack', 'Rekaman tersedia', 'Tanya jawab async lanjutan (7 hari)'],
                'starting_price' => 750000,
                'delivery_days' => 2,
                'is_featured' => false,
                'sort_order' => 5,
            ],
            [
                'slug' => 'technical-support',
                'title' => 'Dukungan Teknis Berkelanjutan',
                'icon' => 'life-buoy',
                'short_desc' => 'Retainer bulanan untuk pemeliharaan, monitoring, fitur kecil, dan respons prioritas.',
                'description' => "Produk Anda sudah live — sekarang jaga agar tetap sehat. Retainer dukungan kami mencakup update dependensi, patch keamanan, monitoring uptime, permintaan fitur kecil, dan respons bug prioritas.\n\nAnggap kami sebagai tim engineering on-call Anda, dengan biaya jauh lebih kecil dari merekrut full-time.",
                'features' => ['SLA respons prioritas < 4 jam', 'Update dependensi bulanan', 'Monitoring uptime & error', 'Hingga 20 jam-dev/bulan', 'Laporan kesehatan triwulanan', 'Berhenti kapan saja'],
                'starting_price' => 4500000,
                'delivery_days' => 30,
                'is_featured' => false,
                'sort_order' => 6,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }

        // ── Portfolio ──────────────────────────────────────────
        $portfolios = [
            [
                'slug' => 'waroeng-kita-pos-system',
                'title' => 'Waroeng Kita POS System',
                'category' => 'Aplikasi Web',
                'client_name' => 'Waroeng Kita Group',
                'year' => 2025,
                'description' => "Aplikasi web point-of-sale multi-outlet yang menangani 12.000+ transaksi harian di 8 cabang. Dibangun dengan Laravel queues untuk sinkronisasi cetak struk, dashboard penjualan real-time, dan mode PWA offline-first untuk koneksi yang tidak stabil.",
                'tech_stack' => ['Laravel', 'React', 'MySQL', 'Redis', 'PWA'],
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'sehatin-telemedicine-platform',
                'title' => 'Sehatin Telemedicine Platform',
                'category' => 'Aplikasi Web',
                'client_name' => 'Sehatin Health Tech',
                'year' => 2025,
                'description' => "Platform telemedis yang menghubungkan 200+ dokter dengan pasien melalui konsultasi video, resep elektronik, dan pengiriman farmasi terintegrasi. Arsitektur yang memperhatikan privasi dengan penyimpanan chat terenkripsi dan audit trail.",
                'tech_stack' => ['Laravel', 'Inertia', 'React', 'WebRTC', 'MySQL'],
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'arunika-coffee-company-profile',
                'title' => 'Arunika Coffee — Brand Website',
                'category' => 'Website',
                'client_name' => 'Arunika Coffee Roasters',
                'year' => 2024,
                'description' => "Website brand yang layak penghargaan untuk roaster kopi spesialti. Storytelling berbasis scroll, panduan seduh interaktif, dan pencari lokasi toko. Mencapai performa Lighthouse 99 meski dengan art direction yang berat.",
                'tech_stack' => ['Laravel', 'Tailwind CSS', 'GSAP', 'Vite'],
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'slug' => 'fintava-finance-dashboard',
                'title' => 'Fintava Analytics Dashboard',
                'category' => 'Dasbor',
                'client_name' => 'Fintava Financial',
                'year' => 2024,
                'description' => "Dashboard analitik keuangan real-time yang menampilkan 50rb+ titik data dengan tabel tervirtualisasi dan streaming grafik melalui WebSocket. Tampilan berbasis peran untuk analis, manajer, dan petugas kepatuhan.",
                'tech_stack' => ['Laravel', 'React', 'TypeScript', 'WebSocket', 'Docker'],
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'slug' => 'kelasdev-e-learning',
                'title' => 'KelasDev E-Learning Platform',
                'category' => 'Aplikasi Web',
                'client_name' => 'KelasDev Academy',
                'year' => 2024,
                'description' => "Platform kursus dengan streaming video, engine kuis, pembuatan sertifikat, dan manajemen kohort. Melayani 15.000+ siswa dengan dukungan Stripe & payment gateway lokal.",
                'tech_stack' => ['Laravel', 'Inertia', 'React', 'MySQL', 'FFmpeg'],
                'is_featured' => false,
                'sort_order' => 5,
            ],
            [
                'slug' => 'tokobiru-migration-rescue',
                'title' => 'TokoBiru Legacy Rescue',
                'category' => 'Perbaikan & Audit',
                'client_name' => 'TokoBiru Marketplace',
                'year' => 2025,
                'description' => "Penyelamatan darurat situs e-commerce Laravel 5 yang bermasalah: menelusuri kegagalan checkout hingga ke race condition, migrasi ke Laravel 11 tanpa downtime, memangkas waktu muat halaman dari 8 detik menjadi 1,2 detik, dan mendokumentasikan seluruh prosesnya.",
                'tech_stack' => ['Laravel', 'MySQL', 'Redis', 'New Relic'],
                'is_featured' => false,
                'sort_order' => 6,
            ],
        ];

        foreach ($portfolios as $portfolio) {
            Portfolio::create($portfolio);
        }

        // ── Pricing Plans ──────────────────────────────────────
        $plans = [
            [
                'slug' => 'starter',
                'name' => 'Starter',
                'tagline' => 'Untuk personal brand & bisnis kecil yang butuh tampil cepat.',
                'price' => 3500000,
                'unit' => '/proyek',
                'features' => ['Hingga 5 halaman', 'Desain kustom responsif', 'Setup SEO dasar', 'Form kontak + tombol WhatsApp', 'Google Analytics', 'Pengerjaan 14 hari', 'Garansi bug 30 hari'],
                'cta_text' => 'Mulai Proyek',
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'slug' => 'business',
                'name' => 'Business',
                'tagline' => 'Untuk perusahaan yang butuh kredibilitas dan konversi.',
                'price' => 9500000,
                'unit' => '/proyek',
                'features' => ['Hingga 12 halaman', 'Desain premium kustom', 'CMS untuk edit mandiri', 'SEO lanjutan + schema markup', 'Modul blog & berita', 'Siap multibahasa', 'Optimasi kecepatan (< 1 detik)', 'Pengerjaan 21 hari', 'Garansi bug 90 hari'],
                'cta_text' => 'Mulai Proyek',
                'is_popular' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'webapp',
                'name' => 'Aplikasi Web',
                'tagline' => 'Aplikasi kustom yang dirancang untuk skala besar.',
                'price' => 25000000,
                'unit' => '/milestone',
                'features' => ['Workshop discovery & arsitektur', 'Laravel + React + TypeScript', 'Autentikasi, peran & izin', 'Integrasi payment gateway', 'Dashboard admin', 'Dokumentasi API', 'Automated test suite', 'Deployment CI/CD', 'Rilis iteratif mingguan'],
                'cta_text' => 'Jadwalkan Konsultasi',
                'is_popular' => false,
                'sort_order' => 3,
            ],
            [
                'slug' => 'support-retainer',
                'name' => 'Retainer Dukungan',
                'tagline' => 'Tim engineering on-call Anda.',
                'price' => 4500000,
                'unit' => '/bulan',
                'features' => ['SLA respons prioritas < 4 jam', 'Hingga 20 jam-dev/bulan', 'Patch & update keamanan', 'Monitoring uptime', 'Permintaan fitur kecil', 'Laporan kesehatan bulanan', 'Berhenti kapan saja'],
                'cta_text' => 'Langganan Sekarang',
                'is_popular' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            PricingPlan::create($plan);
        }

        // ── Testimonials ───────────────────────────────────────
        $testimonials = [
            [
                'name' => 'Andi Wijaya',
                'role' => 'CEO',
                'company' => 'Waroeng Kita Group',
                'content' => 'Raycode membangun ulang POS kami dari nol sementara outlet tetap beroperasi. Migrasi tanpa downtime, dan sistem baru menangani 3x volume lama kami. Dokumentasinya saja sudah sepadan dengan harganya.',
                'rating' => 5,
                'is_approved' => true,
            ],
            [
                'name' => 'Maya Kusuma',
                'role' => 'Lead Produk',
                'company' => 'Sehatin Health Tech',
                'content' => 'Mereka menemukan masalah keamanan yang sepenuhnya terlewat oleh vendor kami sebelumnya. Laporan auditnya sangat jujur dan perbaikannya sangat presisi. Persis seperti yang Anda harapkan dari partner teknis.',
                'rating' => 5,
                'is_approved' => true,
            ],
            [
                'name' => 'Dimas Prasetyo',
                'role' => 'Pendiri',
                'company' => 'Fintava Financial',
                'content' => 'Dashboard kami berubah dari tidak bisa dipakai menjadi nilai jual terbaik. Investor secara spesifik menyebut kualitas produk selama due diligence. Uang terbaik yang pernah kami belanjakan untuk engineering.',
                'rating' => 5,
                'is_approved' => true,
            ],
            [
                'name' => 'Rina Halim',
                'role' => 'Direktur Pemasaran',
                'company' => 'Arunika Coffee',
                'content' => 'Situsnya cantik DAN cepat — skor Lighthouse 99 dengan semua animasi itu. Pelanggan benar-benar memuji websitenya. Tingkat konversi naik dua kali lipat dalam dua bulan.',
                'rating' => 5,
                'is_approved' => true,
            ],
            [
                'name' => 'Bagus Nugroho',
                'role' => 'CTO',
                'company' => 'TokoBiru Marketplace',
                'content' => 'Mereka menyelamatkan platform kami yang sekarat saat dua agensi sudah menyerah. Analisis akar masalah, perbaikan rapi, tanpa downtime. Seandainya kami menghubungi mereka sejak awal.',
                'rating' => 5,
                'is_approved' => true,
            ],
            [
                'name' => 'Sari Dewi',
                'role' => 'Pemilik',
                'company' => 'Bloom Florist',
                'content' => 'Cepat, komunikatif, dan sabar menghadapi revisi saya yang tak ada habisnya. Website akhirnya terlihat jauh lebih mahal dari yang saya bayar. Sudah saya rekomendasikan ke tiga teman.',
                'rating' => 4,
                'is_approved' => true,
            ],
            [
                'name' => 'Hendra Gunawan',
                'role' => 'Manajer Operasional',
                'company' => 'LogistiX Indonesia',
                'content' => 'Menunggu review — sesi workshop awal sangat bagus, menunggu proposal lengkap sebelum memberi nilai akhir.',
                'rating' => 3,
                'is_approved' => false,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::create($testimonial);
        }

        // ── FAQs ───────────────────────────────────────────────
        $faqs = [
            ['question' => 'Bagaimana proses pengerjaan proyek?', 'answer' => 'Setelah Anda melakukan pemesanan atau menghubungi kami, kami menjadwalkan panggilan discovery untuk memahami kebutuhan. Dalam 24 jam Anda akan menerima penawaran harga tetap dan timeline. Setelah disetujui, kami bekerja secara iteratif dengan demo mingguan hingga peluncuran.', 'category' => 'Umum', 'sort_order' => 1],
            ['question' => 'Teknologi apa yang Anda gunakan?', 'answer' => 'Stack utama kami adalah Laravel 12, Inertia.js, React 19, TypeScript, Tailwind CSS, dan MySQL. Untuk kebutuhan khusus kami juga menggunakan Redis, Docker, WebSocket, dan tooling modern seperti Vite dan GSAP untuk animasi.', 'category' => 'Umum', 'sort_order' => 2],
            ['question' => 'Berapa biaya pembuatan website?', 'answer' => 'Website Starter mulai dari Rp 3,5 jt. Aplikasi web yang kompleks biasanya mulai dari Rp 25 jt ke atas tergantung ruang lingkup. Gunakan estimator interaktif di situs ini untuk mendapatkan perkiraan instan, lalu kami sempurnakan setelah sesi discovery.', 'category' => 'Harga', 'sort_order' => 3],
            ['question' => 'Metode pembayaran apa yang diterima?', 'answer' => 'Transfer bank (BCA, Mandiri), virtual account, QRIS, dan kartu internasional via Stripe. Ketentuan standar adalah 50% di awal, 50% saat selesai. Proyek yang lebih besar bisa dibagi per milestone.', 'category' => 'Harga', 'sort_order' => 4],
            ['question' => 'Apakah ada revisi?', 'answer' => 'Ya. Setiap paket sudah termasuk putaran revisi selama fase desain dan garansi perbaikan bug setelah peluncuran (30–90 hari tergantung paket). Kami terus iterasi hingga hasilnya tepat.', 'category' => 'Umum', 'sort_order' => 5],
            ['question' => 'Apakah bisa melanjutkan codebase yang sudah ada?', 'answer' => 'Tentu — proyek penyelamatan adalah salah satu spesialisasi kami. Kami memulai dengan code review untuk memetakan risiko, lalu mengusulkan refactoring bertahap atau penulisan ulang berfase, dengan tetap menjaga produksi Anda tetap stabil.', 'category' => 'Teknis', 'sort_order' => 6],
            ['question' => 'Apakah Anda menandatangani NDA?', 'answer' => 'Ya, kami rutin bekerja di bawah NDA untuk proyek klien. Codebase, logika bisnis, dan data Anda akan tetap dijaga kerahasiaannya.', 'category' => 'Umum', 'sort_order' => 7],
            ['question' => 'Bagaimana dengan hosting dan domain?', 'answer' => 'Kami menangani setup deployment lengkap termasuk konfigurasi hosting, SSL, DNS domain, dan pipeline CI/CD. Biaya hosting dibayar langsung oleh Anda ke penyedia sehingga Anda sepenuhnya memiliki infrastrukturnya.', 'category' => 'Teknis', 'sort_order' => 8],
            ['question' => 'Apakah ada dukungan setelah peluncuran?', 'answer' => 'Setiap proyek sudah termasuk masa garansi perbaikan bug gratis. Setelah itu, sebagian besar klien melanjutkan dengan Retainer Dukungan yang mencakup pemeliharaan, update, monitoring, dan permintaan fitur kecil dengan SLA respons prioritas.', 'category' => 'Dukungan', 'sort_order' => 9],
            ['question' => 'Mengapa tagihan saya dikenakan pajak?', 'answer' => 'Tagihan sudah termasuk PPN 11% sesuai ketentuan untuk bisnis di Indonesia. Jika perusahaan Anda bebas PPN atau butuh pengaturan pajak kustom, hubungi kami dan kami akan menyesuaikan profil penagihan Anda.', 'category' => 'Tagihan', 'sort_order' => 10],
        ];

        Faq::insert(array_map(fn ($f) => [...$f, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()], $faqs));

        // ── Blog posts ─────────────────────────────────────────
        BlogPost::create([
            'slug' => 'laravel-inertia-react-stack-2026',
            'title' => 'Mengapa Kami Masih Memilih Laravel + Inertia + React di 2026',
            'excerpt' => 'SPA, framework SSR, micro-frontend... terkadang pilihan yang membosankan justru yang paling tepat. Inilah mengapa stack andalan kami tetap lebih cepat merilis dibanding alternatif yang sedang tren.',
            'content' => "Setiap tahun framework JavaScript baru menjanjikan akan mengubah segalanya. Sementara itu, klien kami terus meminta hal yang sama: pengiriman cepat, kode yang mudah dirawat, rekrutmen yang mudah, biaya hosting rendah.\n\nKombinasi Laravel + Inertia + React berada di titik manis itu. Anda mendapatkan interaktivitas ala SPA tanpa harus membangun lapisan API terpisah, routing sisi server yang skalabel bersama tim Anda, dan type safety end-to-end dengan TypeScript.\n\nDi artikel ini kami membedah metrik proyek nyata dari 10 build terakhir kami: waktu menuju fitur pertama, waktu onboarding untuk developer baru, dan total biaya infrastruktur dibandingkan alternatif headless.",
            'category' => 'Rekayasa',
            'tags' => ['laravel', 'inertia', 'react'],
            'author_id' => $admin->id,
            'published_at' => now()->subDays(3),
        ]);

        BlogPost::create([
            'slug' => 'core-web-vitals-without-killing-design',
            'title' => 'Menghadirkan Animasi Indah Tanpa Mengorbankan Core Web Vitals',
            'excerpt' => 'Animasi dan performa bukanlah musuh. Panduan praktis untuk animasi hanya transform, reveal dengan IntersectionObserver, dan menghormati reduced-motion.',
            'content' => "Klien menginginkan situs yang terasa hidup. Google menginginkan situs dengan skor hijau. Kedua tujuan itu bisa berjalan beriringan jika Anda mengikuti tiga aturan:\n\nPertama, animasikan hanya transform dan opacity — properti yang ditangani compositor tanpa perhitungan layout ulang. Kedua, picu animasi scroll dengan IntersectionObserver alih-alih listener event scroll; browser mengelompokkan pengecekan intersection secara efisien di luar jalur utama. Ketiga, hormati prefers-reduced-motion — aksesibilitas bukan pilihan, dan pengguna dengan gangguan vestibular akan berterima kasih.\n\nKami menunjukkan hasil Lighthouse sebelum/sesudah nyata dari build klien terbaru di mana kami menambahkan 40+ animasi dan sekaligus meningkatkan CLS.",
            'category' => 'Frontend',
            'tags' => ['performance', 'animation', 'core-web-vitals'],
            'author_id' => $admin->id,
            'published_at' => now()->subDays(10),
        ]);

        BlogPost::create([
            'slug' => 'debugging-production-laravel-apps',
            'title' => 'Panduan Lapangan Debugging Aplikasi Laravel di Produksi',
            'excerpt' => 'Dari query N+1 yang bersembunyi di balik kebohongan eager loading hingga queue worker yang mati diam-diam — playbook debugging yang kami gunakan dalam misi penyelamatan.',
            'content' => "Saat klien menelepon dan berkata 'produksi down', kepanikan adalah musuh dari diagnosis. Selama puluhan proyek penyelamatan kami telah membangun proses triase yang bisa diulang:\n\nPeriksa tingkat error terlebih dahulu (apakah melonjak atau datar?), korelasikan dengan deployment (apa yang berubah?), isolasi lapisannya (jaringan, aplikasi, atau database?). Lalu keseruan dimulai: snapshot Telescope, log slow-query, dan binary search yang klasik melalui commit terbaru.\n\nPanduan ini mencakup perintah, query, dan model mental yang tepat yang digunakan tim kami — termasuk lima masalah produksi Laravel paling umum yang kami temui dan perbaikan satu barisnya.",
            'category' => 'Backend',
            'tags' => ['debugging', 'laravel', 'production'],
            'author_id' => $admin->id,
            'published_at' => now()->subDays(18),
        ]);

        BlogPost::create([
            'slug' => 'code-review-culture',
            'title' => 'Apa yang Diajarkan 200 Code Review Tentang Membaca Kode Orang Lain',
            'excerpt' => 'Sebagian besar review gagal bukan karena kesenjangan teknis tetapi karena komunikasi. Pola yang kini kami ajarkan kepada setiap engineer yang bergabung di tim audit kami.',
            'content' => "Code review yang berkata 'ini salah' tidak membantu siapa pun. Review yang berkata 'ini berhasil, tetapi inilah mode kegagalan yang mungkin terjadi saat beban tinggi, dan inilah pola yang sudah digunakan tim di tempat lain' akan mengubah arah.\n\nSetelah melakukan ratusan audit profesional, kami telah mengkatalogkan anti-pola yang berulang: review yang mempermasalahkan gaya alih-alih arsitektur, temuan keamanan yang terkubur di antara saran format, dan klasik 'LGTM dengan 47 komentar'.\n\nKami membagikan kerangka tingkat keparahan kami (blocker / risiko / perbaikan / catatan), bagaimana kami mengkalibrasi nada untuk tim yang defensif, dan template yang bisa Anda curi untuk proses review Anda sendiri.",
            'category' => 'Budaya Rekayasa',
            'tags' => ['code-review', 'audit', 'teams'],
            'author_id' => $admin->id,
            'published_at' => now()->subDays(27),
        ]);

        // ── Projects (demo orders) ─────────────────────────────
        $posService = Service::where('slug', 'web-app-development')->first();
        $websiteService = Service::where('slug', 'website-development')->first();

        $project1 = Project::create([
            'user_id' => $client->id,
            'service_id' => $websiteService->id,
            'title' => 'Website Profil Perusahaan — Kopi Kenangan Senja',
            'requirements' => "Profil perusahaan 5 halaman untuk jaringan kedai kopi kami:\n- Beranda, Menu, Lokasi, Tentang, Kontak\n- Estetika hangat tapi loading cepat\n- Integrasi pemesanan via WhatsApp\n- Admin bisa update harga menu",
            'budget' => 6500000,
            'deadline' => now()->addDays(20),
            'status' => 'in_progress',
            'progress' => 65,
            'started_at' => now()->subDays(8),
        ]);

        ProjectUpdate::create(['project_id' => $project1->id, 'title' => 'Mockup desain disetujui', 'notes' => 'Klien menyetujui arah beranda v2. Lanjut ke tahap pengembangan.']);
        ProjectUpdate::create(['project_id' => $project1->id, 'title' => 'Pengembangan beranda selesai', 'notes' => 'Bagian hero, highlight menu, dan seksi testimoni telah diimplementasikan. Responsif telah diverifikasi di iOS Safari dan Android Chrome.']);

        $project2 = Project::create([
            'user_id' => $client->id,
            'service_id' => $posService->id,
            'title' => 'Aplikasi Web Manajemen Inventaris',
            'requirements' => "Sistem inventaris internal untuk 3 lokasi gudang:\n- Pelacakan stok masuk/keluar dengan scan barcode\n- Peringatan stok menipis via email\n- Laporan rekonsiliasi bulanan\n- Akses berbasis peran (manajer vs staf)",
            'budget' => 28000000,
            'deadline' => now()->addDays(45),
            'status' => 'pending',
        ]);

        $invoice = Invoice::create([
            'number' => 'INV-'.now()->format('Ym').'-0001',
            'project_id' => $project1->id,
            'user_id' => $client->id,
            'amount' => 6500000,
            'tax' => 715000,
            'total' => 7215000,
            'status' => 'paid',
            'due_date' => now()->addDays(6),
            'paid_at' => now()->subDays(7),
        ]);

        Invoice::create([
            'number' => 'INV-'.now()->format('Ym').'-0002',
            'project_id' => $project1->id,
            'user_id' => $client->id,
            'amount' => 3250000,
            'tax' => 357500,
            'total' => 3607500,
            'status' => 'unpaid',
            'due_date' => now()->addDays(10),
        ]);

        // ── Messages ───────────────────────────────────────────
        Message::create(['user_id' => $client->id, 'sender_role' => 'client', 'sender_name' => $client->name, 'body' => 'Halo! Sekadar menanyakan progres beranda. Apakah ada kemungkinan untuk preview minggu ini?', 'read_at' => now()]);
        Message::create(['user_id' => $client->id, 'sender_role' => 'admin', 'sender_name' => $admin->name, 'body' => 'Halo Sinta! Ya — link staging akan dikirim besok pagi. Beranda sudah selesai, kami sedang memoles transisi halaman menu. 🚀']);
        Message::create(['user_id' => $client->id, 'sender_role' => 'client', 'sender_name' => $client->name, 'body' => 'Sempurna, saya tunggu!']);

        ContactMessage::create([
            'name' => 'Putri Ayu',
            'email' => 'putri@butiknaya.com',
            'subject' => 'Permintaan penawaran e-commerce',
            'message' => 'Halo, saya menjalankan butik fashion dan butuh toko online dengan sinkronisasi inventaris ke toko fisik saya. Sekitar 300 SKU. Bisakah Anda membagikan perkiraan biaya dan timeline?',
            'read_at' => null,
        ]);

        $this->call(JokiServiceSeeder::class);
    }
}
