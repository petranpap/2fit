<?php

namespace App\Filament\Admin\Resources\TrainerResource\Pages;

use App\Filament\Admin\Resources\TrainerResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTrainers extends ListRecords
{
    protected static string $resource = TrainerResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
