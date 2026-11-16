<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->json('spoken_languages')->nullable();
            $table->text('gym_education')->nullable();
            $table->text('gym_training')->nullable();
            $table->boolean('qualification_declaration')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropColumn(['spoken_languages', 'gym_education', 'gym_training', 'qualification_declaration']);
        });
    }
};
