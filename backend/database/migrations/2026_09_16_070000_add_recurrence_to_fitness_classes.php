<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A class was always an indefinite weekly repeat with no way to run a
     * single one-off session or an end date (e.g. a 6-week program). Adds:
     * - recurrence_type: 'recurring' (uses days_of_week, as before) or
     *   'one_time' (a single session — days_of_week is ignored).
     * - starts_on: when a recurring pattern begins, or the exact date for a
     *   one_time session.
     * - recurrence_months: how many months a recurring pattern runs for;
     *   null means no end date (the previous, only, behavior).
     */
    public function up(): void
    {
        Schema::table('fitness_classes', function (Blueprint $table) {
            $table->enum('recurrence_type', ['recurring', 'one_time'])->default('recurring')->after('name');
            $table->date('starts_on')->nullable()->after('days_of_week');
            $table->unsignedTinyInteger('recurrence_months')->nullable()->after('starts_on');
        });
    }

    public function down(): void
    {
        Schema::table('fitness_classes', function (Blueprint $table) {
            $table->dropColumn(['recurrence_type', 'starts_on', 'recurrence_months']);
        });
    }
};
