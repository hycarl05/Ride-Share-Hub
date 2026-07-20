<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('ic_number');
            $table->string('license_number');
            $table->string('vehicle_type');
            $table->string('vehicle_plate');
            $table->string('profile_photo')->nullable();
            $table->string('vehicle_photo')->nullable();
            $table->string('status')->default('pending'); // pending | approved | rejected | suspended
            $table->boolean('is_online')->default(false);
            $table->float('rating')->default(0);
            $table->integer('total_rides')->default(0);
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
