<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Top-level categories.
        // Keep existing main categories and their images.
        $mainCategories = [
            [
                'name' => 'Gyms',
                'slug' => 'gyms',
                'icon' => 'dumbbell',
                'is_primary' => true,
                'image_url' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
            ],
            [
                'name' => 'Martial Arts',
                'slug' => 'martial-arts',
                'icon' => 'kettlebell',
                'is_primary' => true,
                'image_url' => 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
            ],
            [
                'name' => 'Wellness',
                'slug' => 'wellness',
                'icon' => 'yoga',
                'is_primary' => true,
                'image_url' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
            ],
            [
                'name' => 'Personal Trainers',
                'slug' => 'personal-trainers',
                'icon' => 'user-check',
                'is_primary' => true,
                'image_url' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
            ],
            [
                'name' => 'Shops',
                'slug' => 'shops',
                'icon' => 'shirt',
                'is_primary' => false,
            ],
        ];

        $mainIds = [];

        foreach ($mainCategories as $category) {
            $mainIds[$category['slug']] = Category::updateOrCreate(
                ['slug' => $category['slug']],
                [...$category, 'parent_id' => null]
            )->id;
        }

        // Subcategories.
        // Existing slugs are preserved to protect category assignments.
        $subcategories = [

            // GYMS - UNCHANGED
            [
                'name' => 'Gyms',
                'slug' => 'gym',
                'icon' => 'dumbbell',
                'parent' => 'gyms',
                'image_url' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
            ],
            [
                'name' => 'CrossFit',
                'slug' => 'crossfit',
                'icon' => 'kettlebell',
                'parent' => 'gyms',
                'image_url' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
            ],
            [
                'name' => 'Female Only Gyms',
                'slug' => 'female-only-gyms',
                'icon' => 'dumbbell',
                'parent' => 'gyms',
                'image_url' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
            ],
            [
                'name' => 'Swimming Centers',
                'slug' => 'swimming-centers',
                'icon' => 'water',
                'parent' => 'gyms',
                'image_url' => 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',
            ],

            // MARTIAL ARTS - UNCHANGED
            [
                'name' => 'Kickboxing',
                'slug' => 'kickboxing',
                'icon' => 'flash',
                'parent' => 'martial-arts',
                'image_url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Igor_Galli_Kickboxing_Fight.jpg',
            ],
            [
                'name' => 'MMA',
                'slug' => 'mma',
                'icon' => 'shield',
                'parent' => 'martial-arts',
                'image_url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Mixed_martial_arts_bout.jpg',
            ],
            [
                'name' => 'Karate',
                'slug' => 'karate',
                'icon' => 'hand-left',
                'parent' => 'martial-arts',
                'image_url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Karate2.jpg',
            ],
            [
                'name' => 'Taekwondo',
                'slug' => 'taekwondo',
                'icon' => 'footsteps',
                'parent' => 'martial-arts',
                'image_url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/WTF_Taekwondo_1.jpg',
            ],
            [
                'name' => 'Boxing Centers',
                'slug' => 'boxing-centers',
                'icon' => 'fitness',
                'parent' => 'martial-arts',
                'image_url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Boxing_Match.jpg',
            ],
            [
                'name' => 'Wing Chun',
                'slug' => 'wing-chun',
                'icon' => 'body',
                'parent' => 'martial-arts',
                'image_url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Wingchun.jpg',
            ],
            [
                'name' => 'Other Martial Arts',
                'slug' => 'other-martial-arts',
                'icon' => 'star',
                'parent' => 'martial-arts',
                'image_url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Budojo.jpg',
            ],

            // PERSONAL TRAINERS - UNCHANGED
            [
                'name' => 'Gym Personal Trainer',
                'slug' => 'personal-training',
                'icon' => 'user-check',
                'parent' => 'personal-trainers',
                'image_url' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
            ],
            [
                'name' => 'Martial Arts Personal Trainer',
                'slug' => 'martial-arts-personal-trainer',
                'icon' => 'user-check',
                'parent' => 'personal-trainers',
                'image_url' => 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
            ],
            [
                'name' => 'Wellness Personal Trainer',
                'slug' => 'wellness-personal-trainer',
                'icon' => 'user-check',
                'parent' => 'personal-trainers',
                'image_url' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
            ],

            // WELLNESS - PHOTO ADDED TO YOGA & PILATES
            [
                'name' => 'Yoga & Pilates',
                'slug' => 'yoga-pilates',
                'icon' => 'yoga',
                'parent' => 'wellness',
                'image_url' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
            ],

            // WELLNESS - BALLET - UNCHANGED
            [
                'name' => 'Ballet',
                'slug' => 'ballet',
                'icon' => 'body',
                'parent' => 'wellness',
                'image_url' => 'https://images.squarespace-cdn.com/content/v1/648115df0708dc46b443ec54/2480d4d9-6f03-40b5-9cc8-9de3a4b0e2b8/Si%2Bphoto-webnew.jpg',
            ],

            // WELLNESS - DANCING SCHOOLS - UNCHANGED
            [
                'name' => 'Dancing Schools',
                'slug' => 'dancing-schools',
                'icon' => 'musical-notes',
                'parent' => 'wellness',
                'image_url' => 'https://images.squarespace-cdn.com/content/v1/595e880e579fb3d15cb7ab68/1502816986278-UJLYYI47TNAPCI6C4YCY/Independent%2BPE%2BSanta%2BBarbara%2BDance%2BClasses',
            ],

            // OTHER EXISTING CATEGORIES - UNCHANGED
            [
                'name' => 'Αθλητικά Είδη',
                'slug' => 'sportswear',
                'icon' => 'shirt',
                'parent' => 'shops',
            ],
            [
                'name' => 'Συμπληρώματα Διατροφής',
                'slug' => 'supplements',
                'icon' => 'flask',
                'parent' => 'shops',
            ],
        ];

        foreach ($subcategories as $category) {
            $parentSlug = $category['parent'];
            unset($category['parent']);

            Category::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    ...$category,
                    'parent_id' => $mainIds[$parentSlug],
                    'is_primary' => false,
                ]
            );
        }
    }
}
