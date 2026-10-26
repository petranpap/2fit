<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GymDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => 'gym',
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'logo_url' => MediaUrl::resolve($this->logo_path),
            'cover_image_url' => MediaUrl::resolve($this->cover_image_path),
            'opening_hours' => $this->opening_hours,
            'is_verified' => $this->is_verified,
            'is_favorited' => $request->user('sanctum')
                ? $this->favorites()->where('user_id', $request->user('sanctum')->id)->exists()
                : false,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'facilities' => FacilityResource::collection($this->whenLoaded('facilities')),
            // Owner-curated highlights first, then the rest — matches the
            // "Popular Classes" section on the profile screen.
            'fitness_classes' => FitnessClassResource::collection(
                $this->whenLoaded('fitnessClasses', fn () => $this->fitnessClasses->sortByDesc('is_popular')->values())
            ),
            'reviews_count' => $this->reviews_count ?? 0,
            'rating_avg' => $this->reviews_avg_rating !== null ? round((float) $this->reviews_avg_rating, 1) : null,
        ];
    }
}
