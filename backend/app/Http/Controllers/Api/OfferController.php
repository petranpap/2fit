<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesListingOwnership;
use App\Http\Controllers\Controller;
use App\Http\Requests\Offer\StoreOfferRequest;
use App\Http\Requests\Offer\UpdateOfferRequest;
use App\Http\Resources\DiscountCodeResource;
use App\Http\Resources\OfferResource;
use App\Models\Gym;
use App\Models\Offer;
use App\Models\Shop;
use App\Models\Trainer;
use App\Services\OfferService;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    use AuthorizesListingOwnership;

    public function __construct(
        private readonly OfferService $offerService,
        private readonly QrCodeService $qrCodeService,
    ) {
        //
    }

    public function index(Request $request): JsonResponse
    {
        $offers = Offer::query()
            ->with('offerable')
            ->active()
            ->when($request->query('type'), fn ($query, $type) => $query->whereHasMorph(
                'offerable',
                match ($type) {
                    'gym' => [Gym::class],
                    'trainer' => [Trainer::class],
                    'shop' => [Shop::class],
                    default => [],
                }
            ))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => OfferResource::collection($offers->items()),
            'meta' => [
                'current_page' => $offers->currentPage(),
                'last_page' => $offers->lastPage(),
                'per_page' => $offers->perPage(),
                'total' => $offers->total(),
            ],
        ]);
    }

    public function show(Offer $offer): JsonResponse
    {
        $offer->load('offerable');

        return response()->json(['data' => new OfferResource($offer)]);
    }

    public function store(StoreOfferRequest $request): JsonResponse
    {
        $offerable = $this->offerService->resolveOfferable(
            $request->validated('offerable_type'),
            $request->validated('offerable_id'),
        );

        $this->authorizeOwner($request, $offerable);

        // is_active isn't in the store validation (it's a create-time
        // concern, not caller input) — default it explicitly rather than
        // relying on the DB column default, which Eloquent won't reflect on
        // the in-memory instance returned by create() until it's reloaded.
        $offer = $offerable->offers()->create([
            ...$request->safe()->except(['offerable_type', 'offerable_id']),
            'is_active' => true,
        ]);

        return response()->json(['data' => new OfferResource($offer->load('offerable'))], 201);
    }

    public function update(UpdateOfferRequest $request, Offer $offer): JsonResponse
    {
        $this->authorizeOwner($request, $offer->offerable);

        $offer->update($request->validated());

        return response()->json(['data' => new OfferResource($offer->load('offerable'))]);
    }

    public function destroy(Request $request, Offer $offer): JsonResponse
    {
        $this->authorizeOwner($request, $offer->offerable);

        $offer->delete();

        return response()->json(null, 204);
    }

    public function claim(Request $request, Offer $offer): JsonResponse
    {
        abort_unless($offer->isCurrentlyActive(), 422, 'This offer is not currently active.');

        $discountCode = $this->offerService->claim($offer, $request->user());
        $discountCode->qr_svg = $this->qrCodeService->generateSvg($discountCode->code);

        return response()->json([
            'data' => new DiscountCodeResource($discountCode->load('offer.offerable')),
        ], 201);
    }
}
