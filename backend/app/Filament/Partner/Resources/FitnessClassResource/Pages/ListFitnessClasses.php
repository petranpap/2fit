<?php

namespace App\Filament\Partner\Resources\FitnessClassResource\Pages;

use App\Filament\Partner\Resources\FitnessClassResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFitnessClasses extends ListRecords
{
    protected static string $resource = FitnessClassResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
