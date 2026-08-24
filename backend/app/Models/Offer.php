<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'offerable_id', 'offerable_type', 'title', 'description', 'discount_type',
    'discount_value', 'image_path', 'starts_at', 'expires_at', 'is_active',
])]
class Offer extends Model
{
    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function offerable(): MorphTo
    {
        return $this->morphTo();
    }

    public function discountCodes(): HasMany
    {
        return $this->hasMany(DiscountCode::class);
    }
}
