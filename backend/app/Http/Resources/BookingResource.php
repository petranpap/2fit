<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at,
            'notes' => $this->notes,
            'fitness_class' => new FitnessClassResource($this->whenLoaded('fitnessClass')),
            'bookable' => $this->whenLoaded('bookable', fn () => [
                'type' => strtolower(class_basename($this->bookable_type)),
                'id' => $this->bookable->id,
                'name' => $this->bookable->name,
                'slug' => $this->bookable->slug,
            ]),
        ];
    }
}
