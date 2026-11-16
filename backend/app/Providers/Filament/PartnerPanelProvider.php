<?php

namespace App\Providers\Filament;

use App\Filament\Partner\Widgets\PartnerStatsWidget;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

/**
 * Sprint 5 — the panel gym/trainer/shop owners use to manage their own
 * listing, offers, and redemptions. Deliberately id/path 'partner', not
 * 'admin' — Sprint 6's moderation panel gets its own separate provider and
 * `Filament/Admin` resource namespace later.
 */
class PartnerPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('partner')
            ->path('partner')
            ->login()
            ->colors([
                'primary' => Color::hex('#0F6E8C'),
                'danger' => Color::hex('#C23B3B'),
            ])
            ->discoverResources(in: app_path('Filament/Partner/Resources'), for: 'App\\Filament\\Partner\\Resources')
            ->discoverPages(in: app_path('Filament/Partner/Pages'), for: 'App\\Filament\\Partner\\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Partner/Widgets'), for: 'App\\Filament\\Partner\\Widgets')
            ->widgets([
                PartnerStatsWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
