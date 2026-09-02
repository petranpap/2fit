<?php

namespace Database\Seeders;

use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoOfferSeeder extends Seeder
{
    public function run(): void
    {
        $gym = Gym::where('slug', 'powerhouse-gym-limassol')->first();
        $trainer = Trainer::where('slug', 'andreas-pauloy')->first();
        $shop = Shop::where('slug', 'sportsworld-cyprus')->first();

        if ($gym) {
            $gym->offers()->create([
                'title' => '20% έκπτωση σε ετήσια συνδρομή',
                'description' => 'Ισχύει για νέες εγγραφές μέχρι το τέλος του μήνα.',
                'discount_type' => 'percentage',
                'discount_value' => 20,
                'expires_at' => Carbon::now()->addMonth(),
            ]);
        }

        if ($trainer) {
            $trainer->offers()->create([
                'title' => '5€ έκπτωση στην πρώτη συνεδρία',
                'description' => 'Για νέους πελάτες που κλείνουν την πρώτη τους συνεδρία online.',
                'discount_type' => 'fixed_amount',
                'discount_value' => 5,
                'expires_at' => Carbon::now()->addWeeks(2),
            ]);
        }

        if ($shop) {
            $shop->offers()->create([
                'title' => '15% έκπτωση σε αθλητικά παπούτσια',
                'description' => 'Ισχύει σε επιλεγμένες μάρκες, μέχρι εξαντλήσεως αποθεμάτων.',
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'expires_at' => Carbon::now()->addDays(10),
            ]);
        }
    }
}
