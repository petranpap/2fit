<?php

namespace App\Filament\Partner\Widgets;

use App\Models\DiscountCode;
use App\Models\Gym;
use App\Models\Offer;
use App\Models\Shop;
use App\Models\Trainer;
use App\Services\OfferService;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Builder;

class PartnerStatsWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $user = auth()->user();
        $offerable = app(OfferService::class)->resolveOwnOfferable($user);

        if (! $offerable) {
            return [
                Stat::make('Get started', 'Create your business profile')
                    ->description('Use the menu on the left to add your listing'),
            ];
        }

        $offerIds = Offer::whereHasMorph(
            'offerable',
            [Gym::class, Trainer::class, Shop::class],
            fn (Builder $query) => $query->where('user_id', $user->id),
        )->pluck('id');

        $codes = DiscountCode::whereIn('offer_id', $offerIds);

        return [
            Stat::make('Active offers', Offer::whereIn('id', $offerIds)->where('is_active', true)->count()),
            Stat::make('Codes claimed', (clone $codes)->count()),
            Stat::make('Codes redeemed', (clone $codes)->where('status', 'redeemed')->count()),
            Stat::make('Reviews', $offerable->reviews()->count())
                ->description(
                    $offerable->reviews()->count() > 0
                        ? round($offerable->reviews()->avg('rating'), 1).' avg rating'
                        : 'No reviews yet'
                ),
        ];
    }
}
