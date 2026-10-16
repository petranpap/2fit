<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Top-level categories. `is_primary` controls which of these show up
        // as the app's main quick-browse tiles (Home icons, Explore's "Top
        // Categories") — "Shops" exists purely to group sportswear/supplements
        // under something, without cluttering that primary row.
        // image_url: placeholder Unsplash photos for the Explore "Top
        // Categories" cards — real partner-uploaded photography has nowhere
        // to go here yet (categories aren't a Filament-managed resource with
        // image upload), so these stand in until that exists.
        $mainCategories = [
            [
                'name' => 'Gyms', 'slug' => 'gyms', 'icon' => 'dumbbell', 'is_primary' => true,
                'image_url' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
            ],
            [
                'name' => 'Martial Arts', 'slug' => 'martial-arts', 'icon' => 'kettlebell', 'is_primary' => true,
                'image_url' => 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
            ],
            [
                'name' => 'Wellness', 'slug' => 'wellness', 'icon' => 'yoga', 'is_primary' => true,
                'image_url' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
            ],
            [
                'name' => 'Personal Trainers', 'slug' => 'personal-trainers', 'icon' => 'user-check', 'is_primary' => true,
                'image_url' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
            ],
            ['name' => 'Shops', 'slug' => 'shops', 'icon' => 'shirt', 'is_primary' => false],
        ];

        $mainIds = [];
        foreach ($mainCategories as $category) {
            $mainIds[$category['slug']] = Category::updateOrCreate(
                ['slug' => $category['slug']],
                [...$category, 'parent_id' => null]
            )->id;
        }

        // Subcategories — what a listing is actually tagged with. Slugs match
        // what DemoListingSeeder/Filament already reference, so existing
        // category assignments keep working.
        $subcategories = [
            ['name' => 'Γυμναστήριο', 'slug' => 'gym', 'icon' => 'dumbbell', 'parent' => 'gyms'],
            ['name' => 'CrossFit', 'slug' => 'crossfit', 'icon' => 'kettlebell', 'parent' => 'gyms'],
            ['name' => 'Kickboxing', 'slug' => 'kickboxing', 'icon' => 'kettlebell', 'parent' => 'martial-arts'],
            ['name' => 'MMA', 'slug' => 'mma', 'icon' => 'kettlebell', 'parent' => 'martial-arts'],
            ['name' => 'Yoga & Pilates', 'slug' => 'yoga-pilates', 'icon' => 'yoga', 'parent' => 'wellness'],
            ['name' => 'Προσωπική Προπόνηση', 'slug' => 'personal-training', 'icon' => 'user-check', 'parent' => 'personal-trainers'],
            ['name' => 'Αθλητικά Είδη', 'slug' => 'sportswear', 'icon' => 'shirt', 'parent' => 'shops'],
            ['name' => 'Συμπληρώματα Διατροφής', 'slug' => 'supplements', 'icon' => 'flask', 'parent' => 'shops'],
        ];

        foreach ($subcategories as $category) {
            $parentSlug = $category['parent'];
            unset($category['parent']);

            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [...$category, 'parent_id' => $mainIds[$parentSlug], 'is_primary' => false]
            );
        }
    }
}
