<?php

namespace App\Filament\Concerns;

use Filament\Forms\Components\Actions;
use Filament\Forms\Components\Actions\Action;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TimePicker;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Notifications\Notification;
use Illuminate\Support\Str;

/**
 * A day-of-week dropdown-and-clock picker for the `opening_hours` JSON
 * column, replacing a free-text KeyValue field gym/shop owners had to type
 * day names and hour ranges into by hand. Stores
 * {monday: {is_open, opens_at, closes_at}, ...} — dot-notation field names
 * (e.g. "opening_hours.monday.opens_at") map straight onto that nested
 * array automatically, no custom load/save mutators needed.
 */
trait HasOpeningHoursFields
{
    private const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    protected static function openingHoursFields(): array
    {
        return [
            Section::make('Opening hours')
                ->columns(1)
                ->schema([
                    Grid::make(3)
                        ->schema([
                            TimePicker::make('bulk_opens_at')
                                ->label('Opens at')
                                ->seconds(false)
                                ->dehydrated(false),
                            TimePicker::make('bulk_closes_at')
                                ->label('Closes at')
                                ->seconds(false)
                                ->dehydrated(false),
                            Actions::make([
                                Action::make('copyToAllDays')
                                    ->label('Copy to all days')
                                    ->icon('heroicon-m-clipboard-document')
                                    ->action(function (Get $get, Set $set) {
                                        $opensAt = $get('bulk_opens_at');
                                        $closesAt = $get('bulk_closes_at');

                                        if (! $opensAt || ! $closesAt) {
                                            Notification::make()
                                                ->title('Set both times above first')
                                                ->warning()
                                                ->send();

                                            return;
                                        }

                                        foreach (self::DAYS as $day) {
                                            $set("opening_hours.{$day}.is_open", true);
                                            $set("opening_hours.{$day}.opens_at", $opensAt);
                                            $set("opening_hours.{$day}.closes_at", $closesAt);
                                        }

                                        Notification::make()
                                            ->title('Applied to every day — edit any day below to fine-tune it')
                                            ->success()
                                            ->send();
                                    }),
                            ])->verticalAlignment('center'),
                        ]),
                    ...collect(self::DAYS)
                        ->map(fn (string $day) => Grid::make(4)->schema([
                            Toggle::make("opening_hours.{$day}.is_open")
                                ->label(Str::ucfirst($day))
                                ->live()
                                ->default(false),
                            TimePicker::make("opening_hours.{$day}.opens_at")
                                ->label('Opens at')
                                ->seconds(false)
                                ->required()
                                ->visible(fn (Get $get): bool => (bool) $get("opening_hours.{$day}.is_open")),
                            TimePicker::make("opening_hours.{$day}.closes_at")
                                ->label('Closes at')
                                ->seconds(false)
                                ->required()
                                ->after("opening_hours.{$day}.opens_at")
                                ->visible(fn (Get $get): bool => (bool) $get("opening_hours.{$day}.is_open")),
                        ]))
                        ->all(),
                ]),
        ];
    }
}
