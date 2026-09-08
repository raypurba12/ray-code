<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('joki_services', function (Blueprint $table) {
            $table->string('title_en')->nullable()->after('title');
            $table->string('desc_en', 500)->nullable()->after('desc');
            $table->string('category_en', 100)->nullable()->after('category');
        });
    }

    public function down(): void
    {
        Schema::table('joki_services', function (Blueprint $table) {
            $table->dropColumn(['title_en', 'desc_en', 'category_en']);
        });
    }
};
