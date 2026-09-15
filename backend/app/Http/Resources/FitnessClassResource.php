<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FitnessClassResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'days_of_week' => $this->days_of_week ?? [],
            'starts_at' => $this->starts_at,
            'duration_minutes' => $this->duration_minutes,
            'capacity' => $this->capacity,
            // Null when the class has no capacity limit at all — distinct
            // from 0, which means genuinely fully booked.
            'spots_available' => $this->capacity !== null
                ? max(0, $this->capacity - ($this->active_bookings_count ?? 0))
                : null,
            'is_popular' => $this->is_popular,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
        ];
    }
}
