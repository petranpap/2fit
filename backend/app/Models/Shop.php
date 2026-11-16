<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

#[Fillable([
    'user_id', 'subscription_plan_id', 'name', 'slug', 'description', 'address',
    'latitude', 'longitude', 'phone', 'email', 'website', 'logo_path',
    'cover_image_path', 'opening_hours', 'is_verified', 'is_active',
])]
class Shop extends Model
{
    protected function casts(): array
    {
        return [
            'opening_hours' => 'array',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
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

    public function facilities(): MorphToMany
    {
        return $this->morphToMany(Facility::class, 'facilitatable');
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

    public function statistics(): MorphMany
    {
        return $this->morphMany(Statistic::class, 'statable');
    }
}
