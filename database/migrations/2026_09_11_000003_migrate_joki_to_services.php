<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Migrasi data joki_services -> services dengan type=joki (idempoten)
        $exists = DB::table('services')->where('type', 'joki')->exists();
        if ($exists) {
            return; // sudah dimigrasi
        }

        $rows = DB::table('joki_services')->get();
        foreach ($rows as $r) {
            $slug = $r->slug;
            // skip jika slug sudah ada di services (hindari unique violation)
            if (DB::table('services')->where('slug', $slug)->exists()) {
                continue;
            }

            DB::table('services')->insert([
                'slug' => $slug,
                'title' => $r->title,
                'icon' => $r->icon ?? 'code2',
                'short_desc' => mb_substr($r->desc, 0, 300),
                'description' => $r->desc,
                'features' => json_encode(['Konsultasi gratis', 'Revisi sesuai brief', 'Garansi bug 7 hari']),
                'starting_price' => 500000,
                'delivery_days' => 3,
                'type' => 'joki',
                'category' => $r->category,
                'category_en' => $r->category_en,
                'is_featured' => false,
                'sort_order' => 1000 + $r->sort_order, // joki di belakang paket
                'created_at' => $r->created_at,
                'updated_at' => $r->updated_at,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('services')->where('type', 'joki')->delete();
    }
};
