<?php

namespace Database\Seeders;

use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * A few reviews across the seeded (verified) listings, so the Admin panel's
 * Reviews moderation resource has real content to demo/test against —
 * including one flagged/inappropriate one to moderate.
 */
class DemoReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviewer = User::where('email', 'test@example.com')->first();
        $gym = Gym::where('slug', 'powerhouse-gym-limassol')->first();
        $trainer = Trainer::where('slug', 'andreas-pauloy')->first();
        $shop = Shop::where('slug', 'sportsworld-cyprus')->first();

        if (! $reviewer) {
            return;
        }

        if ($gym) {
            $gym->reviews()->create([
                'user_id' => $reviewer->id,
                'rating' => 5,
                'comment' => 'Καταπληκτικός εξοπλισμός και πολύ καθαρό. Το προτείνω ανεπιφύλακτα!',
            ]);
        }

        if ($trainer) {
            $trainer->reviews()->create([
                'user_id' => $reviewer->id,
                'rating' => 4,
                'comment' => 'Πολύ επαγγελματίας, με βοήθησε να βελτιώσω σημαντικά τη φόρμα μου.',
            ]);
        }

        if ($shop) {
            // Deliberately low-quality/off-topic — a realistic moderation
            // candidate for the Reviews resource.
            $shop->reviews()->create([
                'user_id' => $reviewer->id,
                'rating' => 1,
                'comment' => 'spam spam buy my product at totally-unrelated-site.example',
            ]);
        }
    }
}
