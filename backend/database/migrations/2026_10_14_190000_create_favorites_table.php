<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Polymorphic: a favorite belongs to a gym, trainer, or shop
     * (favoritable), same pattern as reviews/categorizables.
     */
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->morphs('favoritable');
            $table->timestamps();

            $table->unique(['user_id', 'favoritable_id', 'favoritable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
