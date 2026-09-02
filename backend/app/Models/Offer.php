<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

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

    /**
     * Live offers: flagged active, already started (or no start set), and
     * not yet expired (or no expiry set).
     */
    public function scopeActive(Builder $query): Builder
    {
        $now = Carbon::now();

        return $query->where('is_active', true)
            ->where(fn (Builder $q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', $now));
    }

    public function isCurrentlyActive(): bool
    {
        $now = Carbon::now();

        return $this->is_active
            && ($this->starts_at === null || $this->starts_at->lte($now))
            && ($this->expires_at === null || $this->expires_at->gte($now));
    }
}
