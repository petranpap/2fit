<?php

namespace App\Filament\Partner\Resources\TrainerResource\Pages;

use App\Filament\Partner\Resources\TrainerResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTrainers extends ListRecords
{
    protected static string $resource = TrainerResource::class;

    protected function getHeaderActions(): array
    {
        return TrainerResource::getEloquentQuery()->exists() ? [] : [CreateAction::make()];
    }
}
