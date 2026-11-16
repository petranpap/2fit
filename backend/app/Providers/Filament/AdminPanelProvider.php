<?php

namespace App\Providers\Filament;

use App\Filament\Admin\Widgets\AdminStatsWidget;
use Filament\Enums\ThemeMode;
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
 * 2Fit Admin Panel
 *
 * Platform moderation:
 * - Approve gym, trainer and shop registrations.
 * - Moderate reviews.
 * - Manage existing admin resources.
 *
 * Admin-only access through User::canAccessPanel.
 * Separate from the Partner Panel.
 */
class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel

            // ADMIN PANEL IDENTIFICATION
            ->id('admin')
            ->path('admin')
            ->brandName('2Fit Admin')

            // ADMIN LOGIN
            ->login()
            ->darkMode(true, isForced: true)
            // SHOW / HIDE PASSWORD (EYE ICON)
            ->revealablePasswords(true)

            // FORGOT PASSWORD
            ->passwordReset()

            // 2FIT BLACK / YELLOW DESIGN
            ->darkMode(true)
            ->defaultThemeMode(ThemeMode::Dark)

            // 2FIT COLORS
            ->colors([
                'primary' => Color::hex('#FFD600'),
                'danger' => Color::hex('#C23B3B'),
                'success' => Color::hex('#22C55E'),
                'warning' => Color::hex('#F59E0B'),
                'info' => Color::hex('#38BDF8'),
            ])

            // EXISTING ADMIN RESOURCES
            ->discoverResources(
                in: app_path('Filament/Admin/Resources'),
                for: 'App\\Filament\\Admin\\Resources'
            )

            // EXISTING ADMIN PAGES
            ->discoverPages(
                in: app_path('Filament/Admin/Pages'),
                for: 'App\\Filament\\Admin\\Pages'
            )

            // ADMIN DASHBOARD
            ->pages([
                Dashboard::class,
            ])

            // EXISTING ADMIN WIDGETS
            ->discoverWidgets(
                in: app_path('Filament/Admin/Widgets'),
                for: 'App\\Filament\\Admin\\Widgets'
            )

            ->widgets([
                AdminStatsWidget::class,
            ])

            // LARAVEL MIDDLEWARE
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

            // ADMIN AUTHENTICATION
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}

