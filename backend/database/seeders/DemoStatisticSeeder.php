<?php

namespace Database\Seeders;

use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * A week of daily aggregated counters for the seeded (verified) listings —
 * the statistics table has no writer yet (see Statistic model docblock),
 * so the Admin panel's Statistics resource would otherwise be empty.
 */
class DemoStatisticSeeder extends Seeder
{
    private const METRICS = ['profile_view', 'offer_view', 'offer_redemption', 'favorite'];

    public function run(): void
    {
        $listings = collect()
            ->merge(Gym::where('is_verified', true)->get())
            ->merge(Trainer::where('is_verified', true)->get())
            ->merge(Shop::where('is_verified', true)->get());

        foreach ($listings as $listing) {
            for ($daysAgo = 0; $daysAgo < 7; $daysAgo++) {
                $date = Carbon::today()->subDays($daysAgo);

                foreach (self::METRICS as $metric) {
                    // Fewer redemptions/favorites than views — roughly realistic funnel shape.
                    $count = match ($metric) {
                        'profile_view' => random_int(10, 60),
                        'offer_view' => random_int(3, 25),
                        'offer_redemption' => random_int(0, 5),
                        'favorite' => random_int(0, 8),
                    };

                    $listing->statistics()->updateOrCreate(
                        ['metric' => $metric, 'date' => $date->toDateString()],
                        ['count' => $count],
                    );
                }
            }
        }
    }
}
