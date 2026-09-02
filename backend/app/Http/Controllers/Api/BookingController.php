<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(private readonly BookingService $bookingService)
    {
        //
    }

    public function mine(Request $request): JsonResponse
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['bookable', 'fitnessClass'])
            ->latest()
            ->get();

        return response()->json(['data' => BookingResource::collection($bookings)]);
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $bookable = $this->bookingService->resolveBookable(
            $request->validated('bookable_type'),
            $request->validated('bookable_id'),
        );

        $booking = $this->bookingService->create($bookable, $request->user(), $request->safe()->only([
            'fitness_class_id', 'scheduled_at', 'notes',
        ]));

        return response()->json([
            'data' => new BookingResource($booking->load(['bookable', 'fitnessClass'])),
        ], 201);
    }
}
