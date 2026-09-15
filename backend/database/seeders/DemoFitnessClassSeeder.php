<?php

namespace Database\Seeders;

use App\Models\Facility;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoFitnessClassSeeder extends Seeder
{
    public function run(): void
    {
        $gym = Gym::where('slug', 'powerhouse-gym-limassol')->first();
        $trainer = Trainer::where('slug', 'andreas-pauloy')->first();
        $shop = Shop::where('slug', 'sportsworld-cyprus')->first();

        // Started a month ago, no end date — the common case, an ongoing
        // weekly class.
        $recurringStartedOn = Carbon::today()->subMonth()->toDateString();

        if ($gym) {
            $gym->facilities()->attach(
                Facility::whereIn('slug', ['free-wifi', 'parking', 'showers', 'locker-room', 'cafe'])->pluck('id')
            );

            $gym->fitnessClasses()->createMany([
                ['name' => 'HIIT Training', 'recurrence_type' => 'recurring', 'starts_on' => $recurringStartedOn, 'days_of_week' => ['monday', 'wednesday', 'friday'], 'starts_at' => '18:00', 'duration_minutes' => 45, 'capacity' => 20, 'is_popular' => true],
                ['name' => 'CrossFit Basics', 'recurrence_type' => 'recurring', 'starts_on' => $recurringStartedOn, 'days_of_week' => ['tuesday', 'thursday'], 'starts_at' => '19:00', 'duration_minutes' => 60, 'capacity' => 15, 'is_popular' => true],
                // A bounded 3-month program, not an indefinite repeat.
                ['name' => 'Yoga Flow', 'recurrence_type' => 'recurring', 'starts_on' => $recurringStartedOn, 'recurrence_months' => 3, 'days_of_week' => ['friday', 'sunday'], 'starts_at' => '08:00', 'duration_minutes' => 50, 'capacity' => 12, 'is_popular' => false],
                // A single one-off session — showcases the "one_time" type.
                ['name' => 'Nutrition Workshop', 'recurrence_type' => 'one_time', 'starts_on' => Carbon::today()->addWeeks(2)->toDateString(), 'starts_at' => '10:00', 'duration_minutes' => 90, 'capacity' => 25, 'is_popular' => false],
            ]);
        }

        if ($trainer) {
            $trainer->fitnessClasses()->createMany([
                ['name' => '1-on-1 Strength Session', 'recurrence_type' => 'recurring', 'starts_on' => $recurringStartedOn, 'days_of_week' => ['monday', 'wednesday', 'friday'], 'starts_at' => '17:00', 'duration_minutes' => 60, 'capacity' => 1, 'is_popular' => true],
            ]);
        }

        if ($shop) {
            $shop->facilities()->attach(
                Facility::whereIn('slug', ['free-wifi', 'parking'])->pluck('id')
            );
        }
    }
}
