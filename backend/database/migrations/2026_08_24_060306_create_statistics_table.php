<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Daily aggregated counters per gym/trainer/shop (statable), feeding the
     * partner dashboard's basic stats.
     */
    public function up(): void
    {
        Schema::create('statistics', function (Blueprint $table) {
            $table->id();
            $table->morphs('statable');
            $table->enum('metric', ['profile_view', 'offer_view', 'offer_redemption', 'favorite']);
            $table->date('date');
            $table->unsignedInteger('count')->default(0);
            $table->timestamps();

            $table->unique(['statable_type', 'statable_id', 'metric', 'date'], 'statistics_statable_metric_date_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistics');
    }
};
