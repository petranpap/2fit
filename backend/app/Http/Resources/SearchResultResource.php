<?php

namespace App\Http\Resources;

use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
        $imagePath = $this instanceof Trainer ? $this->photo_path : $this->logo_path;

        return [
            'id' => $this->id,
            'type' => $this->resolveType(),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this instanceof Trainer ? $this->bio : $this->description,
            'address' => $this->address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'distance_km' => $this->distance_km !== null ? round((float) $this->distance_km, 2) : null,
            'image_url' => $imagePath ? Storage::disk('public')->url($imagePath) : null,
            'is_verified' => $this->is_verified,
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
