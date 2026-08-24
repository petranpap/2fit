<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Single polymorphic pivot shared by gyms, trainers, and shops instead of
     * a separate {model}_category join table per type.
     */
    public function up(): void
    {
        Schema::create('categorizables', function (Blueprint $table) {
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->morphs('categorizable');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categorizables');
    }
};
