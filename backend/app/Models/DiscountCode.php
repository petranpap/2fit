<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['offer_id', 'user_id', 'code', 'status', 'redeemed_at', 'expires_at'])]
class DiscountCode extends Model
{
    protected function casts(): array
    {
        return [
            'redeemed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Route-bound by the code string, not the numeric id — that's how a
     * business looks a code up when a customer presents it for redemption.
     */
    public function getRouteKeyName(): string
    {
        return 'code';
    }
}
