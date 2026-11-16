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
                'opening_hours' => $this->dailyOpeningHours('06:00', '23:00'),
                'cover_image_path' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
            ],
            [
                'name' => 'FitZone Nicosia',
                'description' => 'Σύγχρονο γυμναστήριο στη Λευκωσία με πισίνα και sauna.',
                'address' => 'Λεωφόρος Λεμεσού, Λευκωσία',
                'latitude' => 35.1856,
                'longitude' => 33.3823,
                'is_verified' => true,
                'categories' => ['gym'],
                'opening_hours' => $this->dailyOpeningHours('07:00', '22:00', ['sunday']),
                'cover_image_path' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
            ],
            [
                'name' => 'Larnaca Strength Club',
                'description' => 'Powerlifting & CrossFit box δίπλα στη μαρίνα της Λάρνακας.',
                'address' => 'Λεωφόρος Αθηνών, Λάρνακα',
                'latitude' => 34.9182,
                'longitude' => 33.6233,
                'is_verified' => false,
                'categories' => ['gym', 'crossfit'],
                'opening_hours' => $this->dailyOpeningHours('06:00', '22:00'),
                'cover_image_path' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
            ],
            [
                'name' => 'Titan Fight Club',
                'description' => 'Σχολή πολεμικών τεχνών με kickboxing και MMA, για αρχάριους και αγωνιστικό επίπεδο.',
                'address' => 'Λεωφόρος Μακαρίου, Λεμεσός',
                'latitude' => 34.6900,
                'longitude' => 33.0350,
                'is_verified' => true,
                'categories' => ['kickboxing', 'mma'],
                'opening_hours' => $this->dailyOpeningHours('17:00', '21:30', ['sunday']),
                'cover_image_path' => 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
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
                'photo_path' => 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&h=400&fit=crop&q=80',
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
                'photo_path' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80',
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
                'photo_path' => 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&h=400&fit=crop&q=80',
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
                'opening_hours' => $this->dailyOpeningHours('10:00', '20:00', ['sunday']),
                'cover_image_path' => 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
            ],
            [
                'name' => 'NutriFit Supplements',
                'description' => 'Πρωτεΐνες, βιταμίνες και συμπληρώματα διατροφής.',
                'address' => 'Λευκωσία',
                'latitude' => 35.1700,
                'longitude' => 33.3600,
                'is_verified' => true,
                'categories' => ['supplements'],
                'opening_hours' => $this->dailyOpeningHours('09:00', '19:00', ['sunday']),
                'cover_image_path' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
            ],
            [
                'name' => 'Active Gear Paphos',
                'description' => 'Εξοπλισμός γυμναστικής και αθλητικά παπούτσια.',
                'address' => 'Πάφος',
                'latitude' => 34.7720,
                'longitude' => 32.4297,
                'is_verified' => false,
                'categories' => ['sportswear'],
                'opening_hours' => $this->dailyOpeningHours('10:00', '20:00', ['sunday']),
                'cover_image_path' => 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
            ],
        ];

        $this->seedType(Gym::class, 'gym_owner', $gyms);
        $this->seedType(Trainer::class, 'trainer', $trainers);
        $this->seedType(Shop::class, 'shop', $shops);
    }

    /**
     * Same opens_at/closes_at every day except the given closed days — plenty
     * for demo data; Filament's day-by-day picker handles real partners'
     * uneven schedules.
     *
     * @param  array<int, string>  $closedDays
     * @return array<string, array{is_open: bool, opens_at: ?string, closes_at: ?string}>
     */
    private function dailyOpeningHours(string $opensAt, string $closesAt, array $closedDays = []): array
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        return collect($days)->mapWithKeys(fn ($day) => [
            $day => in_array($day, $closedDays, true)
                ? ['is_open' => false, 'opens_at' => null, 'closes_at' => null]
                : ['is_open' => true, 'opens_at' => $opensAt, 'closes_at' => $closesAt],
        ])->all();
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
