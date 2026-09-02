<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'classable_id', 'classable_type', 'name', 'day_of_week', 'starts_at',
    'duration_minutes', 'capacity', 'is_popular', 'is_active',
])]
class FitnessClass extends Model
{
    protected function casts(): array
    {
        return [
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
}
