<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Single polymorphic pivot shared by gyms and shops, same pattern as
     * categorizables — one table instead of a join table per type.
     */
    public function up(): void
    {
        Schema::create('facilitatables', function (Blueprint $table) {
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->morphs('facilitatable');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilitatables');
    }
};
