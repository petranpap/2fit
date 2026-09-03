<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'price' => 0,
                'billing_period' => 'monthly',
                'max_offers' => 1,
                'features' => ['1 active offer', 'Basic profile listing'],
            ],
            [
                'name' => 'Growth',
                'slug' => 'growth',
                'price' => 19.99,
                'billing_period' => 'monthly',
                'max_offers' => 5,
                'features' => ['5 active offers', 'Featured in category search', 'Basic stats'],
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'price' => 199.99,
                'billing_period' => 'yearly',
                'max_offers' => null,
                'features' => ['Unlimited offers', 'Priority placement', 'Advanced stats', 'Priority support'],
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
