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
            'day_of_week' => $this->day_of_week,
            'starts_at' => $this->starts_at,
            'duration_minutes' => $this->duration_minutes,
            'capacity' => $this->capacity,
            'is_popular' => $this->is_popular,
        ];
    }
}
