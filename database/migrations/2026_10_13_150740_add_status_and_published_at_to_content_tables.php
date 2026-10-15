<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->enum('status', ['draft', 'published'])->default('draft')->after('sort_order');
            $table->timestamp('published_at')->nullable()->after('status');
            $table->index(['status', 'published_at']);
        });

        Schema::table('portfolios', function (Blueprint $table) {
            $table->enum('status', ['draft', 'published'])->default('draft')->after('sort_order');
            $table->timestamp('published_at')->nullable()->after('status');
            $table->index(['status', 'published_at']);
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->enum('status', ['draft', 'published'])->default('draft')->after('published_at');
            $table->index(['status', 'published_at']);
        });

        Schema::table('faqs', function (Blueprint $table) {
            $table->enum('status', ['draft', 'published'])->default('draft')->after('is_active');
            $table->timestamp('published_at')->nullable()->after('status');
            $table->index(['status', 'published_at']);
        });

        Schema::table('pricing_plans', function (Blueprint $table) {
            $table->enum('status', ['draft', 'published'])->default('draft')->after('is_active');
            $table->timestamp('published_at')->nullable()->after('status');
            $table->index(['status', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex(['status', 'published_at']);
            $table->dropColumn(['status', 'published_at']);
        });

        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropIndex(['status', 'published_at']);
            $table->dropColumn(['status', 'published_at']);
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropIndex(['status', 'published_at']);
            $table->dropColumn(['status']);
        });

        Schema::table('faqs', function (Blueprint $table) {
            $table->dropIndex(['status', 'published_at']);
            $table->dropColumn(['status', 'published_at']);
        });

        Schema::table('pricing_plans', function (Blueprint $table) {
            $table->dropIndex(['status', 'published_at']);
            $table->dropColumn(['status', 'published_at']);
        });
    }
};