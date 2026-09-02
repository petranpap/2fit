<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            ['name' => 'Δωρεάν Wi-Fi', 'slug' => 'free-wifi', 'icon' => 'wifi'],
            ['name' => 'Πάρκινγκ', 'slug' => 'parking', 'icon' => 'parking'],
            ['name' => 'Ντουζιέρες', 'slug' => 'showers', 'icon' => 'shower'],
            ['name' => 'Ντουλάπια', 'slug' => 'locker-room', 'icon' => 'locker'],
            ['name' => 'Καφέ', 'slug' => 'cafe', 'icon' => 'cafe'],
            ['name' => 'Εξοπλισμός Υψηλής Ποιότητας', 'slug' => 'top-quality-equipment', 'icon' => 'equipment'],
        ];

        foreach ($facilities as $facility) {
            Facility::updateOrCreate(['slug' => $facility['slug']], $facility);
        }
    }
}
