<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesListingOwnership;
use App\Http\Controllers\Controller;
use App\Http\Requests\UploadImageRequest;
use App\Http\Resources\GymDetailResource;
use App\Models\Gym;
use App\Services\MediaUploadService;
use Illuminate\Http\JsonResponse;

class GymController extends Controller
{
    use AuthorizesListingOwnership;

    public function __construct(private readonly MediaUploadService $mediaUploadService)
    {
        //
    }

    public function show(Gym $gym): JsonResponse
    {
        abort_unless($gym->is_active && $gym->is_verified, 404);

        $gym->load(['categories', 'facilities', 'fitnessClasses' => fn ($query) => $query->where('is_active', true)])
            ->loadCount('reviews')
            ->loadAvg('reviews', 'rating');

        return response()->json([
            'data' => new GymDetailResource($gym),
        ]);
    }

    public function uploadLogo(UploadImageRequest $request, Gym $gym): JsonResponse
    {
        $this->authorizeOwner($request, $gym);

        $gym->update([
            'logo_path' => $this->mediaUploadService->store($request->file('image'), 'gyms/logos'),
        ]);

        return response()->json(['data' => new GymDetailResource($gym)]);
    }

    public function uploadCover(UploadImageRequest $request, Gym $gym): JsonResponse
    {
        $this->authorizeOwner($request, $gym);

        $gym->update([
            'cover_image_path' => $this->mediaUploadService->store($request->file('image'), 'gyms/covers'),
        ]);

        return response()->json(['data' => new GymDetailResource($gym)]);
    }
}
