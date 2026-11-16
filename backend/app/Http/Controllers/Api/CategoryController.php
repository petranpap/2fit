<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Top-level categories by default. `?primary=1` scopes to just the ones
     * meant for the app's main quick-browse row (Home icons, Explore's "Top
     * Categories") — eager-loading children (with their own counts) so each
     * main category's listings_count can roll its children's up into one
     * number, since listings are tagged with the subcategory, never the
     * parent directly.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::withCount(['gyms', 'trainers', 'shops'])->whereNull('parent_id');

        if ($request->boolean('primary')) {
            $query->where('is_primary', true)
                ->with(['children' => fn ($children) => $children->withCount(['gyms', 'trainers', 'shops'])]);
        } else {
            $query->with('children');
        }

        $categories = $query->orderBy('name')->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Subcategories of one main category — what Explore's drill-down screen
     * shows after tapping a main category tile.
     */
    public function children(Category $category): JsonResponse
    {
        $children = $category->children()
            ->withCount(['gyms', 'trainers', 'shops'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => CategoryResource::collection($children),
        ]);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'data' => new CategoryResource($category),
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json([
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json([
            'data' => new CategoryResource($category),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(null, 204);
    }
}
