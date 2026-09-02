<?php

namespace App\Services;

use App\Models\DiscountCode;
use App\Models\Gym;
use App\Models\Offer;
use App\Models\Shop;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OfferService
{
    private const OFFERABLE_MODELS = [
        'gym' => Gym::class,
        'trainer' => Trainer::class,
        'shop' => Shop::class,
    ];

    /**
     * @throws ValidationException
     */
    public function resolveOfferable(string $type, int $id): Gym|Trainer|Shop
    {
        $modelClass = self::OFFERABLE_MODELS[$type] ?? null;

        $offerable = $modelClass ? $modelClass::find($id) : null;

        if (! $offerable) {
            throw ValidationException::withMessages([
                'offerable_id' => ['The selected listing does not exist.'],
            ]);
        }

        return $offerable;
    }

    /**
     * Idempotent: a user who already holds an active code for this offer
     * gets that same code back instead of accumulating duplicates.
     */
    public function claim(Offer $offer, User $user): DiscountCode
    {
        $existing = $offer->discountCodes()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if ($existing) {
            return $existing;
        }

        return $offer->discountCodes()->create([
            'user_id' => $user->id,
            'code' => $this->generateUniqueCode(),
            'status' => 'active',
            'expires_at' => $offer->expires_at,
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function redeem(DiscountCode $discountCode): void
    {
        if ($discountCode->status === 'redeemed') {
            throw ValidationException::withMessages([
                'code' => ['This code has already been redeemed.'],
            ]);
        }

        if ($discountCode->status === 'expired' || ($discountCode->expires_at && $discountCode->expires_at->isPast())) {
            $discountCode->update(['status' => 'expired']);

            throw ValidationException::withMessages([
                'code' => ['This code has expired.'],
            ]);
        }

        $discountCode->update([
            'status' => 'redeemed',
            'redeemed_at' => Carbon::now(),
        ]);
    }

    private function generateUniqueCode(): string
    {
        do {
            $code = 'FIT-'.Str::upper(Str::random(8));
        } while (DiscountCode::where('code', $code)->exists());

        return $code;
    }
}
