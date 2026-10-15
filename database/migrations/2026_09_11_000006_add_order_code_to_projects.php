<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('order_code', 20)->nullable()->unique()->after('id');
            $table->string('public_token', 32)->nullable()->after('order_code');
            $table->string('client_wa_cache', 20)->nullable()->after('public_token');
            $table->index('order_code');
        });

        // Backfill existing projects
        $projects = DB::table('projects')->whereNull('order_code')->get(['id', 'created_at']);
        foreach ($projects as $p) {
            $date = $p->created_at ? date('Ymd', strtotime($p->created_at)) : now()->format('Ymd');
            do {
                $code = 'RAY-'.$date.'-'.Str::upper(Str::random(4));
            } while (DB::table('projects')->where('order_code', $code)->exists());
            DB::table('projects')->where('id', $p->id)->update([
                'order_code' => $code,
                'public_token' => Str::random(32),
            ]);
        }

        // Jadikan order_code not nullable setelah backfill (jika ada data)
        // Biarkan nullable untuk fleksibilitas, tapi unique tetap
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['order_code', 'public_token', 'client_wa_cache']);
        });
    }
};
