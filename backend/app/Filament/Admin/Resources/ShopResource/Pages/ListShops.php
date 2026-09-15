<?php

namespace App\Filament\Admin\Resources\ShopResource\Pages;

use App\Filament\Admin\Resources\ShopResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListShops extends ListRecords
{
    protected static string $resource = ShopResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
