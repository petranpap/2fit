<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ShopDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => 'shop',
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'logo_url' => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null,
            'cover_image_url' => $this->cover_image_path ? Storage::disk('public')->url($this->cover_image_path) : null,
            'opening_hours' => $this->opening_hours,
            'is_verified' => $this->is_verified,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'facilities' => FacilityResource::collection($this->whenLoaded('facilities')),
            'fitness_classes' => FitnessClassResource::collection(
                $this->whenLoaded('fitnessClasses', fn () => $this->fitnessClasses->sortByDesc('is_popular')->values())
            ),
            'reviews_count' => $this->reviews_count ?? 0,
            'rating_avg' => $this->reviews_avg_rating !== null ? round((float) $this->reviews_avg_rating, 1) : null,
        ];
    }
}
