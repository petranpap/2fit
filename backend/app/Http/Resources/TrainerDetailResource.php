<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => 'trainer',
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->bio,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'phone' => $this->phone,
            'email' => $this->email,
            'photo_url' => MediaUrl::resolve($this->photo_path),
            'hourly_rate' => $this->hourly_rate,
            'is_verified' => $this->is_verified,
            'is_favorited' => $request->user('sanctum')
                ? $this->favorites()->where('user_id', $request->user('sanctum')->id)->exists()
                : false,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'fitness_classes' => FitnessClassResource::collection(
                $this->whenLoaded('fitnessClasses', fn () => $this->fitnessClasses->sortByDesc('is_popular')->values())
            ),
            'reviews_count' => $this->reviews_count ?? 0,
            'rating_avg' => $this->reviews_avg_rating !== null ? round((float) $this->reviews_avg_rating, 1) : null,
        ];
    }
}
