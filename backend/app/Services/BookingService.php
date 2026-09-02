<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class BookingService
{
    private const BOOKABLE_MODELS = [
        'gym' => Gym::class,
        'trainer' => Trainer::class,
        'shop' => Shop::class,
    ];

    /**
     * @throws ValidationException
     */
    public function resolveBookable(string $type, int $id): Gym|Trainer|Shop
    {
        $modelClass = self::BOOKABLE_MODELS[$type] ?? null;

        $bookable = $modelClass ? $modelClass::find($id) : null;

        if (! $bookable) {
            throw ValidationException::withMessages([
                'bookable_id' => ['The selected listing does not exist.'],
            ]);
        }

        return $bookable;
    }

    /**
     * @param  array{fitness_class_id?: int, scheduled_at?: string, notes?: string}  $data
     */
    public function create(Gym|Trainer|Shop $bookable, User $user, array $data): Booking
    {
        return $bookable->bookings()->create([
            'user_id' => $user->id,
            'fitness_class_id' => $data['fitness_class_id'] ?? null,
            'status' => 'pending',
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
    }
}
