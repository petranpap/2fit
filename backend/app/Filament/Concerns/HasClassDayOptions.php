<?php

namespace App\Filament\Concerns;

/**
 * Shared weekday option list for the FitnessClass "available days"
 * CheckboxList and its table display, used by both Partner's and Admin's
 * FitnessClassResource.
 */
trait HasClassDayOptions
{
    public const DAY_OPTIONS = [
        'monday' => 'Monday',
        'tuesday' => 'Tuesday',
        'wednesday' => 'Wednesday',
        'thursday' => 'Thursday',
        'friday' => 'Friday',
        'saturday' => 'Saturday',
        'sunday' => 'Sunday',
    ];

    protected static function formatDaysOfWeek(?array $days): string
    {
        return $days
            ? collect($days)->map(fn (string $day) => self::DAY_OPTIONS[$day])->join(', ')
            : '—';
    }
}
