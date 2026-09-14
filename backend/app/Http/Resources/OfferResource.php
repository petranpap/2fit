<?php

namespace App\Http\Resources;

use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class OfferResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'discount_type' => $this->discount_type,
            'discount_value' => $this->discount_value,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'starts_at' => $this->starts_at,
            'expires_at' => $this->expires_at,
            'is_active' => $this->isCurrentlyActive(),
            'offerable' => $this->whenLoaded('offerable', fn () => [
                'type' => $this->resolveOfferableType(),
                'id' => $this->offerable->id,
                'name' => $this->offerable->name,
                'slug' => $this->offerable->slug,
            ]),
        ];
    }

    private function resolveOfferableType(): string
    {
        return match ($this->offerable_type) {
            Gym::class => 'gym',
            Trainer::class => 'trainer',
            Shop::class => 'shop',
            default => 'unknown',
        };
    }
}
