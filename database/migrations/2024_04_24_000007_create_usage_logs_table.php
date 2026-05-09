<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('unit_id')->constrained()->onDelete('cascade');
            $table->dateTime('actual_start_time');
            $table->dateTime('actual_end_time')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->integer('overtime_minutes')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usage_logs');
    }
};
