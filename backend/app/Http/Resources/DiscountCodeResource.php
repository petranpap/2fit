<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscountCodeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'status' => $this->status,
            'redeemed_at' => $this->redeemed_at,
            'expires_at' => $this->expires_at,
            // Set on the model instance by the controller (QrCodeService)
            // only where it's actually needed — claiming a code, or viewing
            // one to present at redemption — never on a plain list, so a
            // "my saved deals" listing doesn't render an SVG per row.
            'qr_svg' => $this->qr_svg,
            'offer' => new OfferResource($this->whenLoaded('offer')),
        ];
    }
}
