<?php

namespace App\Filament\Partner\Resources\GymResource\Pages;

use App\Filament\Partner\Resources\GymResource;
use Filament\Resources\Pages\CreateRecord;

class CreateGym extends CreateRecord
{
    protected static string $resource = GymResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['user_id'] = auth()->id();
        $data['is_active'] = $data['is_active'] ?? true;

        return $data;
    }
}
