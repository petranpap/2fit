<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

#[Fillable([
    'classable_id', 'classable_type', 'name', 'recurrence_type', 'days_of_week',
    'starts_on', 'recurrence_months', 'starts_at', 'duration_minutes', 'capacity',
    'is_popular', 'is_active',
])]
class FitnessClass extends Model
{
    protected function casts(): array
    {
        return [
            'days_of_week' => 'array',
            'starts_on' => 'date',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function classable(): MorphTo
    {
        return $this->morphTo();
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function categories(): MorphToMany
    {
        return $this->morphToMany(Category::class, 'categorizable');
    }
}
