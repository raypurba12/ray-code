<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('midtrans_order_id')->nullable()->unique()->after('number');
            $table->timestamp('snap_token_expires_at')->nullable()->after('snap_token');
            $table->index('midtrans_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['midtrans_order_id', 'snap_token_expires_at']);
        });
    }
};
