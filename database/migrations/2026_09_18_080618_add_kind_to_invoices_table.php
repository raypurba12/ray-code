<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // kind: dp = DP 50%, final = Pelunasan 50%, full = legacy full amount (sebelum fitur DP)
            $table->enum('kind', ['dp', 'final', 'full'])->default('full')->after('total');
            $table->string('label')->nullable()->after('kind');
            $table->index('kind');
        });

        // Backfill existing invoices → kind = full
        // Tidak perlu ubah data karena default full
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['kind', 'label']);
        });
    }
};
