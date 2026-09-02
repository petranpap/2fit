<?php

namespace App\Filament\Partner\Resources\GymResource\Pages;

use App\Filament\Partner\Resources\GymResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListGyms extends ListRecords
{
    protected static string $resource = GymResource::class;

    protected function getHeaderActions(): array
    {
        // A partner manages exactly one gym profile — hide "create" once
        // they already have one instead of letting them pile up extras.
        return GymResource::getEloquentQuery()->exists() ? [] : [CreateAction::make()];
    }
}
