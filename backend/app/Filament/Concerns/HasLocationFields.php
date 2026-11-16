<?php

namespace App\Filament\Concerns;

use App\Services\GoogleMapsLinkParser;
use Filament\Forms\Components\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Notifications\Notification;

/**
 * Gym/trainer/shop owners are usually not comfortable looking up raw
 * latitude/longitude — this lets them paste a Google Maps link instead
 * (Share -> Copy link, or just the browser address bar) and have the
 * coordinates filled in automatically. The raw fields stay editable
 * underneath for manual fine-tuning or for whoever does prefer typing
 * exact numbers.
 */
trait HasLocationFields
{
    protected static function locationFields(): array
    {
        return [
            TextInput::make('maps_url')
                ->label('Google Maps link')
                ->live()
                ->dehydrated(false)
                ->columnSpanFull()
                ->placeholder('Paste the link here')
                ->helperText('On Google Maps: find your business, tap Share, copy the link, paste it here — the location below fills in automatically.')
                ->suffixAction(
                    Action::make('detectLocation')
                        ->label('Detect')
                        ->icon('heroicon-m-map-pin')
                        ->action(function (Get $get, Set $set) {
                            $link = trim((string) $get('maps_url'));

                            if ($link === '') {
                                Notification::make()->title('Paste a Google Maps link first')->warning()->send();

                                return;
                            }

                            $coordinates = app(GoogleMapsLinkParser::class)->parse($link);

                            if (! $coordinates) {
                                Notification::make()
                                    ->title("Couldn't read a location from that link")
                                    ->body('Try copying the link again from Google Maps, or fill in the coordinates below by hand.')
                                    ->danger()
                                    ->send();

                                return;
                            }

                            $set('latitude', $coordinates['lat']);
                            $set('longitude', $coordinates['lng']);

                            Notification::make()->title('Location set')->success()->send();
                        })
                ),
            TextInput::make('latitude')
                ->numeric()
                ->step('0.0000001')
                ->helperText('Filled in automatically from the link above.'),
            TextInput::make('longitude')
                ->numeric()
                ->step('0.0000001'),
        ];
    }
}
