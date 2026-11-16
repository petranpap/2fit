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
                ->label(__('partner.fields.maps_url'))
                ->live()
                ->dehydrated(false)
                ->columnSpanFull()
                ->placeholder(__('partner.help.maps_placeholder'))
                ->helperText(__('partner.help.maps'))
                ->suffixAction(
                    Action::make('detectLocation')
                        ->label(__('partner.actions.detect'))
                        ->icon('heroicon-m-map-pin')
                        ->action(function (Get $get, Set $set) {
                            $link = trim((string) $get('maps_url'));

                            if ($link === '') {
                                Notification::make()->title(__('partner.messages.maps_missing'))->warning()->send();

                                return;
                            }

                            $coordinates = app(GoogleMapsLinkParser::class)->parse($link);

                            if (! $coordinates) {
                                Notification::make()
                                    ->title(__('partner.messages.maps_invalid'))
                                    ->body(__('partner.messages.maps_retry'))
                                    ->danger()
                                    ->send();

                                return;
                            }

                            $set('latitude', $coordinates['lat']);
                            $set('longitude', $coordinates['lng']);

                            Notification::make()->title(__('partner.messages.maps_set'))->success()->send();
                        })
                ),
            TextInput::make('latitude')->label(__('partner.fields.latitude'))
                ->numeric()
                ->step('0.0000001')
                ->helperText(__('partner.help.maps_auto')),
            TextInput::make('longitude')->label(__('partner.fields.longitude'))
                ->numeric()
                ->step('0.0000001'),
        ];
    }
}
