<?php

namespace App\Filament\Partner\Resources\ShopResource\Pages;

use App\Filament\Partner\Resources\ShopResource;
use Filament\Resources\Pages\CreateRecord;

class CreateShop extends CreateRecord
{
    protected static string $resource = ShopResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['user_id'] = auth()->id();
        $data['is_active'] = $data['is_active'] ?? true;

        return $data;
    }
}
