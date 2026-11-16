<?php

namespace App\Services;

use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class SearchService
{
    private const TYPE_MODELS = [
        'gym' => Gym::class,
        'trainer' => Trainer::class,
        'shop' => Shop::class,
    ];

    // type=all has no real page cursor across three tables — cap the merged
    // result instead of pretending to paginate it.
    private const ALL_TYPES_RESULT_CAP = 20;

    /**
     * @param  array{q?: string, category?: string, type?: string, lat?: float, lng?: float, radius_km?: float, sw_lat?: float, sw_lng?: float, ne_lat?: float, ne_lng?: float, per_page?: int, page?: int}  $filters
     */
    public function search(array $filters): array
    {
        $type = $filters['type'] ?? 'all';

        if ($type === 'all') {
            return $this->searchAllTypes($filters);
        }

        $paginator = $this->buildQuery(self::TYPE_MODELS[$type], $type, $filters)
            ->paginate(
                perPage: $filters['per_page'] ?? 15,
                page: $filters['page'] ?? 1,
            );

        return [
            'data' => $paginator->getCollection(),
            'meta' => $this->paginationMeta($paginator),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function searchAllTypes(array $filters): array
    {
        $perType = (int) ceil(self::ALL_TYPES_RESULT_CAP / count(self::TYPE_MODELS));

        $results = collect();

        foreach (self::TYPE_MODELS as $type => $modelClass) {
            $results = $results->merge(
                $this->buildQuery($modelClass, $type, $filters)->limit($perType)->get()
            );
        }

        $results = isset($filters['lat'], $filters['lng'])
            ? $results->sortBy('distance_km')->values()
            : $results->sortBy('name')->values();

        $limit = min($filters['per_page'] ?? self::ALL_TYPES_RESULT_CAP, self::ALL_TYPES_RESULT_CAP);

        return [
            'data' => $results->take($limit)->values(),
            'meta' => [
                'type' => 'all',
                'count' => min($results->count(), $limit),
                'note' => 'Merged top results across gym/trainer/shop — not a real page cursor. Pass type=gym|trainer|shop for proper pagination.',
            ],
        ];
    }

    /**
     * @param  class-string<Gym|Trainer|Shop>  $modelClass
     * @param  array<string, mixed>  $filters
     */
    private function buildQuery(string $modelClass, string $type, array $filters): Builder
    {
        // Pending listings (not yet approved in the Admin panel) stay out of
        // public search — that's what makes it an approval queue and not
        // just a cosmetic badge.
        $query = $modelClass::query()->with('categories')->where('is_active', true)->where('is_verified', true);

        if (! empty($filters['q'])) {
            $textColumn = $type === 'trainer' ? 'bio' : 'description';

            $query->where(function (Builder $inner) use ($filters, $textColumn) {
                $inner->where('name', 'like', "%{$filters['q']}%")
                    ->orWhere($textColumn, 'like', "%{$filters['q']}%");
            });
        }

        if (! empty($filters['category'])) {
            $category = $filters['category'];

            $query->whereHas('categories', function (Builder $inner) use ($category) {
                is_numeric($category)
                    ? $inner->where('id', $category)
                    : $inner->where('slug', $category);
            });
        }

        if (isset($filters['lat'], $filters['lng'])) {
            $query->selectRaw(
                '*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) as distance_km',
                [$filters['lat'], $filters['lng'], $filters['lat']]
            );

            if (! empty($filters['radius_km'])) {
                $query->having('distance_km', '<=', $filters['radius_km']);
            }

            $query->orderBy('distance_km');
        } elseif (isset($filters['sw_lat'], $filters['sw_lng'], $filters['ne_lat'], $filters['ne_lng'])) {
            $query->whereBetween('latitude', [$filters['sw_lat'], $filters['ne_lat']])
                ->whereBetween('longitude', [$filters['sw_lng'], $filters['ne_lng']]);
        }

        return $query;
    }

    /**
     * @return array<string, int>
     */
    private function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
