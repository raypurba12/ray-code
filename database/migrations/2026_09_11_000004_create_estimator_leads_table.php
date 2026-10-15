<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estimator_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->string('complexity', 60);
            $table->json('features'); // array of feature ids
            $table->string('urgency', 60);
            $table->unsignedBigInteger('low_estimate');
            $table->unsignedBigInteger('high_estimate');
            $table->string('email')->nullable();
            $table->string('wa')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['service_id', 'created_at']);
            $table->index('ip');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estimator_leads');
    }
};
