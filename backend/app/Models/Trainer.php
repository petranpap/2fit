<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

#[Fillable([
    'user_id', 'subscription_plan_id', 'name', 'slug', 'bio', 'address',
    'latitude', 'longitude', 'phone', 'email', 'photo_path', 'hourly_rate',
    'is_verified', 'is_active', 'spoken_languages', 'gym_education',
    'gym_training', 'qualification_declaration',
])]
class Trainer extends Model
{
    protected function casts(): array
    {
        return [
            'spoken_languages' => 'array',
            'qualification_declaration' => 'boolean',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'hourly_rate' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    public function categories(): MorphToMany
    {
        return $this->morphToMany(Category::class, 'categorizable');
    }

    public function offers(): MorphMany
    {
        return $this->morphMany(Offer::class, 'offerable');
    }

    public function fitnessClasses(): MorphMany
    {
        return $this->morphMany(FitnessClass::class, 'classable');
    }

    public function bookings(): MorphMany
    {
        return $this->morphMany(Booking::class, 'bookable');
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function favorites(): MorphMany
    {
        return $this->morphMany(Favorite::class, 'favoritable');
    }

    public function statistics(): MorphMany
    {
        return $this->morphMany(Statistic::class, 'statable');
    }
}
