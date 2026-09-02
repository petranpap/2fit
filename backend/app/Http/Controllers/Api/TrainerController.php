<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\AuthorizesListingOwnership;
use App\Http\Controllers\Controller;
use App\Http\Requests\UploadImageRequest;
use App\Http\Resources\TrainerDetailResource;
use App\Models\Trainer;
use App\Services\MediaUploadService;
use Illuminate\Http\JsonResponse;

class TrainerController extends Controller
{
    use AuthorizesListingOwnership;

    public function __construct(private readonly MediaUploadService $mediaUploadService)
    {
        //
    }

    public function show(Trainer $trainer): JsonResponse
    {
        abort_unless($trainer->is_active, 404);

        $trainer->load(['categories', 'fitnessClasses' => fn ($query) => $query->where('is_active', true)])
            ->loadCount('reviews')
            ->loadAvg('reviews', 'rating');

        return response()->json([
            'data' => new TrainerDetailResource($trainer),
        ]);
    }

    public function uploadPhoto(UploadImageRequest $request, Trainer $trainer): JsonResponse
    {
        $this->authorizeOwner($request, $trainer);

        $trainer->update([
            'photo_path' => $this->mediaUploadService->store($request->file('image'), 'trainers/photos'),
        ]);

        return response()->json(['data' => new TrainerDetailResource($trainer)]);
    }
}
