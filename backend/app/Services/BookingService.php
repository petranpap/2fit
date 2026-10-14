<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\FitnessClass;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
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
     *
     * @throws ValidationException
     */
    public function create(Gym|Trainer|Shop $bookable, User $user, array $data): Booking
    {
        $fitnessClassId = $data['fitness_class_id'] ?? null;

        if (! $fitnessClassId) {
            return $bookable->bookings()->create([
                'user_id' => $user->id,
                'fitness_class_id' => null,
                'status' => 'pending',
                'scheduled_at' => $data['scheduled_at'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);
        }

        // A class has a fixed number of seats — lock its row for the
        // duration of the count-then-insert so two simultaneous bookings
        // for the last spot can't both succeed.
        return DB::transaction(function () use ($bookable, $user, $data, $fitnessClassId) {
            $fitnessClass = FitnessClass::whereKey($fitnessClassId)->lockForUpdate()->firstOrFail();

            if ($fitnessClass->capacity !== null) {
                $activeBookings = $fitnessClass->bookings()
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->count();

                if ($activeBookings >= $fitnessClass->capacity) {
                    throw ValidationException::withMessages([
                        'fitness_class_id' => ['This class is fully booked.'],
                    ]);
                }
            }

            return $bookable->bookings()->create([
                'user_id' => $user->id,
                'fitness_class_id' => $fitnessClassId,
                'status' => 'pending',
                'scheduled_at' => $data['scheduled_at'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);
        });
    }

    /**
     * Cancelling ("resigning") frees the seat automatically — spots_available
     * is computed from active (pending/confirmed) bookings, not a stored
     * counter, so there's nothing else to reconcile here.
     *
     * @throws ValidationException
     */
    public function cancel(Booking $booking): Booking
    {
        if ($booking->status === 'cancelled') {
            throw ValidationException::withMessages([
                'booking' => ['This booking is already cancelled.'],
            ]);
        }

        $booking->update(['status' => 'cancelled']);

        return $booking;
    }
}
