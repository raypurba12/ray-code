<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('logo', 500)->nullable()->after('icon');
        });

        // Backfill logo dari joki_services berdasar slug
        $rows = DB::table('joki_services')->whereNotNull('logo')->get(['slug', 'logo']);
        foreach ($rows as $r) {
            DB::table('services')->where('slug', $r->slug)->update(['logo' => $r->logo]);
        }
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('logo');
        });
    }
};
