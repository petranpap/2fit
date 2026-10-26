<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ToggleFavoriteRequest;
use App\Http\Resources\SearchResultResource;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FavoriteController extends Controller
{
    private const FAVORITABLE_MODELS = [
        'gym' => Gym::class,
        'trainer' => Trainer::class,
        'shop' => Shop::class,
    ];

    /**
     * The current user's favorited gyms/trainers/shops — backs the
     * Favorites tab's "saved places" section, normalized into the same
     * shape as search results (ratings, photo, categories included).
     */
    public function mine(Request $request): JsonResponse
    {
        $favoritesByType = $request->user()->favorites()->get()->groupBy('favoritable_type');

        $places = collect();

        foreach (self::FAVORITABLE_MODELS as $modelClass) {
            $ids = $favoritesByType->get($modelClass, collect())->pluck('favoritable_id');

            if ($ids->isEmpty()) {
                continue;
            }

            $places = $places->merge(
                $modelClass::query()
                    ->whereIn('id', $ids)
                    ->with('categories')
                    ->withAvg('reviews', 'rating')
                    ->withCount('reviews')
                    ->get()
            );
        }

        return response()->json(['data' => SearchResultResource::collection($places)]);
    }

    /**
     * One button, one call: favoriting an already-favorited listing
     * unfavorites it instead of erroring on a duplicate.
     */
    public function toggle(ToggleFavoriteRequest $request): JsonResponse
    {
        $modelClass = self::FAVORITABLE_MODELS[$request->validated('favoritable_type')];
        $favoritable = $modelClass::find($request->validated('favoritable_id'));

        if (! $favoritable) {
            throw ValidationException::withMessages([
                'favoritable_id' => ['The selected listing does not exist.'],
            ]);
        }

        $existing = $request->user()->favorites()
            ->where('favoritable_type', $modelClass)
            ->where('favoritable_id', $favoritable->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['data' => ['favorited' => false]]);
        }

        $request->user()->favorites()->create([
            'favoritable_type' => $modelClass,
            'favoritable_id' => $favoritable->id,
        ]);

        return response()->json(['data' => ['favorited' => true]], 201);
    }
}
