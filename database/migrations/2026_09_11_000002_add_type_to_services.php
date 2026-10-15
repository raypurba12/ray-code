<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->enum('type', ['package', 'joki'])->default('package')->after('delivery_days');
            $table->string('category')->nullable()->after('type');
            $table->string('category_en')->nullable()->after('category');
            $table->index(['type', 'is_featured', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['type', 'category', 'category_en']);
        });
    }
};
