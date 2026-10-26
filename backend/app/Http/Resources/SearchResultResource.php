<?php

namespace App\Http\Resources;

use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Normalizes Gym/Trainer/Shop into one shape for the merged search response.
 */
class SearchResultResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // $this instanceof Trainer would check the Resource wrapper itself,
        // not the model it wraps — always false, which silently dropped
        // every trainer's photo/bio in search results. $this->resource is
        // the actual Gym/Trainer/Shop (same object resolveType() checks).
        $isTrainer = $this->resource instanceof Trainer;

        // The venue photo (cover_image), not the small brand logo — a card
        // or map pin preview wants the place, not its badge. Trainers only
        // ever have a profile photo.
        $imagePath = $isTrainer ? $this->photo_path : ($this->cover_image_path ?? $this->logo_path);

        return [
            'id' => $this->id,
            'type' => $this->resolveType(),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $isTrainer ? $this->bio : $this->description,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'distance_km' => $this->distance_km !== null ? round((float) $this->distance_km, 2) : null,
            'image_url' => MediaUrl::resolve($imagePath),
            'is_verified' => $this->is_verified,
            'is_favorited' => $request->user('sanctum')
                ? $this->favorites()->where('user_id', $request->user('sanctum')->id)->exists()
                : false,
            'rating_avg' => $this->reviews_avg_rating !== null ? round((float) $this->reviews_avg_rating, 1) : null,
            'reviews_count' => $this->reviews_count ?? 0,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
        ];
    }

    private function resolveType(): string
    {
        return match (true) {
            $this->resource instanceof Gym => 'gym',
            $this->resource instanceof Trainer => 'trainer',
            $this->resource instanceof Shop => 'shop',
            default => 'unknown',
        };
    }
}
