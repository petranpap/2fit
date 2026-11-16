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
                ->label(__('partner.fields.recurrence_type'))
                ->options([
                    'recurring' => __('partner.options.recurring'),
                    'one_time' => __('partner.options.one_time'),
                ])
                ->default('recurring')
                ->live()
                ->required(),
            DatePicker::make('starts_on')
                ->label(fn (Get $get): string => $get('recurrence_type') === 'one_time' ? __('partner.fields.date') : __('partner.fields.starts_on'))
                ->default(now()->toDateString())
                ->required(),
            CheckboxList::make('days_of_week')
                ->label(__('partner.fields.days_of_week'))
                ->options(self::dayOptions())
                ->columns(4)
                ->required(fn (Get $get): bool => $get('recurrence_type') === 'recurring')
                ->visible(fn (Get $get): bool => $get('recurrence_type') === 'recurring')
                ->helperText(__('partner.help.recurrence')),
            Select::make('recurrence_months')
                ->label(__('partner.fields.recurrence_months'))
                ->options([
                    1 => __('partner.options.one_month'),
                    2 => __('partner.options.two_months'),
                    3 => __('partner.options.three_months'),
                    6 => __('partner.options.six_months'),
                    12 => __('partner.options.twelve_months'),
                ])
                ->placeholder(__('partner.options.ongoing'))
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

        return $days.($record->recurrence_months ? " · {$record->recurrence_months} ".__('partner.schedule.months_short') : ' · '.__('partner.schedule.ongoing'));
    }
}
