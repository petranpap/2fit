<?php

namespace App\Http\Resources;

use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'created_at' => $this->created_at,
            'user' => [
                'id' => $this->user_id,
                'name' => $this->whenLoaded('user', fn () => $this->user->name),
            ],
            // Only present on "my reviews" (where reviewable is eager
            // loaded) — a single place's own review list has no need to
            // repeat which place every review belongs to.
            'reviewable' => $this->whenLoaded('reviewable', fn () => $this->reviewable ? [
                'type' => $this->resolveReviewableType(),
                'id' => $this->reviewable_id,
                'name' => $this->reviewable->name,
            ] : null),
        ];
    }

    private function resolveReviewableType(): string
    {
        return match (true) {
            $this->reviewable instanceof Gym => 'gym',
            $this->reviewable instanceof Trainer => 'trainer',
            $this->reviewable instanceof Shop => 'shop',
            default => 'unknown',
        };
    }
}
