<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'price', 'billing_period', 'max_offers', 'features', 'is_active'])]
class SubscriptionPlan extends Model
{
    protected function casts(): array
    {
        return [
            'features' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function gyms(): HasMany
    {
        return $this->hasMany(Gym::class);
    }

    public function trainers(): HasMany
    {
        return $this->hasMany(Trainer::class);
    }

    public function shops(): HasMany
    {
        return $this->hasMany(Shop::class);
    }
}
