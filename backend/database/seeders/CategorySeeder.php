<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Γυμναστήριο', 'slug' => 'gym', 'icon' => 'dumbbell'],
            ['name' => 'CrossFit', 'slug' => 'crossfit', 'icon' => 'kettlebell'],
            ['name' => 'Προσωπική Προπόνηση', 'slug' => 'personal-training', 'icon' => 'user-check'],
            ['name' => 'Yoga & Pilates', 'slug' => 'yoga-pilates', 'icon' => 'yoga'],
            ['name' => 'Αθλητικά Είδη', 'slug' => 'sportswear', 'icon' => 'shirt'],
            ['name' => 'Συμπληρώματα Διατροφής', 'slug' => 'supplements', 'icon' => 'flask'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
