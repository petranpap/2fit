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
        $offerable = app(OfferService::class)->resolveOwnListing($user);

        if (! $offerable) {
            return [
                Stat::make(__('partner.stats.get_started'), __('partner.stats.create_profile'))
                    ->description(__('partner.stats.menu_hint')),
            ];
        }

        $offerIds = Offer::whereHasMorph(
            'offerable',
            [Gym::class, Trainer::class, Shop::class],
            fn (Builder $query) => $query->where('user_id', $user->id),
        )->pluck('id');

        $codes = DiscountCode::whereIn('offer_id', $offerIds);
        $pendingBookings = $offerable->bookings()->where('status', 'pending')->count();

        return [
            Stat::make(__('partner.stats.active_offers'), Offer::whereIn('id', $offerIds)->where('is_active', true)->count()),
            Stat::make(__('partner.stats.codes_claimed'), (clone $codes)->count()),
            Stat::make(__('partner.stats.codes_redeemed'), (clone $codes)->where('status', 'redeemed')->count()),
            Stat::make(__('partner.stats.pending_bookings'), $pendingBookings)
                ->color($pendingBookings > 0 ? 'warning' : null),
            Stat::make(__('partner.stats.reviews'), $offerable->reviews()->count())
                ->description(
                    $offerable->reviews()->count() > 0
                        ? round($offerable->reviews()->avg('rating'), 1).' '.__('partner.stats.avg_rating')
                        : __('partner.stats.no_reviews')
                ),
        ];
    }
}
