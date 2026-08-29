<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchRequest;
use App\Http\Resources\SearchResultResource;
use App\Services\SearchService;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function __construct(private readonly SearchService $searchService)
    {
        //
    }

    public function __invoke(SearchRequest $request): JsonResponse
    {
        $result = $this->searchService->search($request->validated());

        return response()->json([
            'data' => SearchResultResource::collection($result['data']),
            'meta' => $result['meta'],
        ]);
    }
}
