<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
            'photo_url' => $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null,
            'hourly_rate' => $this->hourly_rate,
            'is_verified' => $this->is_verified,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'reviews_count' => $this->reviews_count ?? 0,
            'rating_avg' => $this->reviews_avg_rating !== null ? round((float) $this->reviews_avg_rating, 1) : null,
        ];
    }
}
