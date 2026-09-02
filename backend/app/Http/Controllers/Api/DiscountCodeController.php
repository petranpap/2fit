<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesListingOwnership;
use App\Http\Controllers\Controller;
use App\Http\Resources\DiscountCodeResource;
use App\Models\DiscountCode;
use App\Services\OfferService;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscountCodeController extends Controller
{
    use AuthorizesListingOwnership;

    public function __construct(
        private readonly OfferService $offerService,
        private readonly QrCodeService $qrCodeService,
    ) {
        //
    }

    /**
     * The current user's claimed codes — backs the mobile "Saved Deals" screen.
     */
    public function mine(Request $request): JsonResponse
    {
        $codes = $request->user()
            ->discountCodes()
            ->with('offer.offerable')
            ->latest()
            ->get();

        return response()->json(['data' => DiscountCodeResource::collection($codes)]);
    }

    public function show(Request $request, DiscountCode $discountCode): JsonResponse
    {
        abort_unless($discountCode->user_id === $request->user()->id, 403);

        $discountCode->qr_svg = $this->qrCodeService->generateSvg($discountCode->code);

        return response()->json([
            'data' => new DiscountCodeResource($discountCode->load('offer.offerable')),
        ]);
    }

    /**
     * A business redeems a code a customer presents in person — only the
     * offer's own listing owner (or an admin) may do this.
     */
    public function redeem(Request $request, DiscountCode $discountCode): JsonResponse
    {
        $discountCode->loadMissing('offer.offerable');

        $this->authorizeOwner($request, $discountCode->offer->offerable);

        $this->offerService->redeem($discountCode);

        return response()->json(['data' => new DiscountCodeResource($discountCode->fresh('offer.offerable'))]);
    }
}
