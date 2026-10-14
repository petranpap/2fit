<?php

namespace App\Filament\Concerns;

use App\Models\FitnessClass;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Get;

/**
 * A class used to only ever be an indefinite weekly repeat. Owners now pick
 * between a one-off session (a single date) or a recurring one (weekdays +
 * an optional "repeat for N months" bound) — shared by Partner's and
 * Admin's FitnessClassResource. Requires HasClassDayOptions on the same
 * class (uses its DAY_OPTIONS / formatDaysOfWeek()).
 */
trait HasClassRecurrenceFields
{
    protected static function recurrenceFields(): array
    {
        return [
            Select::make('recurrence_type')
                ->label('Session type')
                ->options([
                    'recurring' => 'Recurring — repeats weekly',
                    'one_time' => 'One-time — a single session',
                ])
                ->default('recurring')
                ->live()
                ->required(),
            DatePicker::make('starts_on')
                ->label(fn (Get $get): string => $get('recurrence_type') === 'one_time' ? 'Date' : 'Starts on')
                ->default(now()->toDateString())
                ->required(),
            CheckboxList::make('days_of_week')
                ->label('Available days')
                ->options(self::DAY_OPTIONS)
                ->columns(4)
                ->required(fn (Get $get): bool => $get('recurrence_type') === 'recurring')
                ->visible(fn (Get $get): bool => $get('recurrence_type') === 'recurring')
                ->helperText('Pick every day this class runs — e.g. Monday/Wednesday/Friday for a 3x-a-week class.'),
            Select::make('recurrence_months')
                ->label('Repeat for')
                ->options([
                    1 => '1 month',
                    2 => '2 months',
                    3 => '3 months',
                    6 => '6 months',
                    12 => '12 months',
                ])
                ->placeholder('No end date (ongoing)')
                ->visible(fn (Get $get): bool => $get('recurrence_type') === 'recurring'),
        ];
    }

    protected static function formatSchedule(FitnessClass $record): string
    {
        if ($record->recurrence_type === 'one_time') {
            return $record->starts_on?->format('d M Y') ?? '—';
        }

        $days = self::formatDaysOfWeek($record->days_of_week);

        if ($days === '—') {
            return '—';
        }

        return $days.($record->recurrence_months ? " · {$record->recurrence_months} mo" : ' · ongoing');
    }
}
