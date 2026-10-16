<?php

namespace App\Http\Resources;

use App\Support\MediaUrl;
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
            'image_url' => MediaUrl::resolve($this->image_url),
            'is_primary' => $this->is_primary,
            'has_children' => $this->when(
                $this->relationLoaded('children'),
                fn () => $this->children->isNotEmpty(),
            ),
            // Only present when the query eager-loads the counts (index());
            // omitted elsewhere rather than reporting a misleading zero.
            // For a main category (children loaded), this rolls up each
            // child's count too — a listing is tagged with "CrossFit", never
            // directly with "Gyms", so the parent's own tally alone would
            // always read zero otherwise.
            'listings_count' => $this->when(
                $this->gyms_count !== null,
                function () {
                    $own = $this->gyms_count + $this->trainers_count + $this->shops_count;

                    $childrenTotal = $this->relationLoaded('children')
                        ? $this->children->sum(fn ($child) => $child->gyms_count + $child->trainers_count + $child->shops_count)
                        : 0;

                    return $own + $childrenTotal;
                },
            ),
        ];
    }
}
