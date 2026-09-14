<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['user_id', 'bookable_id', 'bookable_type', 'fitness_class_id', 'status', 'scheduled_at', 'notes'])]
class Booking extends Model
{
    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookable(): MorphTo
    {
        return $this->morphTo();
    }

    public function fitnessClass(): BelongsTo
    {
        return $this->belongsTo(FitnessClass::class);
    }
}
