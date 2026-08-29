<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * A handful of realistic Cyprus-based gyms/trainers/shops so Search/Categories/
 * Home screens have real content to render against in local dev.
 */
class DemoListingSeeder extends Seeder
{
    public function run(): void
    {
        $gyms = [
            [
                'name' => 'PowerHouse Gym Limassol',
                'description' => 'Πλήρως εξοπλισμένο γυμναστήριο στο κέντρο της Λεμεσού, με ελεύθερα βάρη και group classes.',
                'address' => 'Λεωφόρος Αρχ. Μακαρίου Γ΄, Λεμεσός',
                'latitude' => 34.7071,
                'longitude' => 33.0226,
                'is_verified' => true,
                'categories' => ['gym', 'crossfit'],
            ],
            [
                'name' => 'FitZone Nicosia',
                'description' => 'Σύγχρονο γυμναστήριο στη Λευκωσία με πισίνα και sauna.',
                'address' => 'Λεωφόρος Λεμεσού, Λευκωσία',
                'latitude' => 35.1856,
                'longitude' => 33.3823,
                'is_verified' => true,
                'categories' => ['gym'],
            ],
            [
                'name' => 'Larnaca Strength Club',
                'description' => 'Powerlifting & CrossFit box δίπλα στη μαρίνα της Λάρνακας.',
                'address' => 'Λεωφόρος Αθηνών, Λάρνακα',
                'latitude' => 34.9182,
                'longitude' => 33.6233,
                'is_verified' => false,
                'categories' => ['gym', 'crossfit'],
            ],
        ];

        $trainers = [
            [
                'name' => 'Ανδρέας Παύλου',
                'bio' => 'Πιστοποιημένος personal trainer με εξειδίκευση σε απώλεια βάρους και δύναμη.',
                'address' => 'Λεμεσός',
                'latitude' => 34.6786,
                'longitude' => 33.0459,
                'hourly_rate' => 35.00,
                'is_verified' => true,
                'categories' => ['personal-training'],
            ],
            [
                'name' => 'Μαρία Ιωάννου',
                'bio' => 'Yoga & Pilates instructor, ιδιωτικά και group μαθήματα.',
                'address' => 'Λευκωσία',
                'latitude' => 35.1667,
                'longitude' => 33.3667,
                'hourly_rate' => 30.00,
                'is_verified' => true,
                'categories' => ['yoga-pilates'],
            ],
            [
                'name' => 'Κώστας Δημητρίου',
                'bio' => 'CrossFit coach & personal trainer, 10+ χρόνια εμπειρίας.',
                'address' => 'Λάρνακα',
                'latitude' => 34.9100,
                'longitude' => 33.6300,
                'hourly_rate' => 40.00,
                'is_verified' => false,
                'categories' => ['crossfit', 'personal-training'],
            ],
        ];

        $shops = [
            [
                'name' => 'SportsWorld Cyprus',
                'description' => 'Αθλητικά είδη και ρούχα γυμναστικής, όλες οι γνωστές μάρκες.',
                'address' => 'My Mall, Λεμεσός',
                'latitude' => 34.7300,
                'longitude' => 33.0100,
                'is_verified' => true,
                'categories' => ['sportswear'],
            ],
            [
                'name' => 'NutriFit Supplements',
                'description' => 'Πρωτεΐνες, βιταμίνες και συμπληρώματα διατροφής.',
                'address' => 'Λευκωσία',
                'latitude' => 35.1700,
                'longitude' => 33.3600,
                'is_verified' => true,
                'categories' => ['supplements'],
            ],
            [
                'name' => 'Active Gear Paphos',
                'description' => 'Εξοπλισμός γυμναστικής και αθλητικά παπούτσια.',
                'address' => 'Πάφος',
                'latitude' => 34.7720,
                'longitude' => 32.4297,
                'is_verified' => false,
                'categories' => ['sportswear'],
            ],
        ];

        $this->seedType(Gym::class, 'gym_owner', $gyms);
        $this->seedType(Trainer::class, 'trainer', $trainers);
        $this->seedType(Shop::class, 'shop', $shops);
    }

    /**
     * @param  class-string<Gym|Trainer|Shop>  $modelClass
     * @param  array<int, array<string, mixed>>  $items
     */
    private function seedType(string $modelClass, string $role, array $items): void
    {
        foreach ($items as $item) {
            $categorySlugs = $item['categories'];
            unset($item['categories']);

            $owner = User::factory()->create([
                'name' => $item['name'].' Owner',
                'email' => str($item['name'])->slug().'-owner@example.com',
                'role' => $role,
            ]);

            $entity = $modelClass::create([
                ...$item,
                'user_id' => $owner->id,
                'slug' => str($item['name'])->slug(),
                'is_active' => true,
            ]);

            $entity->categories()->attach(
                Category::whereIn('slug', $categorySlugs)->pluck('id')
            );
        }
    }
}
