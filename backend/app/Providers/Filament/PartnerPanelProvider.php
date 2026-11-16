<?php

namespace App\Providers\Filament;

use App\Filament\Partner\Widgets\PartnerStatsWidget;
use App\Http\Middleware\SetPartnerLocale;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Illuminate\Support\Facades\Blade;

class PartnerPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel

            // PARTNER PANEL
            ->default()
            ->id('partner')
            ->path('partner')
            ->brandName('2Fit Partner')

            // LOGIN
            ->login()

            // PASSWORD VISIBILITY
            ->revealablePasswords(true)

            // FORGOT PASSWORD
            ->passwordReset()

            // BLACK THEME
            ->darkMode(true, isForced: true)

            // 2FIT COLORS
            ->colors([
                'primary' => Color::hex('#FFD600'),
                'danger' => Color::hex('#C23B3B'),
                'success' => Color::hex('#22C55E'),
                'warning' => Color::hex('#F59E0B'),
                'info' => Color::hex('#38BDF8'),
            ])

            // GREEK / ENGLISH SWITCHER
            ->renderHook(
                PanelsRenderHook::TOPBAR_END,
                fn (): string => Blade::render(
                    "@include('partner.language-switcher')"
                )
            )

            // Allow choosing language even before signing in.
            ->renderHook(
                PanelsRenderHook::AUTH_LOGIN_FORM_BEFORE,
                fn (): string => Blade::render(
                    "@include('partner.language-switcher')"
                )
            )

            // PARTNER RESOURCES
            ->discoverResources(
                in: app_path('Filament/Partner/Resources'),
                for: 'App\\Filament\\Partner\\Resources'
            )

            // PARTNER PAGES
            ->discoverPages(
                in: app_path('Filament/Partner/Pages'),
                for: 'App\\Filament\\Partner\\Pages'
            )

            // DASHBOARD
            ->pages([
                Dashboard::class,
            ])

            // PARTNER WIDGETS
            ->discoverWidgets(
                in: app_path('Filament/Partner/Widgets'),
                for: 'App\\Filament\\Partner\\Widgets'
            )

            ->widgets([
                PartnerStatsWidget::class,
            ])

            // MIDDLEWARE
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

                // LANGUAGE
                SetPartnerLocale::class,
            ])

            // AUTHENTICATION
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
