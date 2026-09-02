<?php

namespace App\Filament\Partner\Resources\TrainerResource\Pages;

use App\Filament\Partner\Resources\TrainerResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTrainer extends CreateRecord
{
    protected static string $resource = TrainerResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['user_id'] = auth()->id();
        $data['is_active'] = $data['is_active'] ?? true;

        return $data;
    }
}
