<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Gym;
use App\Models\Review;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    private const REVIEWABLE_MODELS = [
        'gym' => Gym::class,
        'trainer' => Trainer::class,
        'shop' => Shop::class,
    ];

    /**
     * Public: every review for one gym/trainer/shop — backs the detail
     * screen's review list.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:gym,trainer,shop'],
            'id' => ['required', 'integer'],
        ]);

        $reviews = Review::query()
            ->where('reviewable_type', self::REVIEWABLE_MODELS[$validated['type']])
            ->where('reviewable_id', $validated['id'])
            ->with('user')
            ->latest()
            ->get();

        return response()->json(['data' => ReviewResource::collection($reviews)]);
    }

    /**
     * The current user's own reviews, across every type — backs the
     * Profile "My reviews" screen.
     */
    public function mine(Request $request): JsonResponse
    {
        $reviews = $request->user()->reviews()->with('reviewable')->latest()->get();

        return response()->json(['data' => ReviewResource::collection($reviews)]);
    }

    /**
     * One review per user per listing: submitting again (e.g. after
     * changing their mind) updates the existing review instead of creating
     * a duplicate.
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $modelClass = self::REVIEWABLE_MODELS[$request->validated('reviewable_type')];
        $reviewable = $modelClass::find($request->validated('reviewable_id'));

        if (! $reviewable) {
            throw ValidationException::withMessages([
                'reviewable_id' => ['The selected listing does not exist.'],
            ]);
        }

        $review = Review::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'reviewable_type' => $modelClass,
                'reviewable_id' => $reviewable->id,
            ],
            $request->safe()->only(['rating', 'comment'])
        );

        return response()->json(['data' => new ReviewResource($review->load('user'))], 201);
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        abort_unless($review->user_id === $request->user()->id, 403);

        $review->delete();

        return response()->json(null, 204);
    }
}
