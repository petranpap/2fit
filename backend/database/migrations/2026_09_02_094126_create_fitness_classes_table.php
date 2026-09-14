<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Polymorphic: a scheduled class belongs to a gym, trainer, or shop
     * (classable), same pattern as offers.
     */
    public function up(): void
    {
        Schema::create('fitness_classes', function (Blueprint $table) {
            $table->id();
            $table->morphs('classable');
            $table->string('name');
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])->nullable();
            $table->time('starts_at')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->unsignedSmallInteger('capacity')->nullable();
            // Owner-curated highlight flag — "Popular Classes" on the
            // profile screen shows these first, not an engagement metric.
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fitness_classes');
    }
};
