<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Gym;
use App\Models\Review;
use App\Models\Shop;
use App\Models\Trainer;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AdminStatsWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $pendingGyms = Gym::where('is_verified', false)->count();
        $pendingTrainers = Trainer::where('is_verified', false)->count();
        $pendingShops = Shop::where('is_verified', false)->count();
        $pendingTotal = $pendingGyms + $pendingTrainers + $pendingShops;

        return [
            Stat::make('Pending approval', $pendingTotal)
                ->description("{$pendingGyms} gyms · {$pendingTrainers} trainers · {$pendingShops} shops")
                ->color($pendingTotal > 0 ? 'warning' : null),
            Stat::make('Verified listings', Gym::where('is_verified', true)->count()
                + Trainer::where('is_verified', true)->count()
                + Shop::where('is_verified', true)->count()),
            Stat::make('Reviews', Review::count())
                ->description(Review::where('rating', '<=', 2)->count().' low-rated'),
        ];
    }
}
