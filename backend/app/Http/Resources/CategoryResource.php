<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'icon' => $this->icon,
            // Only present when the query eager-loads the counts (index());
            // omitted elsewhere rather than reporting a misleading zero.
            'listings_count' => $this->when(
                $this->gyms_count !== null,
                fn () => $this->gyms_count + $this->trainers_count + $this->shops_count,
            ),
        ];
    }
}
