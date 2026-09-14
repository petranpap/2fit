<?php

namespace Database\Seeders;

use App\Models\Facility;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Database\Seeder;

class DemoFitnessClassSeeder extends Seeder
{
    public function run(): void
    {
        $gym = Gym::where('slug', 'powerhouse-gym-limassol')->first();
        $trainer = Trainer::where('slug', 'andreas-pauloy')->first();
        $shop = Shop::where('slug', 'sportsworld-cyprus')->first();

        if ($gym) {
            $gym->facilities()->attach(
                Facility::whereIn('slug', ['free-wifi', 'parking', 'showers', 'locker-room', 'cafe'])->pluck('id')
            );

            $gym->fitnessClasses()->createMany([
                ['name' => 'HIIT Training', 'days_of_week' => ['monday', 'wednesday', 'friday'], 'starts_at' => '18:00', 'duration_minutes' => 45, 'capacity' => 20, 'is_popular' => true],
                ['name' => 'CrossFit Basics', 'days_of_week' => ['tuesday', 'thursday'], 'starts_at' => '19:00', 'duration_minutes' => 60, 'capacity' => 15, 'is_popular' => true],
                ['name' => 'Yoga Flow', 'days_of_week' => ['friday', 'sunday'], 'starts_at' => '08:00', 'duration_minutes' => 50, 'capacity' => 12, 'is_popular' => false],
            ]);
        }

        if ($trainer) {
            $trainer->fitnessClasses()->createMany([
                ['name' => '1-on-1 Strength Session', 'days_of_week' => ['monday', 'wednesday', 'friday'], 'starts_at' => '17:00', 'duration_minutes' => 60, 'capacity' => 1, 'is_popular' => true],
            ]);
        }

        if ($shop) {
            $shop->facilities()->attach(
                Facility::whereIn('slug', ['free-wifi', 'parking'])->pluck('id')
            );
        }
    }
}
