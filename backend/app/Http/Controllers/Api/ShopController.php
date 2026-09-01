<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesListingOwnership;
use App\Http\Controllers\Controller;
use App\Http\Requests\UploadImageRequest;
use App\Http\Resources\ShopDetailResource;
use App\Models\Shop;
use App\Services\MediaUploadService;
use Illuminate\Http\JsonResponse;

class ShopController extends Controller
{
    use AuthorizesListingOwnership;

    public function __construct(private readonly MediaUploadService $mediaUploadService)
    {
        //
    }

    public function show(Shop $shop): JsonResponse
    {
        abort_unless($shop->is_active, 404);

        $shop->load('categories')->loadCount('reviews')->loadAvg('reviews', 'rating');

        return response()->json([
            'data' => new ShopDetailResource($shop),
        ]);
    }

    public function uploadLogo(UploadImageRequest $request, Shop $shop): JsonResponse
    {
        $this->authorizeOwner($request, $shop);

        $shop->update([
            'logo_path' => $this->mediaUploadService->store($request->file('image'), 'shops/logos'),
        ]);

        return response()->json(['data' => new ShopDetailResource($shop)]);
    }

    public function uploadCover(UploadImageRequest $request, Shop $shop): JsonResponse
    {
        $this->authorizeOwner($request, $shop);

        $shop->update([
            'cover_image_path' => $this->mediaUploadService->store($request->file('image'), 'shops/covers'),
        ]);

        return response()->json(['data' => new ShopDetailResource($shop)]);
    }
}
