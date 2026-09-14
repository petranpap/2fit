<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A class can now run on more than one day a week (e.g. HIIT Mon/Wed/Fri) —
     * the owner picks a set of days instead of exactly one.
     */
    public function up(): void
    {
        Schema::table('fitness_classes', function (Blueprint $table) {
            $table->json('days_of_week')->nullable()->after('name');
        });

        DB::table('fitness_classes')->whereNotNull('day_of_week')->get(['id', 'day_of_week'])->each(
            fn ($row) => DB::table('fitness_classes')->where('id', $row->id)->update([
                'days_of_week' => json_encode([$row->day_of_week]),
            ])
        );

        Schema::table('fitness_classes', function (Blueprint $table) {
            $table->dropColumn('day_of_week');
        });
    }

    public function down(): void
    {
        Schema::table('fitness_classes', function (Blueprint $table) {
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
                ->nullable()
                ->after('name');
        });

        DB::table('fitness_classes')->whereNotNull('days_of_week')->get(['id', 'days_of_week'])->each(
            fn ($row) => DB::table('fitness_classes')->where('id', $row->id)->update([
                'day_of_week' => json_decode($row->days_of_week, true)[0] ?? null,
            ])
        );

        Schema::table('fitness_classes', function (Blueprint $table) {
            $table->dropColumn('days_of_week');
        });
    }
};
